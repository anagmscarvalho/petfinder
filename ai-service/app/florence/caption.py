from __future__ import annotations

import logging
from typing import List, Sequence

import torch

from app.clip.image_embedding import ImageInput, load_image_as_rgb

from .model import get_device, get_dtype, get_model, get_processor

logger = logging.getLogger(__name__)


# 3 níveis de detalhe para a legenda
_TASK_TOKENS = {
    "simple": "<CAPTION>",
    "detailed": "<DETAILED_CAPTION>",
    "more_detailed": "<MORE_DETAILED_CAPTION>",
}


DEFAULT_DETAIL_LEVEL = "detailed"


def generate_caption(
    image: ImageInput,
    detail_level: str = DEFAULT_DETAIL_LEVEL,
    max_new_tokens: int = 256,
    num_beams: int = 3,
) -> str:
    
    if detail_level not in _TASK_TOKENS:
        raise ValueError(
            f"detail_level inválido: '{detail_level}'. "
            f"Use um destes: {list(_TASK_TOKENS)}."
        )

    task_prompt = _TASK_TOKENS[detail_level]

    pil_image = load_image_as_rgb(image)

    model = get_model()
    processor = get_processor()
    device = get_device()
    dtype = get_dtype()

    inputs = processor(text=task_prompt, images=pil_image, return_tensors="pt")

    # pixel_values precisa ir no mesmo dtype do modelo 
    # input_ids é inteiro e deve permanecer como está, só mudando de device.
    prepared_inputs = {}
    for key, value in inputs.items():
        if torch.is_tensor(value) and torch.is_floating_point(value):
            prepared_inputs[key] = value.to(device=device, dtype=dtype)
        else:
            prepared_inputs[key] = value.to(device=device)

    try:
        with torch.no_grad():
            generated_ids = model.generate(
                input_ids=prepared_inputs["input_ids"],
                pixel_values=prepared_inputs["pixel_values"],
                max_new_tokens=max_new_tokens,
                num_beams=num_beams,
                do_sample=False,
            )
    except Exception as exc:
        logger.exception("Falha ao gerar legenda com o Florence-2.")
        raise RuntimeError("Falha ao gerar legenda com o Florence-2.") from exc

    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]

    parsed = processor.post_process_generation(
        generated_text,
        task=task_prompt,
        image_size=(pil_image.width, pil_image.height),
    )

    caption = parsed[task_prompt].strip()
    return caption


def generate_captions(
    images: Sequence[ImageInput],
    detail_level: str = DEFAULT_DETAIL_LEVEL,
    max_new_tokens: int = 256,
    num_beams: int = 3,
    skip_errors: bool = False,
) -> List[str]:
    
    captions: List[str] = []

    for index, image in enumerate(images):
        try:
            caption = generate_caption(
                image,
                detail_level=detail_level,
                max_new_tokens=max_new_tokens,
                num_beams=num_beams,
            )
            captions.append(caption)
        except Exception as exc:
            if skip_errors:
                logger.warning(
                    "Falha ao gerar legenda para imagem no índice %d, pulando: %s",
                    index,
                    exc,
                )
                captions.append("")
                continue
            raise

    return captions



# Execução direta: smoke test manual
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) < 2:
        print("Uso: python -m app.florence.caption <caminho_da_imagem> [detail_level]")
        sys.exit(1)

    level = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_DETAIL_LEVEL
    result = generate_caption(sys.argv[1], detail_level=level)
    print(result)
