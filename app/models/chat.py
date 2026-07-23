from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.mensagem import Mensagem


class Conversa(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pet_id: int = Field(foreign_key="pet.id", ondelete="CASCADE")
    iniciador_id: int = Field(foreign_key="user.id")     # quem viu o post
    dono_id: int = Field(foreign_key="user.id")          # dono do post
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    mensagens: list["Mensagem"] = Relationship(
        back_populates="conversa", cascade_delete=True
    )