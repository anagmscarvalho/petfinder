"""
app/api/routes.py

Endpoints do serviço de IA — contrato confirmado lendo
`backend/ia_falsa.py` e `backend/app/services/ia.py` (branch `backend`):

    POST   /embeddings           -> grava o embedding de um pet.
                                     multipart/form-data: photo (arquivo)
                                     + pet_id (form field, int).
    POST   /compare               -> recebe uma foto e retorna
                                      {"matches": [{"pet_id", "score", ...}]}.
    DELETE /embeddings/{pet_id}   -> remove o embedding de um pet.

    POST   /search (extra)        -> busca por texto livre. Ainda não
                                      existe uma chamada equivalente a
                                      buscar_similares() para texto em
                                      services/ia.py — fica pronto para
                                      quando o backend adicionar.

Este módulo só orquestra: chama o Florence, o CLIP, o processing e o
banco, na ordem certa, e traduz o resultado pros schemas HTTP. A lógica
de cada etapa mora nos módulos respectivos.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.clip.image_embedding import generate_image_embedding
from app.clip.text_embedding import generate_text_embedding
from app.database.pets_repository import (
    delete_pet_embedding,
    search_by_image_embedding,
    search_by_text_embedding,
    upsert_pet_embedding,
)
from app.florence.caption import generate_caption
from app.processing.extract_attributes import extract_attributes
from app.processing.translate import translate_attributes

from .schemas import (
    CompareImageResponse,
    OkResponse,
    PetMatchResponse,
    TextSearchRequest,
    TextSearchResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _build_pt_caption(color_pt: str | None, size_pt: str | None) -> str:
    """
    Monta a legenda final em português a partir dos atributos
    traduzidos. Versão mínima — será substituída por
    `app/processing/text_builder.py` quando esse módulo existir.
    """
    parts = ["cachorro"]
    if color_pt:
        parts.append(f"cor: {color_pt}")
    if size_pt:
        parts.append(f"porte: {size_pt}")
    return "; ".join(parts)


def _to_match_response(match) -> PetMatchResponse:
    return PetMatchResponse(
        pet_id=match.pet_id,
        score=round(match.score, 4),
        similarity_percentage=round(match.similarity_percentage, 1),
        color=match.color,
        size=match.size,
    )


@router.post("/embeddings", response_model=OkResponse)
async def gravar_embedding(
    photo: UploadFile = File(...),
    pet_id: int = Form(...),
) -> OkResponse:
    """
    Grava o embedding de um pet: gera legenda (Florence), extrai
    cor/porte, traduz pra português, gera os embeddings (CLIP) e salva
    no ChromaDB.

    Mesma assinatura de `gravar()` em `backend/ia_falsa.py`: `photo`
    (arquivo) + `pet_id` (form field). Chamado pelo backend logo depois
    de criar o registro do pet no SQLite (`gravar_embedding()` em
    `services/ia.py`).
    """
    image_bytes = await photo.read()

    try:
        caption_en = generate_caption(image_bytes)
        attributes = extract_attributes(caption_en)
        translated = translate_attributes(attributes)
        caption_pt = _build_pt_caption(translated["color"], translated["size"])

        image_embedding = generate_image_embedding(image_bytes)
        text_embedding = generate_text_embedding(caption_pt)

        upsert_pet_embedding(
            pet_id=pet_id,
            image_embedding=image_embedding,
            text_embedding=text_embedding,
            color=translated["color"],
            size=translated["size"],
        )
    except Exception as exc:
        logger.exception("Falha ao gravar embedding do pet %d.", pet_id)
        raise HTTPException(
            status_code=500, detail="Falha ao processar a foto do pet."
        ) from exc

    return OkResponse(ok=True)


@router.delete("/embeddings/{pet_id}", response_model=OkResponse)
async def remover_embedding(pet_id: int) -> OkResponse:
    """
    Remove o embedding de um pet (ex.: pet encontrado, adotado ou
    removido no backend). Mesma assinatura de `remover()` em
    `backend/ia_falsa.py`.
    """
    delete_pet_embedding(pet_id)
    return OkResponse(ok=True)


@router.post("/compare", response_model=CompareImageResponse)
async def compare_image(photo: UploadFile = File(...)) -> CompareImageResponse:
    """
    Recebe a foto de um animal encontrado e retorna
    {"matches": [{"pet_id", "score", ...}]} — formato exigido por
    `buscar_similares()` em `backend/app/services/ia.py`
    (`resposta.json().get("matches", [])`).
    """
    image_bytes = await photo.read()

    try:
        caption_en = generate_caption(image_bytes)
        attributes = extract_attributes(caption_en)
        translated = translate_attributes(attributes)

        query_embedding = generate_image_embedding(image_bytes)
        matches = search_by_image_embedding(query_embedding)
    except Exception as exc:
        logger.exception("Falha ao comparar imagem recebida.")
        raise HTTPException(status_code=500, detail="Falha ao comparar a imagem.") from exc

    return CompareImageResponse(
        matches=[_to_match_response(m) for m in matches],
        detected_color=translated["color"],
        detected_size=translated["size"],
    )


@router.post("/search", response_model=TextSearchResponse)
async def search_by_text(request: TextSearchRequest) -> TextSearchResponse:
    """
    Busca pets a partir de uma descrição em texto livre, em português.

    Endpoint extra, ainda não consumido pelo backend (não há chamada
    equivalente em `services/ia.py` hoje) — pronto para quando alguém
    adicionar `buscar_por_texto()` lá.
    """
    try:
        query_embedding = generate_text_embedding(request.query)
        matches = search_by_text_embedding(query_embedding, match_count=request.match_count)
    except Exception as exc:
        logger.exception("Falha na busca por texto: '%s'.", request.query)
        raise HTTPException(status_code=500, detail="Falha ao buscar pets.") from exc

    return TextSearchResponse(matches=[_to_match_response(m) for m in matches])
