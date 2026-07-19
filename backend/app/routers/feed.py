from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.pet import Pet, StatusPet
from app.models.anuncio import Anuncio
from app.models.bairro import Bairro
from app.schemas.anuncio import AnuncioRead
from app.schemas.feed import ItemFeed
from app.services.pet import montar_pet_read

router = APIRouter(tags=["feed"])


def montar_feed(pets, anuncios, intervalo=5):
    pet_itens = [ItemFeed(tipo="pet", pet=montar_pet_read(p)) for p in pets]
    anuncio_itens = [
        ItemFeed(tipo="anuncio", anuncio=AnuncioRead.model_validate(a))
        for a in anuncios
    ]
    if not anuncio_itens:
        return pet_itens

    resultado = []
    a = 0
    for i, item in enumerate(pet_itens):
        resultado.append(item)
        if (i + 1) % intervalo == 0:
            resultado.append(anuncio_itens[a % len(anuncio_itens)])
            a += 1
    if a == 0:                                   # poucos pets: mostra ao menos um
        resultado.insert(0, anuncio_itens[0])
    return resultado


@router.get("/feed", response_model=list[ItemFeed])
def feed(
    status_filtro: StatusPet | None = None,
    bairros: list[Bairro] | None = Query(default=None),
    session: Session = Depends(get_session),
):
    consulta = select(Pet)
    if status_filtro in (StatusPet.perdido, StatusPet.adocao):
        consulta = consulta.where(Pet.status == status_filtro)
    else:
        consulta = consulta.where(
            Pet.status.in_([StatusPet.perdido, StatusPet.adocao])
        )

    if bairros:
        consulta = consulta.where(Pet.bairro.in_(bairros))  

    pets = session.exec(consulta.order_by(Pet.id.desc())).all()

    anuncios = session.exec(
        select(Anuncio).where(Anuncio.ativo == True).order_by(Anuncio.id.desc())
    ).all()

    return montar_feed(pets, anuncios)

@router.get("/bairros", response_model=list[str])
def listar_bairros():
    return [b.value for b in Bairro]