#Ponto de entrada do serviço de IA (FastAPI).
#P/Rodar localmente:
#    uvicorn app.main:app --reload --port 8000

from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(
    title="Petfinder AI Service",
    description="Geração de embeddings (CLIP + Florence-2) e busca por similaridade de pets.",
)

app.include_router(router)


@app.get("/health")
async def health() -> dict:
    """Healthcheck simples, confirma que o processo está funcionando(sem carregar modelos)."""
    return {"status": "ok"}
