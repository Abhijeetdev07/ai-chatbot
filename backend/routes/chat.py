import json
import traceback
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from models.conversation import ChatRequest, ChatResponse
from services.db_service import create_conversation, save_message, update_conversation_title, get_history
from services.ollama_service import stream_chat_response, get_chat_response
from routes.auth import get_current_user

router = APIRouter()


@router.post("/chat")
async def chat_endpoint(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Handle a new chat message from the user.
    If no conversation_id is provided, creates a new one.
    """
    try:
        # 1. Get or Create conversation
        user_id = current_user["_id"]

        if not request.conversation_id:
            conv = await create_conversation(user_id, title="New Chat")
            request.conversation_id = conv["_id"]
            # Set the title to the user's first message snippet
            title = request.message[:30] + ("..." if len(request.message) > 30 else "")
            await update_conversation_title(request.conversation_id, user_id, title)
        
        # 2. Save User Message
        await save_message(request.conversation_id, user_id, "user", request.message, request.images)

        # 3. Fetch Full History to send to Ollama as context
        history_doc = await get_history(request.conversation_id, user_id)
        if not history_doc:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Format messages for Ollama payload: [{"role": "user", "content": "..."}, ...]
        ollama_messages = []
        for msg in history_doc.get("messages", []):
            o_msg = {"role": msg["role"], "content": msg["content"]}
            if msg.get("images"):
                o_msg["images"] = msg["images"]
            ollama_messages.append(o_msg)

        # 4. Handle Streaming Response
        if request.stream:
            async def response_generator():
                def _sse(event: str | None, data: str) -> str:
                    normalized = data.replace("\r\n", "\n").replace("\r", "\n")
                    lines = normalized.split("\n")
                    payload = ""
                    if event:
                        payload += f"event: {event}\n"
                    for line in lines:
                        payload += f"data: {line}\n"
                    payload += "\n"
                    return payload

                full_reply = ""

                yield _sse("meta", json.dumps({"conversation_id": request.conversation_id}))
                # Stream tokens from Ollama to the client
                async for token in stream_chat_response(ollama_messages):
                    full_reply += token
                    yield _sse("token", token)
                await save_message(request.conversation_id, user_id, "assistant", full_reply)

                yield _sse("done", "")

            return StreamingResponse(
                response_generator(), 
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            )
        
        # 5. Handle Non-Streaming Response (Fallback)
        else:
            full_reply = await get_chat_response(ollama_messages)
            await save_message(request.conversation_id, user_id, "assistant", full_reply)
            return ChatResponse(
                conversation_id=request.conversation_id,
                reply=full_reply
            )
    
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        print(f"[CHAT ERROR] {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
