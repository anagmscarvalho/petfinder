from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.pet import Pet


class Foto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pet_id: int = Field(foreign_key="pet.id", ondelete="CASCADE")
    arquivo: str                       # só o nome do arquivo salvo, ex: "a1b2....jpg"
    criado_em: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    pet: "Pet" = Relationship(back_populates="fotos")