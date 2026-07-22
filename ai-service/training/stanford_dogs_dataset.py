from __future__ import annotations

import csv
import logging
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Dict, List, Optional, Sequence, Tuple

import torch
from torch.utils.data import Dataset

from app.clip.image_embedding import load_image_as_rgb

logger = logging.getLogger(__name__)


# Templates de fallback (usados apenas quando não há legenda no cache)
FALLBACK_CAPTION_TEMPLATES: Tuple[str, ...] = (
    "a photo of a {breed}, a dog.",
    "a photo of a dog of breed {breed}.",
    "this is a {breed}, a type of dog.",
    "a close-up photo of a {breed} dog.",
)


def build_fallback_caption(breed: str, rng: Optional[random.Random] = None) -> str:
    #Gera uma legenda simples baseada só no nome da raça (sem Florence)
    rng = rng or random
    template = rng.choice(FALLBACK_CAPTION_TEMPLATES)
    return template.format(breed=breed)


# Utilitários de parsing do Stanford Dogs
def _parse_breed_from_folder(folder_name: str) -> str:
    #Extrai o nome da raça a partir do nome da pasta do Stanford Dogs.
    _, _, raw_name = folder_name.partition("-")
    if not raw_name:
        raw_name = folder_name  # formato inesperado: usa a pasta inteira
    return raw_name.replace("_", " ").strip()


def _load_official_split(root_dir: Path, split: str) -> Optional[set]:
    
    mat_filename = "train_list.mat" if split == "train" else "test_list.mat"
    mat_path = root_dir / "lists" / mat_filename

    if not mat_path.is_file():
        logger.warning(
            "Split oficial '%s' não encontrado em '%s'. "
            "Usando divisão aleatória como alternativa.",
            split,
            mat_path,
        )
        return None

    try:
        from scipy.io import loadmat
    except ImportError:
        logger.warning(
            "Pacote 'scipy' não instalado — não é possível ler '%s'. "
            "Instale com 'pip install scipy' para usar o split oficial, "
            "ou prossiga com a divisão aleatória.",
            mat_path,
        )
        return None

    mat_data = loadmat(str(mat_path))
    file_list = mat_data["file_list"].ravel()

    relative_paths = {str(entry[0]) for entry in file_list}
    return relative_paths


def scan_dataset(images_dir: Path) -> List[Tuple[Path, str, str]]:
    if not images_dir.is_dir():
        raise FileNotFoundError(
            f"Pasta de imagens do Stanford Dogs não encontrada: '{images_dir}'. "
            "Baixe o dataset em http://vision.stanford.edu/aditya86/ImageNetDogs/ "
            "e aponte 'root_dir' para a pasta que contém 'Images/'."
        )

    samples: List[Tuple[Path, str, str]] = []
    valid_extensions = {".jpg", ".jpeg", ".png"}

    for class_dir in sorted(images_dir.iterdir()):
        if not class_dir.is_dir():
            continue

        breed = _parse_breed_from_folder(class_dir.name)

        for image_path in sorted(class_dir.iterdir()):
            if image_path.suffix.lower() not in valid_extensions:
                continue
            relative_path = f"{class_dir.name}/{image_path.name}"
            samples.append((image_path, relative_path, breed))

    if not samples:
        raise FileNotFoundError(
            f"Nenhuma imagem encontrada em '{images_dir}'. Verifique se o "
            "dataset foi extraído corretamente."
        )

    return samples


