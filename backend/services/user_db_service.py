from datetime import datetime, timezone
from bson import ObjectId
from config import MONGO_URI, DB_NAME
from motor.motor_asyncio import AsyncIOMotorClient

# ─── MongoDB client (reuse same connection) ───────────────────────────────────

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
users_col = db["users"]


def _serialize(doc: dict) -> dict:
    """Convert MongoDB _id ObjectId to string."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# ─── Create ──────────────────────────────────────────────────────────────────

async def create_user(name: str, email: str, hashed_password: str) -> dict:
    """
    Save a new user to the MongoDB users collection.

    Args:
        name:            User's display name.
        email:           User's email (must be unique).
        hashed_password: bcrypt-hashed password string.

    Returns:
        The created user document as a dict (with _id as string).
    """
    doc = {
        "name": name,
        "email": email.lower().strip(),
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


# ─── Read ────────────────────────────────────────────────────────────────────

async def get_user_by_email(email: str) -> dict | None:
    """
    Find a user by their email address (used during login).

    Args:
        email: Email to look up.

    Returns:
        User document dict, or None if not found.
    """
    doc = await users_col.find_one({"email": email.lower().strip()})
    return _serialize(doc) if doc else None


async def get_user_by_id(user_id: str) -> dict | None:
    """
    Find a user by their MongoDB ObjectId string (used for auth guard).

    Args:
        user_id: String form of ObjectId.

    Returns:
        User document dict, or None if not found.
    """
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    doc = await users_col.find_one({"_id": oid})
    return _serialize(doc) if doc else None
