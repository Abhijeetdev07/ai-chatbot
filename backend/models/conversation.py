from datetime import datetime
from pydantic import BaseModel, Field


# ─── Standard Models ─────────────────────────────────────────────────────────

class Message(BaseModel):
    """A single message within a conversation."""
    role: str       # "user" or "assistant"
    content: str    # The actual text
    images: list[str] | None = None  # Optional list of base64 encoded images
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Conversation(BaseModel):
    """A full conversation document returned by the API."""
    id: str = Field(alias="_id")  # Map MongoDB _id to standard 'id'
    title: str
    messages: list[Message]
    created_at: datetime
    updated_at: datetime

    # Allow mapping _id -> id
    model_config = {"populate_by_name": True}


class ConversationSummary(BaseModel):
    """A lightweight conversation document used for listing endpoints."""
    id: str = Field(alias="_id")
    title: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"populate_by_name": True}


# ─── API Requests & Responses ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Payload sent by the frontend when sending a new message."""
    conversation_id: str | None = None  # None means create a new conversation
    message: str                        # User's chat input
    images: list[str] | None = None     # Optional list of base64 encoded images
    stream: bool = True                 # Whether to return standard JSON or SSE stream


class ChatResponse(BaseModel):
    """Payload returned by the backend for non-streaming chats."""
    conversation_id: str
    reply: str
