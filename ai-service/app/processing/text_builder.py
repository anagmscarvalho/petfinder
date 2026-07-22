from __future__ import annotations

from typing import Optional


def build_pt_caption(color: Optional[str], size: Optional[str]) -> str:
    
    #Monta a legenda final em português
    parts = ["cachorro"]
    if color:
        parts.append(f"cor: {color}")
    if size:
        parts.append(f"porte: {size}")
    return "; ".join(parts)


# Execução direta: smoke test manual
if __name__ == "__main__":
    print(build_pt_caption("preto", "médio"))
    print(build_pt_caption("branco", None))
    print(build_pt_caption(None, None))
