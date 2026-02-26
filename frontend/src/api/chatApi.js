import axios from "axios";

// Base URL — Vite will proxy /api → http://localhost:8000 (configured in vite.config.js)
const BASE_URL = "/api";

// ─── Send a message and get an AI reply ──────────────────────────────────────
/**
 * @param {string|null} conversationId  - null to start a new conversation
 * @param {string}      message         - user's text input
 * @param {string|null} imageBase64     - optional base64 image data
 * @returns {Promise<{ conversation_id: string, reply: string }>}
 */
export const sendMessage = async (conversationId, message, imageBase64 = null) => {
    const response = await axios.post(`${BASE_URL}/chat`, {
        conversation_id: conversationId || null,
        message,
        images: imageBase64 ? [imageBase64] : undefined,
        stream: false, // non-streaming for now; streaming handled separately
    });
    return response.data;
};

// ─── Streaming: open an SSE stream for chat ─────────────────────────────────
/**
 * Opens a streaming response from the backend.
 * @param {string|null} conversationId
 * @param {string} message
 * @param {string|null} imageBase64
 * @returns {Promise<Response>} fetch Response whose body is a ReadableStream
 */
export const streamMessage = async (conversationId, message, imageBase64 = null) => {
    const token = localStorage.getItem("token");
    return fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            conversation_id: conversationId || null,
            message,
            images: imageBase64 ? [imageBase64] : undefined,
            stream: true,
        }),
    });
};

// ─── Get full conversation history ───────────────────────────────────────────
/**
 * @param {string} conversationId
 * @returns {Promise<{ _id: string, title: string, messages: Array }>}
 */
export const getHistory = async (conversationId) => {
    const response = await axios.get(`${BASE_URL}/history/${conversationId}`);
    return response.data;
};

// ─── List all conversations (sidebar) ────────────────────────────────────────
/**
 * @returns {Promise<Array<{ _id: string, title: string, updated_at: string }>>}
 */
export const listConversations = async () => {
    const response = await axios.get(`${BASE_URL}/conversations`);
    return response.data;
};

// ─── Delete a conversation ────────────────────────────────────────────────────
/**
 * @param {string} conversationId
 * @returns {Promise<{ status: string, message: string }>}
 */
export const deleteConversation = async (conversationId) => {
    const response = await axios.delete(`${BASE_URL}/conversations/${conversationId}`);
    return response.data;
};
