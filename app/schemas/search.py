from pydantic import BaseModel

from app.schemas.pet import PetRead


class MatchRead(BaseModel):
    pet: PetRead
    score: float