from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column, JSON

class NotificacaoBase(SQLModel):
    usuario_id: int = Field(foreign_key="user.id", index=True)
    tipo: str = Field(description="Tipo da notificação (ex: match, message, system)")
    titulo: str
    mensagem: str
    lida: bool = Field(default=False)
    dados_extras: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    criado_em: datetime = Field(default_factory=datetime.utcnow)

class Notificacao(NotificacaoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class NotificacaoRead(NotificacaoBase):
    id: int
