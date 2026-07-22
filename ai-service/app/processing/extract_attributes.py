from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Optional


# Vocabulários controlados
COLOR_KEYWORDS: List[str] = [
    "black and white",
    "brown and white",
    "black and tan",
    "reddish brown",
    "golden brown",
    "light brown",
    "dark brown",
    "black",
    "white",
    "brown",
    "tan",
    "golden",
    "gray",
    "grey",
    "cream",
    "red",
    "fawn",
    "brindle",
    "spotted",
    "yellow",
    "orange",
    "chocolate",
    "silver",
    "beige",
]

# Cada porte tem uma lista de sinônimos/variações que o Florence-2 pode usar na legenda gerada.
SIZE_KEYWORDS: Dict[str, List[str]] = {
    "small": ["small", "tiny", "little", "miniature"],
    "medium": ["medium-sized", "medium sized", "medium"],
    "large": ["large", "big", "giant", "huge"],
}


@dataclass
class ExtractedAttributes:
    """Atributos extraídos de uma legenda, junto com o texto original."""

    color: Optional[str]
    size: Optional[str]
    raw_caption: str

    def to_dict(self) -> Dict[str, Optional[str]]:
        return {"color": self.color, "size": self.size}

    @property
    def is_complete(self) -> bool:
        """True se tanto cor quanto porte foram identificados."""
        return self.color is not None and self.size is not None


def _find_first_keyword(text: str, keywords: List[str]) -> Optional[str]:
   
    for keyword in keywords:
        pattern = r"\b" + re.escape(keyword) + r"\b"
        if re.search(pattern, text):
            return keyword
    return None


def extract_color(caption: str) -> Optional[str]:
    """Retorna a primeira cor reconhecida na legenda, ou None se nenhuma for encontrada."""
    return _find_first_keyword(caption.lower(), COLOR_KEYWORDS)


def extract_size(caption: str) -> Optional[str]:
    """Retorna o porte normalizado ('small' / 'medium' / 'large'), ou None."""
    text = caption.lower()
    for size_label, synonyms in SIZE_KEYWORDS.items():
        if _find_first_keyword(text, synonyms):
            return size_label
    return None


def extract_attributes(caption: str) -> ExtractedAttributes:
   
    return ExtractedAttributes(
        color=extract_color(caption),
        size=extract_size(caption),
        raw_caption=caption,
    )


# Execução direta: smoke test manual
if __name__ == "__main__":
    examples = [
        "A medium-sized black dog with white paws standing on the grass.",
        "A small tan dog sitting on a wooden chair.",
        "A large golden brown dog running on the beach.",
        "A dog looking at the camera.",  # sem cor/porte identificáveis
    ]

    for example in examples:
        attributes = extract_attributes(example)
        print(f"{example!r}\n  -> {attributes.to_dict()} (completo: {attributes.is_complete})\n")
