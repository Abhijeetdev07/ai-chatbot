# ─── History Routes ──────────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException
from services.db_service import get_history, list_conversations, delete_conversation
from models.conversation import Conversation, ConversationSummary
from routes.auth import get_current_user
from fastapi import Depends

router = APIRouter()


@router.get("/conversations", response_model=list[ConversationSummary])
async def get_all_conversations(current_user: dict = Depends(get_current_user)):
    """List all previous conversations (without their entire message history)."""
    return await list_conversations(current_user["_id"])


@router.get("/history/{conversation_id}", response_model=Conversation)
async def get_conversation_history(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific conversation and all its messages by ID."""
    history = await get_history(conversation_id, current_user["_id"])
    if not history:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return history


@router.delete("/conversations/{conversation_id}")
async def delete_conversation_by_id(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a specific conversation from the database."""
    success = await delete_conversation(conversation_id, current_user["_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found or already deleted")
    return {"status": "success", "message": "Conversation deleted"}
