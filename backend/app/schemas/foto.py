from pydantic import BaseModel

from app.core.config import settings
from app.models.foto import Foto


class FotoRead(BaseModel):
    id: int
    url: str

    @classmethod
    def de_foto(cls, foto: Foto) -> "FotoRead":
        return cls(id=foto.id, url=f"/{settings.upload_dir}/{foto.arquivo}")