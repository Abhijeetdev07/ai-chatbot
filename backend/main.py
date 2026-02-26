from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import CORS_ORIGINS, APP_TITLE, APP_VERSION
from routes import chat, history, auth

# ─── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Backend API for local Ollama Chatbot with MongoDB",
)

# ─── CORS Configuration ──────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# ─── Routes ──────────────────────────────────────────────────────────────────

# Health check route
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

# Mount our custom routers
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Start the server using Uvicorn when running this file directly
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True  # Auto-reload makes dev easier (restarts on file save)
    )
