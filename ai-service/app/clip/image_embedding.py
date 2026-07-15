
#Responsável por transformar uma imagem em um vetor de
#embedding usando o OpenCLIP:

#Funções expostas:
#    - load_image_as_rgb()
#    - generate_image_embedding()
#    - generate_image_embeddings()


from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import List, Sequence, Union

import numpy as np
import torch
from PIL import Image, UnidentifiedImageError

from .model import get_device, get_model, get_preprocess

logger = logging.getLogger(__name__)


# Tipos aceitos como entrada de imagem em todo o pipeline de embeddings.
# Mantemos essa flexibilidade porque a imagem pode chegar de formas
# diferentes dependendo de quem chama: upload via FastAPI (bytes),
# processamento em lote a partir do disco (str/Path), etc
ImageInput = Union[str, Path, bytes, Image.Image, np.ndarray]

# Carregamento e normalização de imagens
# ---------------------------------------------------------------------------
def load_image_as_rgb(image: ImageInput) -> Image.Image:
   
   # Carrega uma imagem a partir de diferentes formatos de entrada e
   # garante que o resultado final esteja sempre em modo RGB, que é o
   # formato esperado pelo `preprocess` do OpenCLIP.

    #Trata explicitamente os seguintes casos:
     #   - RGB: retornado como está (apenas copiado).
     #  - RGBA / paleta com transparência (P): composto sobre um fundo
     #     branco antes da conversão, evitando que a transparência vire
     #     preto por padrão.
     #   - Escala de cinza (L) / L com alpha (LA) / CMYK: convertido
     #     diretamente para RGB.

    #Retorna:
     #   PIL.Image.Image em modo RGB.

    #Lança:
     #   ValueError: se o tipo de entrada não for suportado.
      #  UnidentifiedImageError: se os bytes/arquivo não forem uma
       #     imagem válida.
    
    pil_image: Image.Image

    if isinstance(image, Image.Image):
        pil_image = image

    elif isinstance(image, (str, Path)):
        path = Path(image)
        if not path.is_file():
            raise FileNotFoundError(f"Arquivo de imagem não encontrado: {path}")
        pil_image = Image.open(path)
        pil_image.load()  # força leitura imediata, evita erro tardio de arquivo fechado

    elif isinstance(image, bytes):
        try:
            pil_image = Image.open(io.BytesIO(image))
            pil_image.load()
        except UnidentifiedImageError as exc:
            raise UnidentifiedImageError(
                "Não foi possível decodificar os bytes fornecidos como imagem."
            ) from exc

    elif isinstance(image, np.ndarray):
        pil_image = Image.fromarray(image)

    else:
        raise ValueError(
            f"Tipo de imagem não suportado: {type(image)!r}. "
            "Use str, Path, bytes, PIL.Image.Image ou numpy.ndarray."
        )

    return _normalize_color_mode(pil_image)


def _normalize_color_mode(image: Image.Image) -> Image.Image:
    """
    Garante que a imagem final esteja em RGB, tratando corretamente
    canais de transparência (RGBA, P) e escala de cinza (L, LA, CMYK).
    """
    mode = image.mode

    if mode == "RGB":
        return image.copy()

    if mode in ("RGBA", "LA") or (mode == "P" and "transparency" in image.info):
        # Compõe sobre fundo branco para não perder informação visual
        # relevante (ex.: fotos de cães com fundo transparente em PNG).
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, (255, 255, 255))
        background.paste(rgba, mask=rgba.split()[-1])
        return background

    # Cobre "L" (escala de cinza), "P" sem transparência, "CMYK", "1", etc.
    return image.convert("RGB")


# Normalização L2
# ---------------------------------------------------------------------------
def _l2_normalize(vectors: np.ndarray) -> np.ndarray:
    """
    Normaliza um array de vetores (1D ou 2D) para norma L2 unitária.
    A normalização é essencial para que a similaridade de cosseno entre
    embeddings seja equivalente ao produto interno, o que é usado tanto
    em `similarity.py` quanto na busca por vizinhos no ChromaDB.
    """
    if vectors.ndim == 1:
        norm = np.linalg.norm(vectors)
        return vectors / norm if norm > 0 else vectors

    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0  # evita divisão por zero em vetores nulos
    return vectors / norms


# Geração de embeddings
# ---------------------------------------------------------------------------
def generate_image_embedding(image: ImageInput, normalize: bool = True) -> np.ndarray:
   
    #Gera o embedding de uma única imagem.
     #   Imagem -> OpenCLIP -> vetor

    #Parâmetros:
    #   image: imagem de entrada (ver `ImageInput`).
    #    normalize: se True (padrão), aplica normalização L2 ao vetor
    #               resultante.
    #Retorna:
    #    numpy.ndarray 1D com o embedding da imagem (float32).
    
    embeddings = generate_image_embeddings([image], normalize=normalize)
    return embeddings[0]


def generate_image_embeddings(
    images: Sequence[ImageInput],
    normalize: bool = True,
    skip_errors: bool = False,
) -> np.ndarray:
   # """
    #Gera embeddings para uma lista de imagens em uma única passagem
    #pelo modelo (um único forward). Indicado para uso em requisições
    #da API (ex.: comparar uma foto enviada contra a base) ou listas
    #pequenas/médias de imagens.

    #Parâmetros:
     #   images: lista de imagens de entrada (ver `ImageInput`).
      #  normalize: se True (padrão), aplica normalização L2 a cada vetor.
       # skip_errors: se True, imagens que falharem ao carregar são
        #             ignoradas (com log de aviso) em vez de interromper
         #           onde um arquivo corrompido não deve derrubar o job.

    #Retorna:
     #   numpy.ndarray 2D de shape (N, D), onde N é o número de imagens
    #Lança:
    #ValueError: se `images` estiver vazio, ou se todas as imagens falharem ao carregar.
   
    if not images:
        raise ValueError("A lista de imagens está vazia.")

    model = get_model()
    preprocess = get_preprocess()
    device = get_device()

    tensors: List[torch.Tensor] = []

    for index, raw_image in enumerate(images):
        try:
            pil_image = load_image_as_rgb(raw_image)
            tensors.append(preprocess(pil_image))
        except Exception as exc:
            if skip_errors:
                logger.warning(
                    "Falha ao carregar imagem no índice %d, pulando: %s", index, exc
                )
                continue
            raise

    if not tensors:
        raise ValueError("Nenhuma imagem pôde ser carregada com sucesso.")

    batch = torch.stack(tensors).to(device)

    with torch.no_grad():
        image_features = model.encode_image(batch)

    embeddings = image_features.float().cpu().numpy()

    if normalize:
        embeddings = _l2_normalize(embeddings)

    return embeddings


# Execução direta: smoke test manual
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        print("Uso: python -m src.ai.clip.image_embedding <caminho_da_imagem>")
        sys.exit(1)

    vector = generate_image_embedding(sys.argv[1])
    print(f"Shape do embedding: {vector.shape}")
    print(f"Norma L2 (deve ser ~1.0): {np.linalg.norm(vector):.4f}")
