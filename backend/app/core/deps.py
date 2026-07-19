#  Injeção de dependencia

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decodificar_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login") #fastapi le o token do 

credenciais_invalidas = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Credenciais inválidas ou expiradas.",
    headers={"WWW-Authenticate": "Bearer"},
)


def usuario_logado(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    sub = decodificar_token(token)
    if sub is None:
        raise credenciais_invalidas

    usuario = session.get(User, int(sub))
    if usuario is None or not usuario.ativo:
        raise credenciais_invalidas

    return usuario

# Endpoint nao vai executar se der erro nessa parte (401)

def usuario_admin(usuario: User = Depends(usuario_logado)) -> User:
    if not usuario.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Esta ação é restrita à equipe do PetFinder.",
        )
    return usuario



