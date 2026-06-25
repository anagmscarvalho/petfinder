from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.user import User
from app.core.security import hash_senha, verificar_senha, criar_token_acesso
from app.schemas.user import UserCreate, UserRead, Token


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar(dados: UserCreate, session: Session = Depends(get_session)):
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
