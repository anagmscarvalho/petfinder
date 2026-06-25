from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# instância única, reaproveitada em toda a aplicação
password_hash = PasswordHash.recommended()

def hash_senha(senha: str) -> str:
    return password_hash.hash(senha)


def verificar_senha(senha: str, hash_armazenado: str) -> bool:
    return password_hash.verify(senha, hash_armazenado)


def criar_token_acesso(sub: str) -> str:
    expira = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": sub, "exp": expira}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decodificar_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
