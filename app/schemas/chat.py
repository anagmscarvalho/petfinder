from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserRead
from app.schemas.pet import PetRead

class MensagemCreate(BaseModel):
    texto: str

class MensagemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    conversa_id: int
    remetente_id: int
    texto: str
    lida: bool
    criado_em: datetime

class ConversaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    pet_id: int
    iniciador_id: int
    dono_id: int
    criado_em: datetime
    
    # Detalhes adicionais para o frontend
    pet: PetRead | None = None
    outro_usuario: UserRead | None = None
    ultima_mensagem: MensagemRead | None = None
    nao_lidas: int = 0
