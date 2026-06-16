from datetime import datetime, timezone

from sqlmodel import SQLModel, Field


class Favorito(SQLModel, table=True):
    usuario_id: int = Field(
        foreign_key="user.id", primary_key=True, ondelete="CASCADE"
    )
    pet_id: int = Field(
        foreign_key="pet.id", primary_key=True, ondelete="CASCADE"
    )
    criado_em: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
