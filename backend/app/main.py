from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
 
from app.core.database import criar_banco_e_tabelas
from app.routers import anuncios, auth, users, pets, feed
from app.core.config import settings
from app.routers import auth, users, pets, anuncios, feed, search, chat



@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(exist_ok=True)
    criar_banco_e_tabelas()
    yield

app = FastAPI(title="PetFinder API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # liberado em dev; restringir em produção, trocar pelo correto domínio do front-end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    f"/{settings.upload_dir}",
    StaticFiles(directory=settings.upload_dir),
    name="uploads",
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pets.router)
app.include_router(anuncios.router)
app.include_router(feed.router)
app.include_router(search.router)
app.include_router(chat.router)



@app.get("/")
def raiz():
    return {"status": "ok"}
