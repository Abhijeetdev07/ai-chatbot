from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from config import JWT_SECRET, JWT_EXPIRE_HOURS

# ─── Password Hashing ────────────────────────────────────────────────────────

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Compare a plain-text password against a bcrypt hash."""
    return _pwd_context.verify(plain, hashed)


# ─── JWT Tokens ──────────────────────────────────────────────────────────────

def create_token(user_id: str) -> str:
    """
    Generate a signed JWT token containing the user's ID.

    Args:
        user_id: MongoDB ObjectId string of the user.

    Returns:
        Signed JWT token string.
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {
        "sub": user_id,       # subject = user id
        "exp": expire,        # expiry timestamp
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> str:
    """
    Decode and verify a JWT token, returning the user_id.

    Args:
        token: Bearer JWT token string.

    Returns:
        user_id (str) extracted from the token.

    Raises:
        HTTPException 401 if token is invalid or expired.
    """
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_error
        return user_id
    except JWTError:
        raise credentials_error
