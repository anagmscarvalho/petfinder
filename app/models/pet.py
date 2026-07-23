from enum import Enum
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.dados_adocao import DadosAdocao
    from app.models.foto import Foto

from app.models.bairro import Bairro

class StatusPet(str, Enum):
    perdido = "perdido"
    encontrado = "encontrado"
    adocao = "adocao"
    adotado = "adotado"


class Pet(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nome: str
    especie: str
    raca: str | None = None
    porte: str
    pelagem: str
    status: StatusPet 
    bairro: Bairro | None = Field(default=None, description="Bairro onde o pet foi visto ou perdido")
    atende_por: str | None = Field(default=None, description="Outros nomes pelos quais o pet atende")
    docil: bool | None = Field(default=None, description="Se o pet é dócil")
    detalhes: str | None = Field(default=None, description="Detalhes livres sobre o pet, como idade, cor dos olhos, se é castrado, etc.")

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

