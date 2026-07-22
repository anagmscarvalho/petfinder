from __future__ import annotations

import logging
from pathlib import Path
from typing import List, Sequence

import numpy as np

from .image_embedding import ImageInput, generate_image_embeddings

logger = logging.getLogger(__name__)


DEFAULT_BATCH_SIZE = 64


def generate_image_embeddings_in_batches(
    images: Sequence[ImageInput],
    batch_size: int = DEFAULT_BATCH_SIZE,
    normalize: bool = True,
    skip_errors: bool = True,
    show_progress: bool = True,
) -> np.ndarray:
    
    if not images:
        raise ValueError("A lista de imagens está vazia.")

    batches = [images[i : i + batch_size] for i in range(0, len(images), batch_size)]

    iterator = batches
    if show_progress:
        try:
            from tqdm import tqdm

            iterator = tqdm(batches, desc="Gerando embeddings", unit="lote")
        except ImportError:
            logger.warning(
                "Pacote 'tqdm' não instalado — rodando sem barra de progresso "
                "(pip install tqdm para habilitar)."
            )

    all_embeddings: List[np.ndarray] = []
    total_skipped_batches = 0

    for batch_index, batch in enumerate(iterator):
        try:
            batch_embeddings = generate_image_embeddings(
                batch, normalize=normalize, skip_errors=skip_errors
            )
            all_embeddings.append(batch_embeddings)
        except ValueError as exc:
            # Lote inteiro falhou; Registra e segue para o próximo lote em vez de interromper o processamento de milhares de imagens.
            logger.warning("Lote %d falhou por completo, pulando: %s", batch_index, exc)
            total_skipped_batches += 1
            continue

    if not all_embeddings:
        raise ValueError("Nenhuma imagem pôde ser processada com sucesso em nenhum lote.")

    if total_skipped_batches:
        logger.warning("%d lote(s) falharam por completo e foram pulados.", total_skipped_batches)

    return np.concatenate(all_embeddings, axis=0)


# Execução direta: smoke test manual
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        print("Uso: python -m app.clip.batch_embedding <pasta_com_imagens>")
        sys.exit(1)

    folder = Path(sys.argv[1])
    image_paths = sorted(
        p for p in folder.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png"}
    )
    print(f"Encontradas {len(image_paths)} imagens em '{folder}'.")

    result_embeddings = generate_image_embeddings_in_batches(image_paths)
    print(f"Shape final: {result_embeddings.shape}")
