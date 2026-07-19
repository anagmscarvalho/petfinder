from app.models.pet import Pet, StatusPet
from app.schemas.pet import PetRead, PetAdocaoRead, DadosAdocaoRead
from app.schemas.foto import FotoRead


def montar_pet_read(pet: Pet) -> PetRead:
    return PetRead(
        id=pet.id,
        nome=pet.nome,
        especie=pet.especie,
        raca=pet.raca,
        porte=pet.porte,
        pelagem=pet.pelagem,
        bairro=pet.bairro,
        status=pet.status,
        dono_id=pet.dono_id,
        atende_por=pet.atende_por,
        detalhes=pet.detalhes,
        docil=pet.docil,

        fotos=[FotoRead.de_foto(f) for f in pet.fotos],
    )

def montar_pet_detalhe(pet: Pet) -> PetRead:
    base = montar_pet_read(pet)
    if pet.status in (StatusPet.adocao, StatusPet.adotado):
        return PetAdocaoRead(
            **base.model_dump(),
            dados_adocao=(
                DadosAdocaoRead.model_validate(pet.dados_adocao)
                if pet.dados_adocao
                else None
            ),
        )
    return base