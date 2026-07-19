import io

from fastapi import HTTPException, UploadFile, status
from PIL import Image

from app.core.config import settings

TIPOS_PERMITIDOS = {"image/jpeg": "jpg", "image/png": "png"}


async def validar_imagem(arquivo: UploadFile) -> tuple[bytes, str]:
    extensao = TIPOS_PERMITIDOS.get(arquivo.content_type)
    if extensao is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Envie uma imagem JPEG ou PNG."
        )

    conteudo = await arquivo.read()
    if len(conteudo) > settings.max_foto_mb * 1024 * 1024:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"A imagem excede o limite de {settings.max_foto_mb} MB.",
        )

    try:
        Image.open(io.BytesIO(conteudo)).verify()
    except Exception:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "O arquivo enviado não é uma imagem válida."
        )

    return conteudo, extensao