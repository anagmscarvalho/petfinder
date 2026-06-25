from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from .clip_model import get_image_embedding
from .similarity import find_matches

app = FastAPI(title="PetFinder AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "petfinder-ai"}


@app.post("/embedding")
async def generate_embedding(photo: UploadFile = File(...)):
    """Gera embedding CLIP de uma imagem."""
    image_bytes = await photo.read()
    embedding = get_image_embedding(image_bytes)
    return {"embedding": embedding.tolist()}


@app.post("/compare")
async def compare(
    photo: UploadFile = File(...),
    # TODO: receber lista de embeddings cadastrados para comparar
):
    """Compara uma foto com os embeddings cadastrados e retorna % de similaridade."""
    image_bytes = await photo.read()
    query_embedding = get_image_embedding(image_bytes)
    # TODO: implementar comparação com embeddings do banco
    matches = find_matches(query_embedding, registered_embeddings=[])
    return {"matches": matches}
