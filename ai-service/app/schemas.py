"""Schemas Pydantic para validação de dados."""

from pydantic import BaseModel


class EmbeddingResponse(BaseModel):
    embedding: list[float]


class MatchResult(BaseModel):
    index: int
    similarity_percent: float


class CompareResponse(BaseModel):
    matches: list[MatchResult]
