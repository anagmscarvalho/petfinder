"""
app/api/schemas.py

Schemas Pydantic (request/response) dos endpoints do serviço de IA.

`pet_id` é sempre `int` — confirmado lendo `backend/ia_falsa.py` e
`backend/app/services/ia.py` (branch `backend`): é o id autoincrementado
da tabela `pets` no SQLite do backend, não um UUID.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class OkResponse(BaseModel):
    """Resposta mínima de confirmação — mesmo formato de backend/ia_falsa.py ({"ok": true})."""

    ok: bool = True


class PetMatchResponse(BaseModel):
    """Um pet candidato retornado por /compare ou /search."""

    pet_id: int
    score: float = Field(
        ...,
        description="Similaridade de cosseno (aprox. 0 a 1). Campo exigido pelo "
        "contrato do backend — é o que services/ia.py:buscar_similares() lê.",
    )
    similarity_percentage: float = Field(
        ...,
        ge=0,
        le=100,
        description="Mesma similaridade, em %. Campo extra — não lido pelo backend hoje, "
        "mas útil se a UI quiser exibir direto.",
    )
    color: Optional[str] = None
    size: Optional[str] = None


class CompareImageResponse(BaseModel):
    """
    Resposta de POST /compare.

    O campo `matches` é o único que o backend de fato lê hoje
    (`resposta.json().get("matches", [])` em services/ia.py) — os
    campos `detected_color`/`detected_size` são extras, ignorados por
    quem só olha `matches`.
    """

    matches: List[PetMatchResponse]
    detected_color: Optional[str] = None
    detected_size: Optional[str] = None


class TextSearchRequest(BaseModel):
    """
    Corpo de POST /search — busca por descrição em texto livre.

    Endpoint extra: ainda não existe uma função equivalente a
    `buscar_similares()` para texto em `backend/app/services/ia.py`.
    Fica pronto para quando o backend adicionar essa chamada.
    """

    query: str = Field(..., min_length=1, max_length=300, examples=["cachorro preto de porte médio"])
    match_count: int = Field(20, ge=1, le=100)


class TextSearchResponse(BaseModel):
    matches: List[PetMatchResponse]
