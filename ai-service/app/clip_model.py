"""Módulo para carregar e usar o modelo CLIP para gerar embeddings de imagens."""

import io
import numpy as np
from PIL import Image

# O modelo será carregado sob demanda (lazy loading)
_model = None
_processor = None


def _load_model():
    """Carrega o modelo CLIP (lazy loading para não travar o startup)."""
    global _model, _processor
    if _model is None:
        from transformers import CLIPModel, CLIPProcessor
        model_name = "openai/clip-vit-base-patch32"
        _processor = CLIPProcessor.from_pretrained(model_name)
        _model = CLIPModel.from_pretrained(model_name)
        print(f"✅ Modelo CLIP carregado: {model_name}")
    return _model, _processor


def get_image_embedding(image_bytes: bytes) -> np.ndarray:
    """Gera o embedding CLIP de uma imagem a partir dos bytes."""
    model, processor = _load_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    outputs = model.get_image_features(**inputs)
    embedding = outputs.detach().numpy().flatten()
    # Normalizar para cosine similarity
    embedding = embedding / np.linalg.norm(embedding)
    return embedding
