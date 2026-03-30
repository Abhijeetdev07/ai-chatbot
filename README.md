# AI Chatbot — Project Documentation

## 1. Project Overview

**Project Name:** AI Chatbot  
**Type:** Full-Stack Web Application  
**Description:** A locally-hosted, intelligent chatbot powered by Ollama LLMs. Users can register, log in, and have natural-language conversations with an AI assistant. Conversations are stored in MongoDB and are isolated per user. The chat supports real-time streaming responses (typing effect) using Server-Sent Events (SSE). Optional image input is supported in the API payload (base64).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **LLM (AI)** | [Ollama](https://ollama.com) — runs models locally (e.g. `phi 3:mini`, `llama3.2`) |
| **Backend** | Python 3.11 + [FastAPI](https://fastapi.tiangolo.com) |
| **Database** | [MongoDB](https://www.mongodb.com) via Motor (async driver) |
| **Frontend** | React 19 + [Vite](https://vitejs.dev) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Auth** | JWT (python-jose) + bcrypt (passlib) |
| **Icons** | [react-icons](https://react-icons.github.io/react-icons/) |

---

## 3. Project Structure

```
chatbot/
├── backend/
│   ├── .env                        # Environment variables
│   ├── config.py                   # Loads settings from .env
│   ├── main.py                     # FastAPI app + CORS + router mounting
│   ├── models/
│   │   ├── conversation.py         # Pydantic schemas for chat
│   │   └── user.py                 # Pydantic schemas for auth
│   ├── routes/
│   │   ├── auth.py                 # POST /register, /login, GET /me
│   │   ├── chat.py                 # POST /chat
│   │   └── history.py              # GET/DELETE conversation history
│   └── services/
│       ├── auth_service.py         # bcrypt + JWT helpers
│       ├── db_service.py           # Conversation CRUD (Motor/MongoDB)
│       ├── ollama_service.py       # Ollama API streaming/non-streaming
│       └── user_db_service.py      # User CRUD (Motor/MongoDB)
│
└── frontend/
    ├── index.html
    ├── vite.config.js              # Vite + Tailwind + /api proxy
    └── src/
        ├── main.jsx                # App entry, axios interceptor
        ├── App.jsx                 # React Router routes
        ├── api/
        │   ├── authApi.js          # register(), login(), getMe()
        │   ├── axiosConfig.js      # Global Bearer token interceptor
        │   ├── chatApi.js          # sendMessage(), streamMessage(), getHistory(), listConversations()
        ├── components/
        │   ├── ChatWindow.jsx      # Scrollable message feed + typing indicator
        │   ├── MessageBubble.jsx   # User vs AI message bubbles
        │   ├── MessageInput.jsx    # Textarea + Send
        │   ├── ProtectedRoute.jsx  # Auth guard (redirect to /login)
        │   └── Sidebar.jsx         # Conversation list + profile menu
        ├── context/
        │   └── AuthContext.jsx     # Global user/token state + logout
        ├── hooks/
        │   └── useChat.js          # Chat state management hook
        └── pages/
            ├── Home.jsx            # Main chat layout
            ├── Login.jsx           # Login form
            └── Register.jsx        # Registration form
```

---

## 4. Environment Variables

**File:** `backend/.env`

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=chatbot_db
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=phi 3:mini
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRE_HOURS=24
```

---

## 5. API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create new account | ❌ Public |
| POST | `/api/auth/login` | Login, get JWT | ❌ Public |
| GET | `/api/auth/me` | Get current user | ✅ Bearer |

**Register Request:**
```json
{ "name": "Abhijeet", "email": "user@email.com", "password": "secret123" }
```
**Login / Register Response:**
```json
{ "access_token": "eyJ...", "token_type": "bearer", "user": { "id": "...", "name": "Abhijeet", "email": "user@email.com" } }
```

---

### Chat

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Send message, get AI reply (JSON or SSE stream) |

**Auth:** ✅ Bearer

**Request:**
```json
{ "conversation_id": null, "message": "Hello!", "stream": true, "images": ["<base64>"] }
```
**Non-stream Response (when `stream=false`):**
```json
{ "conversation_id": "6789abc...", "reply": "Hi! How can I help?" }
```

**Streaming Response (when `stream=true`):**
- `text/event-stream` (SSE)
- Events: `meta` (contains `conversation_id`), `token` (partial output), `done`

---

### History

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | List all conversations |
| GET | `/api/history/{id}` | Get full message history |
| DELETE | `/api/conversations/{id}` | Delete a conversation |

**Auth:** ✅ Bearer (all history endpoints)

---

## 6. Database Schema

### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "Abhijeet",
  "email": "user@email.com",
  "password": "$2b$12$...(bcrypt hash)",
  "created_at": "2026-02-25T20:30:00Z"
}
```

### `conversations` Collection
```json
{
  "_id": "ObjectId",
  "user_id": "<user ObjectId as string>",
  "title": "First 30 chars of first message...",
  "messages": [
    { "role": "user",      "content": "Hello!",         "timestamp": "...", "images": ["<base64>"] },
    { "role": "assistant", "content": "Hi! How can...", "timestamp": "..." }
  ],
  "created_at": "2026-02-25T20:00:00Z",
  "updated_at": "2026-02-25T20:01:00Z"
}
```

---

## 7. Features

| Feature | Status |
|---|---|
| User Registration & Login (JWT) | ✅ |
| Password hashing (bcrypt) | ✅ |
| Protected routes | ✅ |
| Multi-user chat isolation | ✅ |
| Conversation history (MongoDB) | ✅ |
| Sidebar with conversation list | ✅ |
| Logout | ✅ |
| AI chat (Ollama local LLM) | ✅ |
| Real-time streaming responses (SSE) | ✅ |
| Image input (base64 payload support) | ✅ |
| Mobile responsive UI | ✅ |
| Dark mode design | ✅ |
| Auto-scroll + typing indicator | ✅ |

---

## 8. Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running locally
- Ollama installed and running

### Step 1 — Start MongoDB
```bash
mongod
```

### Step 2 — Start Ollama
```bash
ollama serve
ollama pull phi 3:mini   # first time only
```

### Step 3 — Start Backend
```bash
cd backend
.\venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt    # first time only
uvicorn main:app --reload --port 8000
```

### Step 4 — Start Frontend
```bash
cd frontend
npm install          # first time only
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 9. Streaming Responses (Typing Effect)

The chat UI uses Server-Sent Events (SSE) to show AI output incrementally (token-by-token).

- Frontend: reads `text/event-stream` and appends tokens in real time
- Backend: emits SSE events `meta`, `token`, and `done`

This makes responses feel faster because you don't need to wait for the full reply.

---

## 10. Image Input (API)

The chat API supports optional image input via base64 in the request body:

```json
{
  "conversation_id": null,
  "message": "Describe this image",
  "images": ["<base64>"]
}
```

Note: The frontend UI for selecting/uploading images can be added as an enhancement (the backend payload format is already supported).

---

## 11. Screenshots

Add your screenshots to a folder like `screenshots/` and link them here.

Example:

```md
![Login](screenshots/login.png)
![Chat](screenshots/chat.png)
```

---

## 12. Known Issues & Fixes

| Issue | Fix |
|---|---|
| `bcrypt` 5.x incompatible with `passlib` | Downgraded to `bcrypt==4.0.1` |
| `phi3:mini` causes OOM (Out of Memory) | Switch to `phi 3:mini` in `.env` |
| CORS errors in development | Vite proxy configured: `/api` → `localhost:8000` |

---

## 13. Future Enhancements

- [ ] Image upload UI (file picker) + vision model (e.g. `llava`)
- [ ] Markdown rendering for code blocks
- [ ] Model selector dropdown (switch LLMs in UI)
- [ ] Dark/Light theme toggle
- [ ] Export conversation as PDF/text
- [ ] Admin dashboard / usage analytics
