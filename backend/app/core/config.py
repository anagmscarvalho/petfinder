from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file=ENV_PATH)

	jwt_secret: str
	jwt_algorithm: str ="HS256"
	access_token_expire_minutes: int = 60
	upload_dir: str = "uploads"
	max_foto_mb: int = 5

	ia_service_url: str = "http://localhost:8001"
	ia_timeout: float = 120.0
	score_minimo: float = 0.75

settings = Settings()