def _load_caption_cache(cache_path: Optional[Path]) -> Dict[str, str]:
    #Carrega o cache de legendas gerado por `build_caption_cache.py` (Florence-2 + text_builder)
    if cache_path is None:
        logger.warning(
            "Nenhum 'caption_cache_path' informado — todas as legendas "
            "serão geradas por template (sem Florence-2)."
        )
        return {}

    if not cache_path.is_file():
        logger.warning(
            "Cache de legendas '%s' não encontrado — todas as legendas "
            "serão geradas por template (sem Florence-2). Rode "
            "'build_caption_cache.py' para gerar legendas reais com o "
            "Florence-2.",
            cache_path,
        )
        return {}

    captions: Dict[str, str] = {}
    with cache_path.open("r", encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames is None or "image_path" not in reader.fieldnames or "caption" not in reader.fieldnames:
            raise ValueError(
                f"Cache de legendas '{cache_path}' com formato inválido. "
                "Esperado cabeçalho 'image_path,caption'."
            )
        for row in reader:
            captions[row["image_path"]] = row["caption"]

    logger.info("Cache de legendas carregado: %d entradas de '%s'.", len(captions), cache_path)
    return captions



# Dataset
@dataclass
class CaptionSourceStats:

    from_cache: int = 0
    from_fallback: int = 0

    @property
    def total(self) -> int:
        return self.from_cache + self.from_fallback

    @property
    def cache_coverage(self) -> float:
        return self.from_cache / self.total if self.total else 0.0


class StanfordDogsDataset(Dataset):

    def __init__(
        self,
        root_dir: str | Path,
        image_transform: Callable,
        tokenizer: Callable,
        split: str = "train",
        caption_cache_path: Optional[str | Path] = None,
        use_official_split: bool = True,
        max_samples_per_class: Optional[int] = None,
        val_fraction: float = 0.1,
        seed: int = 42,
    ) -> None:
        
        if split not in ("train", "val", "test"):
            raise ValueError(f"split inválido: '{split}'. Use 'train', 'val' ou 'test'.")

        self.root_dir = Path(root_dir)
        self.images_dir = self.root_dir / "Images"
        self.image_transform = image_transform
        self.tokenizer = tokenizer
        self.split = split
        self.seed = seed

        self._rng = random.Random(seed)
        self._caption_rng = random.Random(seed + 1)
        self.stats = CaptionSourceStats()

        all_samples = scan_dataset(self.images_dir)

        official_test_paths = (
            _load_official_split(self.root_dir, "test") if use_official_split else None
        )

        if official_test_paths is not None:
            test_samples = [s for s in all_samples if s[1] in official_test_paths]
            trainval_samples = [s for s in all_samples if s[1] not in official_test_paths]
        else:
            # Sem split oficial: separa 20% para teste de forma aleatória e reprodutível (mesma seed)
            shuffled = all_samples.copy()
            self._rng.shuffle(shuffled)
            cut = int(len(shuffled) * 0.8)
            trainval_samples, test_samples = shuffled[:cut], shuffled[cut:]

        if split == "test":
            selected_samples = test_samples
        else:
            # Particiona trainval em train/val de forma determinística.
            shuffled_trainval = trainval_samples.copy()
            self._rng.shuffle(shuffled_trainval)
            val_cut = int(len(shuffled_trainval) * val_fraction)
            val_samples = shuffled_trainval[:val_cut]
            train_samples = shuffled_trainval[val_cut:]
            selected_samples = val_samples if split == "val" else train_samples

        if max_samples_per_class is not None:
            selected_samples = self._limit_per_class(selected_samples, max_samples_per_class)

        self.samples: List[Tuple[Path, str, str]] = selected_samples
        self.caption_cache = _load_caption_cache(
            Path(caption_cache_path) if caption_cache_path else None
        )
        self.class_names: List[str] = sorted({breed for _, _, breed in all_samples})

        logger.info(
            "StanfordDogsDataset[%s]: %d imagens, %d raças.",
            split,
            len(self.samples),
            len(self.class_names),
        )

    @staticmethod
    def _limit_per_class(
        samples: List[Tuple[Path, str, str]], max_per_class: int
    ) -> List[Tuple[Path, str, str]]:
        counts: Dict[str, int] = {}
        limited: List[Tuple[Path, str, str]] = []
        for sample in samples:
            breed = sample[2]
            if counts.get(breed, 0) >= max_per_class:
                continue
            counts[breed] = counts.get(breed, 0) + 1
            limited.append(sample)
        return limited

    def get_class_names(self) -> List[str]:
        #Retorna a lista ordenada de todas as raças presentes no dataset
        return self.class_names

    def __len__(self) -> int:
        return len(self.samples)

    def _get_caption(self, relative_path: str, breed: str) -> str:
        cached = self.caption_cache.get(relative_path)
        if cached:
            self.stats.from_cache += 1
            return cached

        self.stats.from_fallback += 1
        return build_fallback_caption(breed, rng=self._caption_rng)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, torch.Tensor, str, str]:
        image_path, relative_path, breed = self.samples[index]

        pil_image = load_image_as_rgb(image_path)
        image_tensor = self.image_transform(pil_image)

        caption = self._get_caption(relative_path, breed)
        text_tokens = self.tokenizer([caption])[0]  # tokenizer do OpenCLIP espera uma lista

        return image_tensor, text_tokens, breed, caption


# Execução direta: smoke test manual
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        print("Uso: python -m training.stanford_dogs_dataset <root_dir> [caption_cache.csv]")
        sys.exit(1)

    from app.clip.model import get_preprocess, get_tokenizer

    dataset_root = sys.argv[1]
    cache = sys.argv[2] if len(sys.argv) > 2 else None

    ds = StanfordDogsDataset(
        root_dir=dataset_root,
        image_transform=get_preprocess(),
        tokenizer=get_tokenizer(),
        split="train",
        caption_cache_path=cache,
    )

    print(f"Total de amostras (train): {len(ds)}")
    print(f"Raças: {len(ds.get_class_names())}")

    img, txt, breed, caption = ds[0]
    print(f"Exemplo -> raça: {breed} | legenda: {caption!r} | shape imagem: {tuple(img.shape)}")
    print(f"Estatísticas de origem das legendas: {ds.stats}")
