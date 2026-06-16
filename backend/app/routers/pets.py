from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import usuario_logado
from app.models.user import User
from app.models.pet import Pet, StatusPet
from app.schemas.pet import PetCreate, PetRead, CategoriaCadastro, PetStatusUpdate

router = APIRouter(prefix="/pets", tags=["pets"])

MAPA_CATEGORIA_STATUS = {
    CategoriaCadastro.perdido: StatusPet.perdido,
    CategoriaCadastro.adocao: StatusPet.adocao,
}


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
    return novo

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
    return pet
