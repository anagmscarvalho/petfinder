from __future__ import annotations

from typing import Any, List, Optional, Sequence, Tuple

import numpy as np


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    
    #Similaridade de cosseno entre dois vetores 1D (intervalo [-1, 1]

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    a_normalized = a / norm_a if norm_a > 0 else a
    b_normalized = b / norm_b if norm_b > 0 else b

    return float(np.dot(a_normalized, b_normalized))


def cosine_similarity_batch(query: np.ndarray, candidates: np.ndarray) -> np.ndarray:
    
    query_norm = np.linalg.norm(query)
    query_normalized = query / query_norm if query_norm > 0 else query

    norms = np.linalg.norm(candidates, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    candidates_normalized = candidates / norms

    return candidates_normalized @ query_normalized


def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Distância euclidiana entre dois vetores — quanto menor, mais parecido."""
    return float(np.linalg.norm(a - b))


def dot_product(a: np.ndarray, b: np.ndarray) -> float:
    """Produto interno bruto (sem normalizar) entre dois vetores."""
    return float(np.dot(a, b))


def similarity_to_percentage(similarity: float) -> float:
    #Converte uma similaridade de cosseno em um percentual 0-100% para
    #exibir na interface (ex.: "87% de similaridade").
    clamped = max(-1.0, min(1.0, similarity))
    return ((clamped + 1.0) / 2.0) * 100.0


def rank_by_similarity(
    query: np.ndarray,
    candidates: np.ndarray,
    ids: Sequence[Any],
    top_k: Optional[int] = None,
) -> List[Tuple[Any, float, float]]:
    #Ordena candidatos por similaridade decrescente em relação a `query`.
    if len(ids) != candidates.shape[0]:
        raise ValueError("`ids` deve ter o mesmo comprimento de `candidates`.")

    similarities = cosine_similarity_batch(query, candidates)
    order = np.argsort(-similarities)  # decrescente

    if top_k is not None:
        order = order[:top_k]

    return [
        (ids[i], float(similarities[i]), similarity_to_percentage(float(similarities[i])))
        for i in order
    ]


# Execução direta: smoke test manual
if __name__ == "__main__":
    rng = np.random.default_rng(seed=42)
    query_vec = rng.normal(size=8)
    query_vec /= np.linalg.norm(query_vec)

    candidate_vecs = rng.normal(size=(5, 8))
    candidate_vecs /= np.linalg.norm(candidate_vecs, axis=1, keepdims=True)

    # Força o primeiro candidato a ser quase idêntico à query, pra validar que ele sobe pro topo do ranking.
    candidate_vecs[0] = query_vec + rng.normal(scale=0.01, size=8)
    candidate_vecs[0] /= np.linalg.norm(candidate_vecs[0])

    ranked = rank_by_similarity(query_vec, candidate_vecs, ids=[f"pet_{i}" for i in range(5)])
    for pet_id, sim, pct in ranked:
        print(f"{pet_id}: similaridade={sim:.4f} | {pct:.1f}%")
