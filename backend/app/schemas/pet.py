from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.pet import StatusPet
from app.schemas.foto import FotoRead
from app.models.bairro import Bairro


# 1. Enum (não depende de nada)
class CategoriaCadastro(str, Enum):
    perdido = "perdido"
    adocao = "adocao"


# 2. DadosAdocaoCreate precisa existir antes do PetCreate
class DadosAdocaoCreate(BaseModel):
    idade_meses: int | None = Field(default=None, ge=0)
    vacinas_tomadas: str | None = None
    vacinas_garantidas: str | None = None
    vermifugado: bool = False
    castrado: bool = False
    garantia_castracao: bool = False
    historia: str | None = Field(default=None, description="História do pet, se for para adoção")
    personalidade: str | None = Field(default=None, description="Personalidade do pet, se for para adoção")

    @model_validator(mode="after")
    def castracao_coerente(self):
        if self.castrado:
            self.garantia_castracao = False
        return self


# 3. PetCreate pode usar DadosAdocaoCreate
class PetCreate(BaseModel):
    nome: str = Field(min_length=1)
    especie: str
    raca: str
    porte: str
    pelagem: str
    categoria: CategoriaCadastro
    bairro: Bairro | None = None
    detalhes: str | None = None
    dados_adocao: DadosAdocaoCreate | None = None

    @model_validator(mode="after")
    def adocao_so_para_adocao(self):
        if self.categoria == CategoriaCadastro.perdido and self.dados_adocao is not None:
            raise ValueError("Pets perdidos não recebem dados de adoção.")
        return self
    
    def regras_por_categoria(self):
        if self.categoria == CategoriaCadastro.perdido:
            if self.dados_adocao is not None:
                raise ValueError("Pets perdidos não recebem dados de adoção.")
            if self.bairro is None:
                raise ValueError("Informe o bairro onde o pet foi perdido.")
        return self
    
    atende_por: str | None = None
    historia: str | None = None
    personalidade: str | None = None
    docil: bool | None = None

# 4. DadosAdocaoRead
class DadosAdocaoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    idade_meses: int | None
    vacinas_tomadas: str | None
    vacinas_garantidas: str | None
    vermifugado: bool
    castrado: bool
    garantia_castracao: bool
    historia: str | None
    personalidade: str | None

# 5. PetRead antes do PetAdocaoRead
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
    bairro: Bairro | None
    atende_por: str | None
    docil: bool | None
    detalhes: str | None   

    fotos: list[FotoRead] = []


# 6. PetAdocaoRead que herda de PetRead e usa DadosAdocaoRead
class PetAdocaoRead(PetRead):
    dados_adocao: DadosAdocaoRead | None		

class PetStatusUpdate(BaseModel):
    status: StatusPet
