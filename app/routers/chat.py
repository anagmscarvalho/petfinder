from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.core.deps import usuario_logado
from app.core.database import get_session
from app.models.user import User
from app.models.pet import Pet
from app.models.chat import Conversa
from app.models.mensagem import Mensagem
from app.models.notificacao import Notificacao
from app.schemas.chat import MensagemCreate, MensagemRead, ConversaRead
from app.schemas.user import UserRead
from app.services.pet import montar_pet_read

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("", response_model=List[ConversaRead])
def listar_conversas(
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session)
):
    stmt = (
        select(Conversa)
        .where((Conversa.iniciador_id == usuario.id) | (Conversa.dono_id == usuario.id))
        .order_by(Conversa.criado_em.desc())
    )
    conversas = session.exec(stmt).all()
    
    resultado = []
    for c in conversas:
        pet = session.get(Pet, c.pet_id)
        outro_id = c.dono_id if c.iniciador_id == usuario.id else c.iniciador_id
        outro_usuario = session.get(User, outro_id)
        
        stmt_msg = select(Mensagem).where(Mensagem.conversa_id == c.id).order_by(Mensagem.criado_em.desc()).limit(1)
        ultima_msg = session.exec(stmt_msg).first()
        
        stmt_nao_lidas = select(Mensagem).where(
            Mensagem.conversa_id == c.id,
            Mensagem.remetente_id == outro_id,
            Mensagem.lida == False
        )
        nao_lidas = len(session.exec(stmt_nao_lidas).all())
        
        cread = ConversaRead.model_validate(c)
        if pet:
            cread.pet = montar_pet_read(pet)
        if outro_usuario:
            cread.outro_usuario = UserRead.model_validate(outro_usuario)
        if ultima_msg:
            cread.ultima_mensagem = MensagemRead.model_validate(ultima_msg)
        cread.nao_lidas = nao_lidas
        
        resultado.append(cread)
        
    resultado.sort(key=lambda x: x.ultima_mensagem.criado_em if x.ultima_mensagem else x.criado_em, reverse=True)
    return resultado

@router.post("/pet/{pet_id}/iniciar", response_model=ConversaRead)
def iniciar_conversa(
    pet_id: int,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session)
):
    pet = session.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet não encontrado.")
    if pet.dono_id == usuario.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Você não pode iniciar conversa consigo mesmo.")
    
    stmt = select(Conversa).where(Conversa.pet_id == pet_id, Conversa.iniciador_id == usuario.id)
    conversa = session.exec(stmt).first()
    
    if not conversa:
        conversa = Conversa(pet_id=pet_id, iniciador_id=usuario.id, dono_id=pet.dono_id)
        session.add(conversa)
        session.commit()
        session.refresh(conversa)
        
    cread = ConversaRead.model_validate(conversa)
    cread.pet = montar_pet_read(pet)
    outro_usuario = session.get(User, pet.dono_id)
    cread.outro_usuario = UserRead.model_validate(outro_usuario)
    return cread

@router.get("/{conversa_id}/mensagens", response_model=List[MensagemRead])
def buscar_mensagens(
    conversa_id: int,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session)
):
    conversa = session.get(Conversa, conversa_id)
    if not conversa:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversa não encontrada.")
    if conversa.iniciador_id != usuario.id and conversa.dono_id != usuario.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso negado.")
    
    # Marcar as recebidas como lidas
    stmt_nao_lidas = select(Mensagem).where(
        Mensagem.conversa_id == conversa_id,
        Mensagem.remetente_id != usuario.id,
        Mensagem.lida == False
    )
    nao_lidas = session.exec(stmt_nao_lidas).all()
    for m in nao_lidas:
        m.lida = True
        session.add(m)
    if nao_lidas:
        session.commit()
        
    stmt = select(Mensagem).where(Mensagem.conversa_id == conversa_id).order_by(Mensagem.criado_em.asc())
    return session.exec(stmt).all()

@router.post("/{conversa_id}/mensagens", response_model=MensagemRead)
def enviar_mensagem(
    conversa_id: int,
    dados: MensagemCreate,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session)
):
    conversa = session.get(Conversa, conversa_id)
    if not conversa:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversa não encontrada.")
    if conversa.iniciador_id != usuario.id and conversa.dono_id != usuario.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso negado.")
    
    msg = Mensagem(conversa_id=conversa_id, remetente_id=usuario.id, texto=dados.texto)
    session.add(msg)
    
    # Criar notificação para o outro usuário
    destinatario_id = conversa.dono_id if conversa.iniciador_id == usuario.id else conversa.iniciador_id
    notif = Notificacao(
        usuario_id=destinatario_id,
        tipo="message",
        titulo="Nova Mensagem",
        mensagem=f"{usuario.nome_completo} enviou uma mensagem para você.",
        dados_extras={"conversa_id": conversa_id}
    )
    session.add(notif)
    
    session.commit()
    session.refresh(msg)
    return msg

@router.delete("/{conversa_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_conversa(
    conversa_id: int,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session)
):
    conversa = session.get(Conversa, conversa_id)
    if not conversa:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversa não encontrada.")
    if conversa.iniciador_id != usuario.id and conversa.dono_id != usuario.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso negado.")
    
    session.delete(conversa)
    session.commit()
    return None
