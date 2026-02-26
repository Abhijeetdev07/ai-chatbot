from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from models.user import UserRegister, UserLogin, UserResponse
from services.auth_service import hash_password, verify_password, create_token, decode_token
from services.user_db_service import create_user, get_user_by_email, get_user_by_id

router = APIRouter()
bearer_scheme = HTTPBearer()


# ─── Dependency: Get current logged-in user from Bearer token ─────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """FastAPI dependency — decodes JWT and returns the user doc."""
    token = credentials.credentials
    user_id = decode_token(token)  # raises 401 if invalid
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ─── POST /api/auth/register ─────────────────────────────────────────────────

@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister):
    """
    Register a new user.
    Validates email uniqueness, hashes the password, saves to DB, returns a JWT.
    """
    # Check email already exists
    existing = await get_user_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    # Hash password and save user
    hashed_pw = hash_password(body.password)
    user = await create_user(body.name, body.email, hashed_pw)

    # Return JWT token
    token = create_token(user["_id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
        },
    }


# ─── POST /api/auth/login ─────────────────────────────────────────────────────

@router.post("/auth/login")
async def login(body: UserLogin):
    """
    Log in with email and password.
    Returns a JWT token if credentials are valid.
    """
    user = await get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token(user["_id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
        },
    }


# ─── GET /api/auth/me ─────────────────────────────────────────────────────────

@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Return the currently authenticated user's profile.
    Requires a valid Bearer token in the Authorization header.
    """
    return current_user
