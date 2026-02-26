// Home.jsx — Assembles Sidebar + ChatWindow + MessageInput
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FiAlertTriangle } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import useChat from "../hooks/useChat";

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {
        conversations,
        activeConversationId,
        messages,
        isLoading,
        error,
        selectConversation,
        startNewChat,
        sendUserMessage,
        removeConversation,
    } = useChat();

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">

            {/* ── Mobile Overlay backdrop ──────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* ── Sidebar ─────────────────────────────────────── */}
            {/* Desktop: always visible. Mobile: slide-in overlay */}
            <div
                className={`
                    fixed md:relative z-30 md:z-auto h-full
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <Sidebar
                    conversations={conversations}
                    activeId={activeConversationId}
                    onSelect={(id) => { selectConversation(id); closeSidebar(); }}
                    onNewChat={() => { startNewChat(); closeSidebar(); }}
                    onDelete={removeConversation}
                />
            </div>

            {/* ── Main Chat Area ───────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0">

                {/* Top Bar */}
                <div className="px-4 md:px-6 py-4 border-b border-zinc-800 flex items-center gap-3 shrink-0">

                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setSidebarOpen((o) => !o)}
                        className="md:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen
                            ? <FiX className="w-5 h-5" />
                            : <FiMenu className="w-5 h-5" />}
                    </button>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-semibold text-base truncate">
                            {activeConversationId
                                ? conversations.find((c) => c._id === activeConversationId)?.title || "Chat"
                                : "New Chat"}
                        </h2>

                    </div>

                    {/* Online dot */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="hidden sm:inline">Online</span>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-4 mt-3 px-4 py-2.5 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
                        <FiAlertTriangle className="shrink-0" /> {error}
                    </div>
                )}

                {/* Chat Messages */}
                <ChatWindow messages={messages} isLoading={isLoading} />

                {/* Message Input */}
                <MessageInput onSend={sendUserMessage} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default Home;
