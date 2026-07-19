from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.pet import Pet


class DadosAdocao(SQLModel, table=True):
    pet_id: int = Field(
        foreign_key="pet.id", primary_key=True, ondelete="CASCADE"
    )
    idade_meses: int | None = Field(default=None)
    vacinas_tomadas: str | None = Field(default=None)
    vacinas_garantidas: str | None = Field(default=None)
    vermifugado: bool = Field(default=False)
    castrado: bool = Field(default=False)
    garantia_castracao: bool = Field(default=False)
    historia: str | None = Field(default=None, description="História do pet, se for para adoção")
    personalidade: str | None = Field(default=None, description="Personalidade do pet, se for para adoção")

    pet: "Pet" = Relationship(back_populates="dados_adocao")

