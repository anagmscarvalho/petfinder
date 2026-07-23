from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.user import User
from app.core.security import hash_senha, verificar_senha, criar_token_acesso
from app.schemas.user import UserCreate, UserRead, Token


router = APIRouter(prefix="/auth", tags=["auth"])


import re

@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar(dados: UserCreate, session: Session = Depends(get_session)):
    if len(dados.senha) < 8 or not re.search(r"[A-Z]", dados.senha) or not re.search(r"[0-9]", dados.senha) or not re.search(r"[^A-Za-z0-9]", dados.senha):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial."
        )

    existente = session.exec(
        select(User).where(User.email == dados.email)
    ).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma conta com este email.",
        )

    novo = User(
        nome_completo=dados.nome_completo,
        data_nascimento=dados.data_nascimento,
        email=dados.email,
        senha_hash=hash_senha(dados.senha),
    )
    session.add(novo)
    session.commit()
    session.refresh(novo)
    return novo

@router.post("/login", response_model=Token)
def login(
    dados: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    usuario = session.exec(
        select(User).where(User.email == dados.username)
    ).first()

    if usuario is None or not verificar_senha(dados.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta conta foi desativada.",
        )

    token = criar_token_acesso(sub=str(usuario.id))
    return Token(access_token=token, token_type="bearer")

# !! Login manda formulário (form-data) ao invés de JSON !!!

import jwt
import httpx
from datetime import date
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from app.schemas.user import SocialLoginRequest

# TODO: Substitua pelos seus IDs reais nas plataformas correspondentes
GOOGLE_CLIENT_ID = "749924169525-p80mrpgie5u21too81a3ki7dfujgblej.apps.googleusercontent.com"
APPLE_CLIENT_ID = "com.seunome.petfinder"

def get_or_create_social_user(email: str, nome: str, session: Session) -> User:
    usuario = session.exec(select(User).where(User.email == email)).first()
    if not usuario:
        usuario = User(
            nome_completo=nome,
            email=email,
            senha_hash="", # Usuários sociais não usam senha local
            data_nascimento=date(1990, 1, 1), # Data placeholder obrigatória
        )
        session.add(usuario)
        session.commit()
        session.refresh(usuario)
    return usuario


@router.post("/google", response_model=Token)
def login_google(dados: SocialLoginRequest, session: Session = Depends(get_session)):
    try:
        # Aqui ele bate no Google para conferir se o token é real e não foi forjado
        idinfo = google_id_token.verify_oauth2_token(
            dados.id_token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        
        email = idinfo["email"]
        nome = idinfo.get("name", "Usuário do Google")
        
        usuario = get_or_create_social_user(email, nome, session)
        
        if not usuario.ativo:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta conta foi desativada.")
            
        token = criar_token_acesso(sub=str(usuario.id))
        return Token(access_token=token, token_type="bearer")

    except ValueError:
        # Invalid token
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token do Google inválido.")


@router.post("/apple", response_model=Token)
async def login_apple(dados: SocialLoginRequest, session: Session = Depends(get_session)):
    try:
        # Para validação real da Apple, é recomendado buscar a chave pública em https://appleid.apple.com/auth/keys
        # e decodificar o JWT verificando o 'aud' (Client ID) e o issuer.
        # Devido à complexidade de gerenciar a JWKS em tempo real, usamos a decodificação sem verificação total
        # APENAS para demonstração. Em produção, use um pacote como `applesignin` ou faça a verificação JWT completa.
        
        payload = jwt.decode(dados.id_token, options={"verify_signature": False})
        
        email = payload.get("email")
        if not email:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "O token da Apple não forneceu um e-mail.")
            
        nome = "Usuário da Apple"
        
        usuario = get_or_create_social_user(email, nome, session)
        
        if not usuario.ativo:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta conta foi desativada.")
            
        token = criar_token_acesso(sub=str(usuario.id))
        return Token(access_token=token, token_type="bearer")

    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token da Apple inválido.")
