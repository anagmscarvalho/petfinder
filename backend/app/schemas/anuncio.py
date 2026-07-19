from pydantic import BaseModel, ConfigDict, model_validator

from app.models.anuncio import TipoAnuncio


class AnuncioCreate(BaseModel):
    titulo: str | None = None
    texto: str | None = None
    imagem: str | None = None
    link: str | None = None
    tipo: TipoAnuncio = TipoAnuncio.educativo

    @model_validator(mode="after")
    def ao_menos_um_conteudo(self):
        if not (self.titulo or self.texto or self.imagem):
            raise ValueError("Informe ao menos um título, texto ou imagem.")
        return self


class AnuncioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    titulo: str | None
    texto: str | None
    imagem: str | None
    link: str | None
    tipo: TipoAnuncio