from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.core.deps import usuario_logado
from app.models.notificacao import Notificacao, NotificacaoRead
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificacaoRead])
def listar_notificacoes(
    session: Session = Depends(get_session),
    usuario: User = Depends(usuario_logado),
):
    stmt = select(Notificacao).where(Notificacao.usuario_id == usuario.id).order_by(Notificacao.criado_em.desc())
    return session.exec(stmt).all()

@router.patch("/{notificacao_id}/read", response_model=NotificacaoRead)
def marcar_como_lida(
    notificacao_id: int,
    session: Session = Depends(get_session),
    usuario: User = Depends(usuario_logado),
):
    notificacao = session.get(Notificacao, notificacao_id)
    if not notificacao or notificacao.usuario_id != usuario.id:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    
    notificacao.lida = True
    session.add(notificacao)
    session.commit()
    session.refresh(notificacao)
    return notificacao
