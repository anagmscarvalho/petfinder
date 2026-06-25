from typing import Literal 
from pydantic import BaseModel

from app.schemas.pet import PetRead
from app.schemas.anuncio import AnuncioRead

class ItemFeed(BaseModel):
    tipo: Literal["pet", "anuncio"]
    pet: PetRead | None = None
    anuncio: AnuncioRead | None = None