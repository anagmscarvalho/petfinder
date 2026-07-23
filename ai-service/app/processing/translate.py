from __future__ import annotations

import logging
from typing import Dict, Optional

from .extract_attributes import COLOR_KEYWORDS, ExtractedAttributes, SIZE_KEYWORDS

logger = logging.getLogger(__name__)


# Tabelas de tradução
COLOR_TRANSLATIONS: Dict[str, str] = {
    "black and white": "preto e branco",
    "brown and white": "marrom e branco",
    "black and tan": "preto e caramelo",
    "reddish brown": "marrom avermelhado",
    "golden brown": "marrom dourado",
    "light brown": "marrom claro",
    "dark brown": "marrom escuro",
    "black": "preto",
    "white": "branco",
    "brown": "marrom",
    "tan": "caramelo",
    "golden": "dourado",
    "gray": "cinza",
    "grey": "cinza",
    "cream": "creme",
    "red": "vermelho",
    "fawn": "fulvo",
    "brindle": "atigrado",
    "spotted": "malhado",
    "yellow": "amarelo",
    "orange": "laranja",
    "chocolate": "chocolate",
    "silver": "prateado",
    "beige": "bege",
}

SIZE_TRANSLATIONS: Dict[str, str] = {
    "small": "pequeno",
    "medium": "médio",
    "large": "grande",
}


def translate_color(color: Optional[str]) -> Optional[str]:
    """Traduz um valor de cor (em inglês, vindo de `extract_color`) para português."""
    if color is None:
        return None

    translated = COLOR_TRANSLATIONS.get(color.lower())
    if translated is None:
        logger.warning("Cor '%s' sem tradução cadastrada em COLOR_TRANSLATIONS.", color)
    return translated


def translate_size(size: Optional[str]) -> Optional[str]:
    """Traduz um valor de porte (em inglês, vindo de `extract_size`) para português."""
    if size is None:
        return None

    translated = SIZE_TRANSLATIONS.get(size.lower())
    if translated is None:
        logger.warning("Porte '%s' sem tradução cadastrada em SIZE_TRANSLATIONS.", size)
    return translated


def translate_attributes(attributes: ExtractedAttributes) -> Dict[str, Optional[str]]:
    
    return {
        "color": translate_color(attributes.color),
        "size": translate_size(attributes.size),
    }


def _check_translation_coverage() -> None:

    missing_colors = [c for c in COLOR_KEYWORDS if c not in COLOR_TRANSLATIONS]
    missing_sizes = [s for s in SIZE_KEYWORDS if s not in SIZE_TRANSLATIONS]

    if missing_colors:
        logger.warning("Cores sem tradução cadastrada em COLOR_TRANSLATIONS: %s", missing_colors)
    if missing_sizes:
        logger.warning("Portes sem tradução cadastrada em SIZE_TRANSLATIONS: %s", missing_sizes)


_check_translation_coverage()


# Execução direta: smoke test manual
if __name__ == "__main__":
    from .extract_attributes import extract_attributes

    examples = [
        "A medium-sized black dog with white paws standing on the grass.",
        "A small tan dog sitting on a wooden chair.",
        "A large golden brown dog running on the beach.",
    ]

    for example in examples:
        attrs = extract_attributes(example)
        translated = translate_attributes(attrs)
        print(f"{example!r}\n  -> EN: {attrs.to_dict()}\n  -> PT: {translated}\n")
