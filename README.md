# Multilingual AI Chatbot — Project Documentation

## 1. Project Overview

**Project Name:** Multilingual AI Chatbot  
**Type:** Full-Stack Web Application  
**Description:** A locally-hosted, intelligent chatbot powered by Ollama LLMs. Users can register, log in, and have natural-language conversations with an AI assistant. The application stores all conversations in a MongoDB database and supports voice input via the browser's Web Speech API. The chatbot can be extended to support multiple languages.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **LLM (AI)** | [Ollama](https://ollama.com) — runs models locally (e.g. `tinyllama`, `llama3.2`) |
| **Backend** | Python 3.11 + [FastAPI](https://fastapi.tiangolo.com) |
| **Database** | [MongoDB](https://www.mongodb.com) via Motor (async driver) |
| **Frontend** | React 18 + [Vite](https://vitejs.dev) |
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
        │   └── chatApi.js          # sendMessage(), getHistory(), listConversations()
        ├── components/
        │   ├── ChatWindow.jsx      # Scrollable message feed + typing indicator
        │   ├── MessageBubble.jsx   # User vs AI message bubbles
        │   ├── MessageInput.jsx    # Textarea + Send + 🎤 Voice input
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
MODEL_NAME=tinyllama
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
| POST | `/api/chat` | Send message, get AI reply |

**Request:**
```json
{ "conversation_id": null, "message": "Hello!", "stream": false }
```
**Response:**
```json
{ "conversation_id": "6789abc...", "reply": "Hi! How can I help?" }
```

---

### History

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | List all conversations |
| GET | `/api/history/{id}` | Get full message history |
| DELETE | `/api/conversations/{id}` | Delete a conversation |

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
  "title": "First 30 chars of first message...",
  "messages": [
    { "role": "user",      "content": "Hello!",         "timestamp": "..." },
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
| Profile menu with logout | ✅ |
| AI chat (Ollama local LLM) | ✅ |
| Voice input (Web Speech API) | ✅ |
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
ollama pull tinyllama   # first time only
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

## 9. Multilingual Support

The chatbot can respond in the user's language by modifying the **system prompt** in `services/ollama_service.py`.

**Example — auto-detect and respond in user's language:**
```python
SYSTEM_PROMPT = """You are a helpful multilingual AI assistant.
Detect the language of the user's message and always respond in the same language."""
```

**Available Ollama models with strong multilingual support:**
| Model | Languages | RAM Required |
|---|---|---|
| `tinyllama` | English (basic others) | ~637 MB |
| `llama3.2` | 8+ languages | ~2 GB |
| `mistral` | 10+ languages | ~4 GB |
| `aya` | 23 languages | ~4 GB |

---

## 10. Known Issues & Fixes

| Issue | Fix |
|---|---|
| `bcrypt` 5.x incompatible with `passlib` | Downgraded to `bcrypt==4.0.1` |
| `phi3:mini` causes OOM (Out of Memory) | Switch to `tinyllama` in `.env` |
| Voice input not working in Firefox | Use Chrome or Edge (Web Speech API) |
| CORS errors in development | Vite proxy configured: `/api` → `localhost:8000` |

---

## 11. Future Enhancements

- [ ] Streaming AI responses (SSE/word-by-word)
- [ ] Image upload + vision model (e.g. `llava`)
- [ ] Markdown rendering for code blocks
- [ ] Model selector dropdown (switch LLMs in UI)
- [ ] Dark/Light theme toggle
- [ ] Export conversation as PDF/text
- [ ] Per-user conversation isolation (link conversations to user ID)
