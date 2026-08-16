from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisSOC"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL: str = Field(..., env="REDIS_URL")
    KAFKA_BOOTSTRAP_SERVERS: str = Field(..., env="KAFKA_BOOTSTRAP_SERVERS")
    # AI Provider settings
    AI_PROVIDER: str = Field(default="mock", env="AI_PROVIDER")  # nim or mock
    NIM_API_URL: str = Field(default="https://integrate.api.nvidia.com/v1", env="NIM_API_URL")
    NIM_API_KEY: str = Field(default="", env="NIM_API_KEY")
    NIM_MODEL: str = Field(default="nemotron-3-8b-chat", env="NIM_MODEL")
    AI_REQUEST_TIMEOUT: int = Field(default=30, env="AI_REQUEST_TIMEOUT")
    AI_MAX_RETRIES: int = Field(default=3, env="AI_MAX_RETRIES")
    AI_BACKOFF_FACTOR: float = Field(default=0.5, env="AI_BACKOFF_FACTOR")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()