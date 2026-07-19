from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import usuario_admin
from app.models.user import User
from app.models.anuncio import Anuncio
from app.schemas.anuncio import AnuncioCreate, AnuncioRead

router = APIRouter(prefix="/anuncios", tags=["anuncios"])


@router.post("", response_model=AnuncioRead, status_code=status.HTTP_201_CREATED)
def criar_anuncio(
    dados: AnuncioCreate,
    admin: User = Depends(usuario_admin),
    session: Session = Depends(get_session),
):
    anuncio = Anuncio(**dados.model_dump())
    session.add(anuncio)
    session.commit()
    session.refresh(anuncio)
    return anuncio


@router.delete("/{anuncio_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_anuncio(
    anuncio_id: int,
    admin: User = Depends(usuario_admin),
    session: Session = Depends(get_session),
):
    anuncio = session.get(Anuncio, anuncio_id)
    if anuncio is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Anúncio não encontrado.")
    session.delete(anuncio)
    session.commit()