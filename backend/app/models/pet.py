from enum import Enum
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.user import User


class StatusPet(str, Enum):
    perdido = "perdido"
    encontrado = "encontrado"
    adocao = "adocao"
    adotado = "adotado"


class Pet(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nome: str
    especie: str          # "cachorro" ou "gato"
    raca: str
    porte: str
    pelagem: str
    status: StatusPet 

    dono_id: int | None = Field(
        default=None,
        foreign_key="user.id",
        ondelete="CASCADE",
    )
    dono: Optional["User"] = Relationship(back_populates="pets")
