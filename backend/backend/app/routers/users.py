from sqlmodel import Session, select
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import usuario_logado
from app.core.database import get_session
from app.models.user import User
from app.routers.pets import montar_pet_read
from app.schemas.user import UserRead, UserUpdate
from app.schemas.pet import PetRead
from app.models.pet import Pet, StatusPet
from app.models.favorito import Favorito


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def meu_perfil(usuario: User = Depends(usuario_logado)):
    return usuario

@router.patch("/me", response_model=UserRead)
def editar_perfil(
    dados: UserUpdate,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    campos = dados.model_dump(exclude_unset=True)
    for chave, valor in campos.items():
        setattr(usuario, chave, valor)
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario

@router.get("/me/pets", response_model=list[PetRead])
def meus_pets(usuario: User = Depends(usuario_logado)):
    return [montar_pet_read(pet) for pet in usuario.pets]

@router.post("/me/favorites/{pet_id}", status_code=status.HTTP_201_CREATED)
def favoritar(
    pet_id: int,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    pet = session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet não encontrado.")

    if pet.status not in (StatusPet.adocao, StatusPet.adotado):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Só é possível favoritar pets de adoção.",
        )

    ja_existe = session.get(
        Favorito, {"usuario_id": usuario.id, "pet_id": pet_id}
    )
    if ja_existe is None:
        session.add(Favorito(usuario_id=usuario.id, pet_id=pet_id))
        session.commit()

@router.delete("/me/favorites/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def desfavoritar(
    pet_id: int,
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    favorito = session.get(
        Favorito, {"usuario_id": usuario.id, "pet_id": pet_id}
    )
    if favorito is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "Este pet não está nos seus favoritos."
        )
    session.delete(favorito)
    session.commit()

@router.get("/me/favorites", response_model=list[PetRead])
def meus_favoritos(
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    pets = session.exec(
        select(Pet)
        .join(Favorito, Favorito.pet_id == Pet.id)
        .where(Favorito.usuario_id == usuario.id)
    ).all()
    return [montar_pet_read(pet) for pet in pets]
    


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def excluir_conta(
    usuario: User = Depends(usuario_logado),
    session: Session = Depends(get_session),
):
    # Apaga os pets (todos os posts serão removidos)
    for pet in usuario.pets:
        session.delete(pet)

    # Anonimiza os dados pessoais
    usuario.nome_completo = "Usuário removido"
    usuario.email = f"removido_{usuario.id}@petfinder.local"
    usuario.senha_hash = ""
    usuario.data_nascimento = date(1900, 1, 1)

    # Desativa a conta (mas mantém a linha)
    usuario.ativo = False

    session.add(usuario)
    session.commit()
