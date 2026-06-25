"""Módulo de cálculo de similaridade entre embeddings."""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def find_matches(
    query_embedding: np.ndarray,
    registered_embeddings: list,
    top_k: int = 10,
) -> list:
    """
    Compara o embedding da query com os embeddings cadastrados.
    Retorna os top_k matches com porcentagem de similaridade.
    """
    if not registered_embeddings:
        return []

    query = query_embedding.reshape(1, -1)
    registered = np.array(registered_embeddings)
    
    similarities = cosine_similarity(query, registered).flatten()
    
    # Ordenar por maior similaridade
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    matches = []
    for idx in top_indices:
        score = float(similarities[idx])
        matches.append({
            "index": int(idx),
            "similarity_percent": round(score * 100, 2),
        })
    
    return matches
