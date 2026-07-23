import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class IAIndisponivel(Exception):
    """O serviço de IA falhou ou não respondeu."""


async def gravar_embedding(pet_id: int, conteudo: bytes, nome: str) -> None:
    try:
        async with httpx.AsyncClient(timeout=settings.ia_timeout) as client:
            resposta = await client.post(
                f"{settings.ia_service_url}/embeddings",
                files={"photo": (nome, conteudo)},
                data={"pet_id": str(pet_id)},
            )
            resposta.raise_for_status()
    except httpx.HTTPError as exc:
        raise IAIndisponivel(str(exc)) from exc


async def buscar_similares(conteudo: bytes, nome: str) -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=settings.ia_timeout) as client:
            resposta = await client.post(
                f"{settings.ia_service_url}/compare",
                files={"photo": (nome, conteudo)},
            )
            resposta.raise_for_status()
            return resposta.json().get("matches", [])
    except httpx.HTTPError as exc:
        raise IAIndisponivel(str(exc)) from exc


async def remover_embedding(pet_id: int) -> None:
    try:
        async with httpx.AsyncClient(timeout=settings.ia_timeout) as client:
            await client.delete(f"{settings.ia_service_url}/embeddings/{pet_id}")
    except httpx.HTTPError as exc:
        logger.warning("Falha ao remover embedding do pet %s: %s", pet_id, exc)