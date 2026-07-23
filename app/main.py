from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
 
from app.core.database import criar_banco_e_tabelas
from app import models
from app.routers import auth, users, pets, anuncios, feed, search, chat, notifications
from app.core.config import settings

import asyncio
from app.tasks import limpar_chats_antigos

@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(exist_ok=True)
    criar_banco_e_tabelas()
    
    # Iniciar a tarefa de limpeza de chats em background
    asyncio.create_task(limpar_chats_antigos())
    
    yield

app = FastAPI(title="PetFinder API", lifespan=lifespan)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    from fastapi.encoders import jsonable_encoder
    try:
        body = await request.body()
        body_decoded = body.decode()
    except Exception:
        body_decoded = "body indisponível (stream consumido ou multipart)"
    print(f"422 ERROR: {exc.errors()}")
    print(f"422 BODY: {body_decoded}")
    return JSONResponse(
        status_code=422,
        content={"detail": jsonable_encoder(exc.errors()), "body": body_decoded},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # liberado em dev; restringir em produção, trocar pelo correto domínio do front-end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
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
app.include_router(notifications.router)

@app.get("/")
def raiz():
    return {"status": "ok"}
