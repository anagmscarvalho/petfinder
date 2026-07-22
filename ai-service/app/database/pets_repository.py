from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Optional

import numpy as np

from .chroma_client import get_pet_embeddings_collection

logger = logging.getLogger(__name__)

DEFAULT_MATCH_COUNT = 20


@dataclass
class PetMatch:
    """Um resultado de busca por similaridade, já pronto para a API devolver."""

    pet_id: int
    score: float                  # similaridade de cosseno (tipicamente ~[0, 1]) 
    similarity_percentage: float  # 0-100
    color: Optional[str]
    size: Optional[str]


def upsert_pet_embedding(
    pet_id: int,
    image_embedding: np.ndarray,
    text_embedding: Optional[np.ndarray] = None,
    color: Optional[str] = None,
    size: Optional[str] = None,
    clip_model_version: Optional[str] = None,
) -> None:
    """
    Insere ou atualiza o embedding de um pet (upsert por `pet_id`).
    Chamado por `POST /embeddings`, que o backend aciona depois de criar
    o registro do pet no SQLite (ver `gravar_embedding` em
    `backend/app/services/ia.py`).

    Parâmetros:
        pet_id: id do pet no SQLite do backend.
        image_embedding: embedding da foto, gerado por
                         `app/clip/image_embedding.generate_image_embedding`.
        text_embedding: embedding da legenda estruturada (cor/porte em
                        português). O ChromaDB, nesta coleção, indexa só
                        pelo `image_embedding` — o `text_embedding` é
                        aceito aqui para manter a assinatura simétrica
                        com uma futura coleção de busca por texto
                        dedicada, mas não é persistido ainda.
        color, size: atributos em português (ver
                     `app/processing/translate.py`), salvos como
                     metadata do Chroma — permitem filtro direto
                     (ex.: "só cães pretos") sem decodificar o vetor.
        clip_model_version: identifica qual checkpoint do CLIP gerou o
                     embedding — útil para saber quais itens precisam
                     ser reprocessados depois de um novo fine-tuning
                     (ver `training/finetune_clip.py`).
    """
    collection = get_pet_embeddings_collection()

    metadata = {"color": color or "", "size": size or ""}
    if clip_model_version:
        metadata["clip_model_version"] = clip_model_version

    try:
        collection.upsert(
            ids=[str(pet_id)],
            embeddings=[image_embedding.tolist()],
            metadatas=[metadata],
        )
    except Exception as exc:
        logger.exception("Falha ao salvar embedding do pet %d.", pet_id)
        raise RuntimeError(f"Falha ao salvar embedding do pet {pet_id}.") from exc

    if text_embedding is not None:
        logger.debug(
            "text_embedding recebido para o pet %d, mas ainda não é persistido "
            "(sem coleção de texto dedicada ainda).",
            pet_id,
        )


def delete_pet_embedding(pet_id: int) -> None:
    """
    Remove o embedding de um pet. Chamado por `DELETE /embeddings/{pet_id}`
    (ex.: pet foi encontrado, adotado ou removido no backend).

    O backend (`remover_embedding` em `services/ia.py`) só loga aviso se
    isso falhar — não trava o fluxo dele —, mas registramos o erro aqui
    também, pra não desaparecer silenciosamente.
    """
    collection = get_pet_embeddings_collection()
    try:
        collection.delete(ids=[str(pet_id)])
    except Exception as exc:
        logger.warning("Falha ao remover embedding do pet %d: %s", pet_id, exc)


def _to_pet_match(pet_id_str: str, distance: float, metadata: Optional[dict]) -> PetMatch:
    # ChromaDB, com "hnsw:space": "cosine" (configurado em chroma_client.py),
    # retorna DISTÂNCIA de cosseno (1 - similaridade) — mesma relação usada
    # pelo operador <=> do pgvector, então a conversão é idêntica.
    similarity = 1 - distance
    clamped = max(-1.0, min(1.0, similarity))

    meta = metadata or {}
    return PetMatch(
        pet_id=int(pet_id_str),
        score=similarity,
        similarity_percentage=((clamped + 1.0) / 2.0) * 100.0,
        color=meta.get("color") or None,
        size=meta.get("size") or None,
    )


def search_by_embedding(
    query_embedding: np.ndarray,
    match_count: int = DEFAULT_MATCH_COUNT,
) -> List[PetMatch]:
    """
    Busca os pets mais parecidos com um embedding de consulta.

    Usada tanto por `POST /compare` (embedding de imagem, via
    `search_by_image_embedding`) quanto por `POST /search` (embedding de
    texto, via `search_by_text_embedding`) — é a mesma função por baixo,
    porque o CLIP projeta imagem e texto no mesmo espaço vetorial, e o
    que fica salvo por pet é sempre o embedding de imagem.
    """
    collection = get_pet_embeddings_collection()

    try:
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=match_count,
        )
    except Exception as exc:
        logger.exception("Falha ao consultar o ChromaDB.")
        raise RuntimeError("Falha ao buscar pets similares no banco.") from exc

    ids = results.get("ids", [[]])[0]
    distances = results.get("distances", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    return [
        _to_pet_match(pid, dist, meta)
        for pid, dist, meta in zip(ids, distances, metadatas)
    ]


# Aliases explícitos para deixar claro, no ponto de chamada (routes.py),
# qual caso de uso está sendo atendido — mesma implementação por baixo.
search_by_image_embedding = search_by_embedding
search_by_text_embedding = search_by_embedding



# Execução direta: smoke test manual (vetores aleatórios só para validar upsert/query/delete no ChromaDB)
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    rng = np.random.default_rng(seed=0)
    dim = 512

    fake_pets = {
        101: rng.normal(size=dim).astype(np.float32),
        102: rng.normal(size=dim).astype(np.float32),
        103: rng.normal(size=dim).astype(np.float32),
    }
    for vec in fake_pets.values():
        vec /= np.linalg.norm(vec)

    for pid, vec in fake_pets.items():
        upsert_pet_embedding(pid, vec, color="preto", size="médio")
    print(f"{len(fake_pets)} pets fake inseridos.")

    query = fake_pets[101] + rng.normal(scale=0.01, size=dim).astype(np.float32)
    query /= np.linalg.norm(query)

    matches = search_by_image_embedding(query, match_count=5)
    print("Resultados da busca (pet 101 deve vir em 1º):")
    for m in matches:
        print(f"  pet_id={m.pet_id} score={m.score:.4f} ({m.similarity_percentage:.1f}%) cor={m.color} porte={m.size}")

    delete_pet_embedding(101)
    matches_after_delete = search_by_image_embedding(query, match_count=5)
    remaining_ids = [m.pet_id for m in matches_after_delete]
    print(f"Depois de remover o pet 101, IDs restantes: {remaining_ids}")
