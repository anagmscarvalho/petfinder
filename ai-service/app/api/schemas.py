from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class OkResponse(BaseModel):
    """Resposta mínima de confirmação """

    ok: bool = True


class PetMatchResponse(BaseModel):
    """Um pet candidato retornado por /compare ou /search."""

    pet_id: int
    score: float = Field(
        ...,
        description="Similaridade de cosseno (aprox. 0 a 1).",
    )
    similarity_percentage: float = Field(
        ...,
        ge=0,
        le=100,
        description="Mesma similaridade, em %.",
    )
    color: Optional[str] = None
    size: Optional[str] = None


class CompareImageResponse(BaseModel):
    """
    Resposta de POST /compare.
    """

    matches: List[PetMatchResponse]
    detected_color: Optional[str] = None
    detected_size: Optional[str] = None


class TextSearchRequest(BaseModel):
    """
    Corpo de POST /search — busca por descrição em texto livre.
    """

    query: str = Field(..., min_length=1, max_length=300, examples=["cachorro preto de porte médio"])
    match_count: int = Field(20, ge=1, le=100)


class TextSearchResponse(BaseModel):
    matches: List[PetMatchResponse]
