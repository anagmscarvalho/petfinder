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
