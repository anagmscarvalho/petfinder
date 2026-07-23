from __future__ import annotations

import logging
import os
import threading
from typing import Optional

import chromadb
from chromadb.api.models.Collection import Collection

logger = logging.getLogger(__name__)

DEFAULT_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
DEFAULT_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "pet_embeddings")


class _ChromaCollectionLoader:
    """Singleton thread-safe: abre a coleção do ChromaDB uma única vez por processo."""

    _instance: Optional["_ChromaCollectionLoader"] = None
    _instance_lock = threading.Lock()

    def __new__(cls) -> "_ChromaCollectionLoader":
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._collection = None
                    cls._instance._load_lock = threading.Lock()
        return cls._instance

    def get(self) -> Collection:
        if self._collection is not None:
            return self._collection

        with self._load_lock:
            if self._collection is not None:
                return self._collection

            logger.info("Abrindo ChromaDB persistente em '%s'...", DEFAULT_PERSIST_DIR)
            client = chromadb.PersistentClient(path=DEFAULT_PERSIST_DIR)

            # "cosine" é a métrica certa aqui: os embeddings do CLIP já saem normalizados (norma L2 = 1) em image_embedding.py e text_embedding.py
            self._collection = client.get_or_create_collection(
                name=DEFAULT_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
            return self._collection


_loader = _ChromaCollectionLoader()


def get_pet_embeddings_collection() -> Collection:
    """Retorna a coleção do ChromaDB usada para os embeddings dos pets."""
    return _loader.get()
