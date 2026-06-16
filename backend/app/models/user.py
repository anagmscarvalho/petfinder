from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if  TYPE_CHECKING:
	from app.models.pet import Pet

class TipoConta(str, Enum):
    comum = "comum"
    ong = "ong"
    petshop = "petshop"

class User(SQLModel, table=True):
	id: int | None = Field(default=None, primary_key=True)
	nome_completo: str
	data_nascimento: date
	email: str = Field(unique=True, index= True)
	senha_hash: str
	notificacoes_ativas: bool = Field(default=True)
	ativo: bool = Field(default=True)
	criado_em: datetime = Field(default_factory=datetime.utcnow)
	tipo_conta: TipoConta = Field(default=TipoConta.comum)
	pode_postar_adocao: bool = Field(default=False)

	pets: list["Pet"] = Relationship(
	back_populates="dono",
	cascade_delete=True, #Apaga todos os pets ligados a um user
)

