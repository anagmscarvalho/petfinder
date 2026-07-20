from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_session
from app.core.deps import usuario_logado
from app.models.pet import Pet, StatusPet
from app.models.user import User
from app.schemas.search import MatchRead
from app.services.ia import buscar_similares, IAIndisponivel
from app.services.imagem import validar_imagem
from app.services.pet import montar_pet_read

router = APIRouter(tags=["search"])


@router.post("/search", response_model=list[MatchRead])
async def buscar_por_foto(
    arquivo: UploadFile,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    conteudo, _ = await validar_imagem(arquivo)

    try:
        matches = await buscar_similares(conteudo, arquivo.filename or "foto.jpg")
    except IAIndisponivel:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "A busca por imagem está indisponível no momento. Tente novamente.",
        )

    matches = [m for m in matches if m["score"] >= settings.score_minimo]
    if not matches:
        return []

    ids = [m["pet_id"] for m in matches]
    pets = session.exec(
        select(Pet).where(Pet.id.in_(ids), Pet.status == StatusPet.perdido)
    ).all()
    pets = [p for p in pets if p.fotos]
    por_id = {p.id: p for p in pets}

    return [
        MatchRead(pet=montar_pet_read(por_id[m["pet_id"]]), score=m["score"])
        for m in matches
        if m["pet_id"] in por_id
    ]