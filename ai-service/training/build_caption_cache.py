from __future__ import annotations

import argparse
import csv
import logging
from pathlib import Path
from typing import Optional, Set

from app.florence.caption import generate_caption
from app.processing.extract_attributes import extract_attributes
from app.processing.text_builder import build_pt_caption
from app.processing.translate import translate_attributes
from training.stanford_dogs_dataset import scan_dataset

logger = logging.getLogger(__name__)

CSV_FIELDNAMES = ["image_path", "caption"]


def _load_already_processed(cache_path: Path) -> Set[str]:
    #Lê o CSV existente (se houver) e devolve o conjunto de `image_path` já processados
    if not cache_path.is_file():
        return set()

    processed: Set[str] = set()
    with cache_path.open("r", encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            processed.add(row["image_path"])

    logger.info("Cache existente encontrado: %d imagens já processadas.", len(processed))
    return processed


def build_caption_cache(
    stanford_dogs_root: Path,
    output_csv: Path,
    detail_level: str = "detailed",
    flush_every: int = 50,
    limit: Optional[int] = None,
) -> None:
    #Gera o cache de legendas para o Stanford Dogs.
    images_dir = stanford_dogs_root / "Images"
    all_samples = scan_dataset(images_dir)

    already_processed = _load_already_processed(output_csv)
    pending = [s for s in all_samples if s[1] not in already_processed]

    if limit is not None:
        pending = pending[:limit]

    logger.info(
        "%d imagens no total, %d já processadas, %d pendentes nesta execução.",
        len(all_samples),
        len(already_processed),
        len(pending),
    )

    if not pending:
        logger.info("Nada a fazer — o cache já cobre todas as imagens pedidas.")
        return

    file_exists = output_csv.is_file()
    output_csv.parent.mkdir(parents=True, exist_ok=True)

    csv_file = output_csv.open("a" if file_exists else "w", encoding="utf-8", newline="")
    writer = csv.DictWriter(csv_file, fieldnames=CSV_FIELDNAMES)
    if not file_exists:
        writer.writeheader()

    iterator = pending
    try:
        from tqdm import tqdm

        iterator = tqdm(pending, desc="Gerando legendas", unit="img")
    except ImportError:
        logger.warning("Pacote 'tqdm' não instalado — rodando sem barra de progresso.")

    processed_since_flush = 0
    total_ok = 0
    total_failed = 0

    try:
        for image_path, relative_path, _breed in iterator:
            try:
                caption_en = generate_caption(image_path, detail_level=detail_level)
                attributes = extract_attributes(caption_en)
                translated = translate_attributes(attributes)
                caption_pt = build_pt_caption(translated["color"], translated["size"])

                writer.writerow({"image_path": relative_path, "caption": caption_pt})
                total_ok += 1
            except Exception as exc:
                # Uma imagem corrompida ou uma falha pontual do Florence não derruba o processo
                logger.warning("Falha ao processar '%s': %s", relative_path, exc)
                total_failed += 1
                continue

            processed_since_flush += 1
            if processed_since_flush >= flush_every:
                csv_file.flush()
                processed_since_flush = 0
    finally:
        csv_file.flush()
        csv_file.close()

    logger.info("Concluído: %d legendas geradas, %d falhas.", total_ok, total_failed)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera o cache de legendas do Stanford Dogs via Florence-2.")
    parser.add_argument("stanford_dogs_root", type=Path, help="Pasta raiz do Stanford Dogs (contém Images/)")
    parser.add_argument("output_csv", type=Path, help="Caminho do CSV de saída (cache de legendas)")
    parser.add_argument(
        "--detail-level",
        default="detailed",
        choices=["simple", "detailed", "more_detailed"],
        help="Nível de detalhe da legenda do Florence-2 (padrão: detailed)",
    )
    parser.add_argument("--flush-every", type=int, default=50, help="Grava no disco a cada N imagens (padrão: 50)")
    parser.add_argument("--limit", type=int, default=None, help="Processa só as N primeiras imagens pendentes (teste rápido)")
    return parser.parse_args()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    args = _parse_args()
    build_caption_cache(
        stanford_dogs_root=args.stanford_dogs_root,
        output_csv=args.output_csv,
        detail_level=args.detail_level,
        flush_every=args.flush_every,
        limit=args.limit,
    )
