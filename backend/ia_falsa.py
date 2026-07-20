from fastapi import FastAPI, File, Form, UploadFile

app = FastAPI(title="Mock IA")
base: dict[int, str] = {}


@app.post("/embeddings")
async def gravar(photo: UploadFile = File(...), pet_id: int = Form(...)):
    base[pet_id] = photo.filename
    return {"ok": True}


@app.post("/compare")
async def comparar(photo: UploadFile = File(...)):
    return {
        "matches": [
            {"pet_id": pid, "score": 0.9 - i * 0.05}
            for i, pid in enumerate(sorted(base, reverse=True))
        ]
    }


@app.delete("/embeddings/{pet_id}")
async def remover(pet_id: int):
    base.pop(pet_id, None)
    return {"ok": True}