from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# ─── Request Schemas (incoming) ──────────────────────────────────────────────

class UserRegister(BaseModel):
    """Payload for creating a new account."""
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """Payload for logging in."""
    email: EmailStr
    password: str


# ─── Response Schema (outgoing — never expose password) ──────────────────────

class UserResponse(BaseModel):
    """Safe user object returned to the client."""
    id: str = Field(alias="_id")
    name: str
    email: str
    created_at: datetime

    model_config = {"populate_by_name": True}
