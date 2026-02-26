// useChat.js — Manages messages, conversations, and loading state
import { useState, useEffect, useCallback } from "react";
import {
    sendMessage,
    streamMessage,
    getHistory,
    listConversations,
    deleteConversation,
} from "../api/chatApi";

const useChat = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Load conversation list on mount ──────────────────────────────────────
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const data = await listConversations();
            setConversations(data);
        } catch (err) {
            console.error("Failed to load conversations:", err);
        }
    };

    // ── Select a conversation and load its history ───────────────────────────
    const selectConversation = useCallback(async (conversationId) => {
        setActiveConversationId(conversationId);
        setMessages([]);
        setError(null);
        try {
            const data = await getHistory(conversationId);
            setMessages(data.messages || []);
        } catch (err) {
            setError("Failed to load conversation history.");
        }
    }, []);

    // ── Start a brand new chat ────────────────────────────────────────────────
    const startNewChat = useCallback(() => {
        setActiveConversationId(null);
        setMessages([]);
        setError(null);
    }, []);

    // ── Send a message and get AI reply ──────────────────────────────────────
    const sendUserMessage = useCallback(async (text, imageBase64 = null) => {
        if (!text.trim() && !imageBase64) return;
        if (isLoading) return;

        // Optimistically add user message to UI instantly
        const userMsg = { role: "user", content: text, images: imageBase64 ? [imageBase64] : undefined };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            // Add an empty assistant message that will be filled as tokens arrive
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            const resp = await streamMessage(activeConversationId, text, imageBase64);
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            if (!resp.body) {
                throw new Error("Missing response body");
            }

            const reader = resp.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let buffer = "";
            let eventName = "message";
            let eventDataLines = [];

            const flushEvent = () => {
                const data = eventDataLines.join("\n");
                if (eventName === "meta") {
                    try {
                        const meta = JSON.parse(data);
                        if (meta?.conversation_id) {
                            setActiveConversationId(meta.conversation_id);
                        }
                    } catch {
                        // ignore malformed meta
                    }
                } else if (eventName === "token") {
                    setMessages((prev) => {
                        if (prev.length === 0) return prev;
                        const next = [...prev];
                        const lastIdx = next.length - 1;
                        const last = next[lastIdx];
                        if (!last || last.role !== "assistant") return prev;
                        next[lastIdx] = { ...last, content: (last.content || "") + data };
                        return next;
                    });
                } else if (eventName === "done") {
                    // no-op here
                }

                eventName = "message";
                eventDataLines = [];
            };

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // SSE frames are separated by a blank line
                let idx;
                while ((idx = buffer.indexOf("\n\n")) !== -1) {
                    const frame = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 2);

                    const lines = frame.split(/\r?\n/);
                    for (const line of lines) {
                        if (line.startsWith("event:")) {
                            eventName = line.slice("event:".length).trim() || "message";
                        } else if (line.startsWith("data:")) {
                            let dataPart = line.slice("data:".length);
                            if (dataPart.startsWith(" ")) dataPart = dataPart.slice(1);
                            eventDataLines.push(dataPart);
                        }
                    }

                    flushEvent();
                }
            }

            // Refresh sidebar list to show new/updated conversation
            await fetchConversations();
        } catch (err) {
            setError("Failed to get a response. Please try again.");
            // Remove the optimistic user message + assistant placeholder on error
            setMessages((prev) => prev.slice(0, Math.max(0, prev.length - 2)));
        } finally {
            setIsLoading(false);
        }
    }, [activeConversationId, isLoading]);

    // ── Delete a conversation ─────────────────────────────────────────────────
    const removeConversation = useCallback(async (conversationId) => {
        try {
            await deleteConversation(conversationId);
            // If the deleted conversation was active, reset the view
            if (activeConversationId === conversationId) {
                startNewChat();
            }
            await fetchConversations();
        } catch (err) {
            setError("Failed to delete conversation.");
        }
    }, [activeConversationId, startNewChat]);

    return {
        conversations,
        activeConversationId,
        messages,
        isLoading,
        error,
        selectConversation,
        startNewChat,
        sendUserMessage,
        removeConversation,
    };
};

export default useChat;
