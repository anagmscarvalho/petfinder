from contextlib import asynccontextmanager

from fastapi import FastAPI
 
from app.core.database import criar_banco_e_tabelas
from app import models  # registra User, Pet e favoritos
from app.routers import auth, users, pets

@asynccontextmanager
async def lifespan(app: FastAPI):
    criar_banco_e_tabelas()
    yield


app = FastAPI(title="PetFinder API", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pets.router)

@app.get("/")
def raiz():
    return {"status": "ok"}
