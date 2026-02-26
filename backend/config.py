from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# ─── MongoDB ────────────────────────────────────────────────────
MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME: str = os.getenv("DB_NAME", "chatbot_db")

# ─── Ollama ─────────────────────────────────────────────────────
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME: str = os.getenv("MODEL_NAME", "phi3:mini")

# ─── CORS ───────────────────────────────────────────────────────
# Comma-separated list of allowed origins for CORS
_cors_raw: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS: list[str] = [origin.strip() for origin in _cors_raw.split(",")]

# ─── App ────────────────────────────────────────────────────────
APP_TITLE: str = "AI Chatbot API"
APP_VERSION: str = "1.0.0"

# ─── JWT ────────────────────────────────────────────────────────
JWT_SECRET: str = os.getenv("JWT_SECRET", "change_this_secret")
JWT_EXPIRE_HOURS: int = int(os.getenv("JWT_EXPIRE_HOURS", "24"))
