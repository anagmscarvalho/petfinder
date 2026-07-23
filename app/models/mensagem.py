from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.chat import Conversa


class Mensagem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    conversa_id: int = Field(foreign_key="conversa.id", ondelete="CASCADE")
    remetente_id: int = Field(foreign_key="user.id")     # sem cascade: preserva histórico
    texto: str
    lida: bool = Field(default=False)
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    conversa: "Conversa" = Relationship(back_populates="mensagens")