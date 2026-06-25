from datetime import date
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.user import TipoConta

class UserCreate(BaseModel):
    nome_completo: str = Field(min_length=2)
    data_nascimento: date
    email: EmailStr
    senha: str = Field(min_length=8)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome_completo: str
    email: EmailStr
    notificacoes_ativas: bool
    tipo_conta: TipoConta
    pode_postar_adocao: bool

class UserUpdate(BaseModel):
    nome_completo: str | None = Field(default=None, min_length=2)
    data_nascimento: date | None = None
    notificacoes_ativas: bool | None = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


