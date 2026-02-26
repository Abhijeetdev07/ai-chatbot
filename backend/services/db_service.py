from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME

# ─── Database Client ─────────────────────────────────────────────────────────

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
conversations_col = db["conversations"]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _serialize(doc: dict) -> dict:
    """Convert MongoDB ObjectId fields to strings for JSON serialisation."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# ─── Create ──────────────────────────────────────────────────────────────────

async def create_conversation(user_id: str, title: str = "New Chat") -> dict:
    """
    Create a new conversation document in MongoDB.

    Args:
        title: A human-friendly name for the conversation.

    Returns:
        The newly created conversation as a dict (with _id as string).
    """
    doc = {
        "user_id": user_id,
        "title": title,
        "messages": [],
        "created_at": _now(),
        "updated_at": _now(),
    }
    result = await conversations_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


# ─── Read ────────────────────────────────────────────────────────────────────

async def get_history(conversation_id: str, user_id: str) -> dict | None:
    """
    Retrieve a full conversation (including all messages) by its ID.

    Args:
        conversation_id: The string representation of the MongoDB ObjectId.

    Returns:
        The conversation dict, or None if not found.
    """
    try:
        oid = ObjectId(conversation_id)
    except Exception:
        return None

    doc = await conversations_col.find_one({"_id": oid, "user_id": user_id})
    return _serialize(doc) if doc else None


async def list_conversations(user_id: str) -> list[dict]:
    """
    Return all conversations (without messages array) sorted by most recent.

    Returns:
        List of conversation summaries.
    """
    cursor = conversations_col.find(
        {"user_id": user_id},
        {"messages": 0, "user_id": 0}  # exclude messages & user_id for a lightweight list
    ).sort("updated_at", -1)

    results = []
    async for doc in cursor:
        results.append(_serialize(doc))
    return results


# ─── Update (Save Message) ───────────────────────────────────────────────────

async def save_message(conversation_id: str, user_id: str, role: str, content: str, images: list[str] | None = None) -> bool:
    """
    Append a single message to an existing conversation.

    Args:
        conversation_id: Target conversation's ObjectId as string.
        role:            Either "user" or "assistant".
        content:         The text content of the message.
        images:          Optional list of base64 encoded images.

    Returns:
        True if the update succeeded, False otherwise.
    """
    try:
        oid = ObjectId(conversation_id)
    except Exception:
        return False

    message = {
        "role": role,
        "content": content,
        "timestamp": _now(),
    }
    if images:
        message["images"] = images

    result = await conversations_col.update_one(
        {"_id": oid, "user_id": user_id},
        {
            "$push": {"messages": message},
            "$set": {"updated_at": _now()},
        },
    )
    return result.modified_count > 0


async def update_conversation_title(conversation_id: str, user_id: str, title: str) -> bool:
    """
    Update the title of a conversation (e.g. auto-set from first user message).

    Args:
        conversation_id: Target conversation's ObjectId as string.
        title:           New title string.

    Returns:
        True if updated, False otherwise.
    """
    try:
        oid = ObjectId(conversation_id)
    except Exception:
        return False

    result = await conversations_col.update_one(
        {"_id": oid, "user_id": user_id},
        {"$set": {"title": title, "updated_at": _now()}},
    )
    return result.modified_count > 0


# ─── Delete ──────────────────────────────────────────────────────────────────

async def delete_conversation(conversation_id: str, user_id: str) -> bool:
    """
    Permanently delete a conversation by its ID.

    Args:
        conversation_id: The conversation's ObjectId as string.

    Returns:
        True if deleted, False if not found or invalid.
    """
    try:
        oid = ObjectId(conversation_id)
    except Exception:
        return False

    result = await conversations_col.delete_one({"_id": oid, "user_id": user_id})
    return result.deleted_count > 0
