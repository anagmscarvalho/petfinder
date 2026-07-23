import logging
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile
from sqlmodel import Session

from app.core.config import settings
from app.core.database import get_session
from app.core.deps import usuario_logado
from app.models.user import User
from app.models.pet import Pet, StatusPet
from app.models.dados_adocao import DadosAdocao
from app.models.foto import Foto
from app.models.notificacao import Notificacao
from app.schemas.pet import (
    PetCreate, PetRead, PetAdocaoRead, PetStatusUpdate, CategoriaCadastro,
)
from app.schemas.foto import FotoRead
from app.services.pet import montar_pet_read, montar_pet_detalhe
from app.services.imagem import validar_imagem
from app.services.ia import gravar_embedding, buscar_similares, IAIndisponivel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pets", tags=["pets"])

MAPA_CATEGORIA_STATUS = {
    CategoriaCadastro.perdido: StatusPet.perdido,
    CategoriaCadastro.encontrado: StatusPet.encontrado,
    CategoriaCadastro.adocao: StatusPet.adocao,
}


@router.post("", response_model=PetAdocaoRead, status_code=status.HTTP_201_CREATED)
def cadastrar_pet(
    dados: PetCreate,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    is_admin = usuario.email == "miguelangelo.ss.pessoal@gmail.com" or usuario.pode_postar_adocao
    if (
        dados.categoria == CategoriaCadastro.adocao
        and not is_admin
    ):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Sua conta não está aprovada para publicar pets para adoção.",
        )

    novo = Pet(
        nome=dados.nome,
        especie=dados.especie,
        raca=dados.raca,
        porte=dados.porte,
        pelagem=dados.pelagem,
        bairro=dados.bairro,
        status=MAPA_CATEGORIA_STATUS[dados.categoria],
        dono_id=usuario.id,
        atende_por=dados.atende_por,
        detalhes=dados.detalhes,
        docil=dados.docil,
    )
    session.add(novo)
    session.commit()
    session.refresh(novo)

    if dados.categoria == CategoriaCadastro.adocao:
        valores = dados.dados_adocao.model_dump() if dados.dados_adocao else {}
        session.add(DadosAdocao(pet_id=novo.id, **valores))
        session.commit()
        session.refresh(novo)

    return montar_pet_detalhe(novo)


@router.get("/{pet_id}", response_model=PetAdocaoRead)
def detalhe_pet(
    pet_id: int,
    session: Session = Depends(get_session),
):
    pet = session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet não encontrado.")
    return montar_pet_detalhe(pet)


@router.patch("/{pet_id}/status", response_model=PetRead)
def mudar_status(
    pet_id: int,
    dados: PetStatusUpdate,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    pet = session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet não encontrado.")
    if pet.dono_id != usuario.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Você só pode alterar pets que você cadastrou.",
        )

    pet.status = dados.status
    session.add(pet)
    session.commit()
    session.refresh(pet)
    return montar_pet_read(pet)


@router.post(
    "/{pet_id}/fotos",
    response_model=FotoRead,
    status_code=status.HTTP_201_CREATED,
)
async def enviar_foto(
    pet_id: int,
    arquivo: UploadFile,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    pet = session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet não encontrado.")
    if pet.dono_id != usuario.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Você só pode adicionar fotos aos seus próprios pets.",
        )

    conteudo, extensao = await validar_imagem(arquivo)

    nome = f"{uuid4().hex}.{extensao}"
    Path(settings.upload_dir).joinpath(nome).write_bytes(conteudo)

    foto = Foto(pet_id=pet.id, arquivo=nome)
    session.add(foto)
    session.commit()
    session.refresh(foto)

    try:
        await gravar_embedding(pet.id, conteudo, nome)
        matches = await buscar_similares(conteudo, nome)
        
        for m in matches:
            score = m["score"]
            match_pet_id = m["pet_id"]
            if score >= settings.score_minimo and match_pet_id != pet.id:
                match_pet = session.get(Pet, match_pet_id)
                # Somente notifica se forem status complementares (perdido/encontrado)
                if match_pet and match_pet.status != pet.status and match_pet.status != StatusPet.adocao and pet.status != StatusPet.adocao:
                    # Notificar o dono do pet atual
                    notif1 = Notificacao(
                        usuario_id=usuario.id,
                        tipo="match",
                        titulo="Match encontrado!",
                        mensagem=f"Identificamos um pet com {int(score*100)}% de similaridade ao seu.",
                        dados_extras={"pet_id": match_pet.id}
                    )
                    # Notificar o dono do pet antigo
                    if match_pet.dono_id != usuario.id:
                        notif2 = Notificacao(
                            usuario_id=match_pet.dono_id,
                            tipo="match",
                            titulo="Match encontrado!",
                            mensagem=f"Alguém registrou um pet com {int(score*100)}% de similaridade ao seu.",
                            dados_extras={"pet_id": pet.id}
                        )
                        session.add(notif2)
                    session.add(notif1)
        session.commit()
    except IAIndisponivel as exc:
        logger.warning("IA indisponível para o pet %s: %s", pet.id, exc)

    return FotoRead.de_foto(foto)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_pet(
    pet_id: int,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    pet = session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet não encontrado.")
    if pet.dono_id != usuario.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Você só pode excluir os seus próprios pets.",
        )
    
    # Optional: also remove embeddings from IA service if desired, 
    # but cascading will delete it from DB.
    session.delete(pet)
    session.commit()
    return None