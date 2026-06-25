from enum import Enum
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.dados_adocao import DadosAdocao
    from app.models.foto import Foto

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
    dados_adocao: Optional ["DadosAdocao"] = Relationship(
        back_populates="pet",
        cascade_delete=True,
        sa_relationship_kwargs={"uselist":False},
    )

    fotos: list["Foto"] = Relationship(
        back_populates="pet", 
        cascade_delete=True,
    )

