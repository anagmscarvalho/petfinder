from fastapi import (
    APIRouter, Depends, HTTPException, Query, status, UploadFile
)
from sqlmodel import Session, select

#Upload de fotos
import io
from pathlib import Path
from PIL import Image
from uuid import uuid4

from app.core.database import get_session
from app.core.deps import usuario_logado
from app.models.user import User
from app.models.pet import Pet, StatusPet
from app.models.dados_adocao import DadosAdocao
from app.schemas.pet import (
    PetCreate, PetRead, CategoriaCadastro, PetStatusUpdate, PetAdocaoRead
)

# Foto
from app.core.config import settings
from app.models.foto import Foto
from app.schemas.foto import FotoRead


router = APIRouter(prefix="/pets", tags=["pets"])

MAPA_CATEGORIA_STATUS = {
    CategoriaCadastro.perdido: StatusPet.perdido,
    CategoriaCadastro.adocao: StatusPet.adocao,
}

TIPOS_PERMITIDOS = {"image/jpeg": "jpg", "image/png": "png"}
MAX_BYTES = settings.max_foto_mb * 1024 * 1024

def montar_pet_read(pet: Pet) -> PetRead:
    return PetRead(
        id=pet.id,
        nome=pet.nome,
        especie=pet.especie,
        raca=pet.raca,
        porte=pet.porte,
        pelagem=pet.pelagem,
        status=pet.status,
        dono_id=pet.dono_id,
        fotos=[FotoRead.de_foto(f) for f in pet.fotos],
    )


# ── Listagem pública ──────────────────────────────────────────

@router.get("", response_model=list[PetRead])
def listar_pets(
    status_filter: StatusPet | None = Query(default=None, alias="status"),
    especie: str | None = None,
    session: Session = Depends(get_session),
):
    """Lista pets com filtros opcionais por status e espécie."""
    query = select(Pet)
    if status_filter is not None:
        query = query.where(Pet.status == status_filter)
    if especie is not None:
        query = query.where(Pet.especie == especie)
    pets = session.exec(query).all()
    return [montar_pet_read(p) for p in pets]


@router.get("/{pet_id}", response_model=PetRead)
def detalhe_pet(
    pet_id: int,
    session: Session = Depends(get_session),
):
    """Retorna detalhes de um pet pelo ID."""
    pet = session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet não encontrado.")
    return montar_pet_read(pet)


# ── Cadastro (perdido ou adoção) ──────────────────────────────

@router.post("", response_model=PetRead, status_code=status.HTTP_201_CREATED)
def cadastrar_pet(
    dados: PetCreate,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    if (
        dados.categoria == CategoriaCadastro.adocao
        and not usuario.pode_postar_adocao
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sua conta não está aprovada para publicar pets para adoção.",
        )

    novo = Pet(
        nome=dados.nome,
        especie=dados.especie,
        raca=dados.raca,
        porte=dados.porte,
        pelagem=dados.pelagem,
        status=MAPA_CATEGORIA_STATUS[dados.categoria],
        dono_id=usuario.id,
    )
    session.add(novo)
    session.commit()
    session.refresh(novo)

    if dados.categoria == CategoriaCadastro.adocao:
        valores = dados.dados_adocao.model_dump() if dados.dados_adocao else {}
        session.add(DadosAdocao(pet_id=novo.id, **valores))
        session.commit()
        session.refresh(novo)

    return montar_pet_read(novo)


# ── Alterar status ────────────────────────────────────────────

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


# ── Upload de fotos ───────────────────────────────────────────

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

    extensao = TIPOS_PERMITIDOS.get(arquivo.content_type)
    if extensao is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Envie uma imagem JPEG ou PNG."
        )

    conteudo = await arquivo.read()
    if len(conteudo) > MAX_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"A imagem excede o limite de {settings.max_foto_mb} MB.",
        )

    try:
        Image.open(io.BytesIO(conteudo)).verify()
    except Exception:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "O arquivo enviado não é uma imagem válida.",
        )

    nome = f"{uuid4().hex}.{extensao}"
    Path(settings.upload_dir).joinpath(nome).write_bytes(conteudo)

    foto = Foto(pet_id=pet.id, arquivo=nome)
    session.add(foto)
    session.commit()
    session.refresh(foto)

    return FotoRead.de_foto(foto)
