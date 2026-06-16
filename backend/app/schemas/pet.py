from pydantic import BaseModel, ConfigDict, Field
from enum import Enum

from app.models.pet import StatusPet

class CategoriaCadastro(str, Enum):
    perdido = "perdido"
    adocao = "adocao"

class PetCreate(BaseModel):
    nome: str = Field(min_length=1)
    especie: str
    raca: str
    porte: str
    pelagem: str
    categoria: CategoriaCadastro   # sem default = obrigatório


class PetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    especie: str
    raca: str
    porte: str
    pelagem: str
    status: StatusPet
    dono_id: int | None

class PetStatusUpdate(BaseModel):
    status: StatusPet
