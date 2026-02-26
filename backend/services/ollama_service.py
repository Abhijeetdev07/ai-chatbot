import httpx
import json
from typing import AsyncGenerator
from config import OLLAMA_BASE_URL, MODEL_NAME


# ─── Helpers ────────────────────────────────────────────────────────────────

def _build_payload(messages: list[dict], stream: bool = False) -> dict:
    """Build the request payload for Ollama /api/chat endpoint."""
    has_images = any("images" in msg and msg["images"] for msg in messages)
    model_to_use = "moondream" if has_images else MODEL_NAME
    
    print(f"[OLLAMA] Using model: {model_to_use} (has_images: {has_images})")

    return {
        "model": model_to_use,
        "messages": messages,  # [{"role": "user"/"assistant", "content": "..."}]
        "stream": stream,
    }


# ─── Non-streaming ──────────────────────────────────────────────────────────

async def get_chat_response(messages: list[dict]) -> str:
    """
    Send a list of messages to Ollama and return the full AI response as a string.
    Use this when you don't need streaming.

    Args:
        messages: Chat history in OpenAI format:
                  [{"role": "user", "content": "Hello"}, ...]

    Returns:
        The assistant's reply as a plain string.
    """
    payload = _build_payload(messages, stream=False)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["message"]["content"]


# ─── Streaming ───────────────────────────────────────────────────────────────

async def stream_chat_response(messages: list[dict]) -> AsyncGenerator[str, None]:
    """
    Send messages to Ollama and stream the response token by token.
    Use this with FastAPI's StreamingResponse for real-time output.

    Args:
        messages: Chat history in OpenAI format.

    Yields:
        Individual text tokens as they arrive from the model.
    """
    payload = _build_payload(messages, stream=True)

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.strip():
                    continue
                try:
                    chunk = json.loads(line)
                    token = chunk.get("message", {}).get("content", "")
                    if token:
                        yield token
                    # Ollama sends {"done": true} as the last chunk
                    if chunk.get("done"):
                        break
                except json.JSONDecodeError:
                    continue  # skip malformed lines


# ─── Health Check ────────────────────────────────────────────────────────────

async def check_ollama_connection() -> bool:
    """
    Verify that Ollama is running and reachable.

    Returns:
        True if Ollama responds, False otherwise.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
    except httpx.RequestError:
        return False


async def list_available_models() -> list[str]:
    """
    Return a list of model names currently available in Ollama.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            resp.raise_for_status()
            data = resp.json()
            return [m["name"] for m in data.get("models", [])]
    except (httpx.RequestError, KeyError):
        return []
