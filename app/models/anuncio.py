from datetime import datetime, timezone
from enum import Enum

from sqlmodel import SQLModel, Field


class TipoAnuncio(str, Enum):
    educativo = "educativo"
    campanha = "campanha"


class Anuncio(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    titulo: str | None = Field(default=None)
    texto: str | None = Field(default=None)
    imagem: str | None = Field(default=None)     # URL ou caminho do banner
    link: str | None = Field(default=None)       # ex: vídeo, página da campanha
    tipo: TipoAnuncio = Field(default=TipoAnuncio.educativo)
    ativo: bool = Field(default=True)            # devs podem ocultar sem apagar
    criado_em: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )