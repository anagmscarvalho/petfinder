from __future__ import annotations

import logging
from typing import Sequence

import numpy as np
import torch

from .model import get_device, get_model, get_tokenizer

logger = logging.getLogger(__name__)


def _l2_normalize(vectors: np.ndarray) -> np.ndarray:
    
    #Normaliza para norma L2 unitária 
    if vectors.ndim == 1:
        norm = np.linalg.norm(vectors)
        return vectors / norm if norm > 0 else vectors

    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


def generate_text_embedding(text: str, normalize: bool = True) -> np.ndarray:
    
    embeddings = generate_text_embeddings([text], normalize=normalize)
    return embeddings[0]


def generate_text_embeddings(texts: Sequence[str], normalize: bool = True) -> np.ndarray:
   
    if not texts:
        raise ValueError("A lista de textos está vazia.")

    model = get_model()
    tokenizer = get_tokenizer()
    device = get_device()

    tokens = tokenizer(list(texts)).to(device)

    with torch.no_grad():
        text_features = model.encode_text(tokens)

    embeddings = text_features.float().cpu().numpy()

    if normalize:
        embeddings = _l2_normalize(embeddings)

    return embeddings


# Execução direta: smoke test manual
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    query = sys.argv[1] if len(sys.argv) > 1 else "cachorro preto de porte médio"
    vector = generate_text_embedding(query)
    print(f"Texto: {query!r}")
    print(f"Shape do embedding: {vector.shape}")
    print(f"Norma L2 (deve ser ~1.0): {np.linalg.norm(vector):.4f}")
