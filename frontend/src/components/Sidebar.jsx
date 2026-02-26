// Sidebar.jsx — Conversation list + New Chat button + Profile menu
import { useState, useRef, useEffect } from "react";
import { FiTrash2, FiPlus, FiMessageSquare, FiLogOut, FiUser } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ conversations, activeId, onSelect, onNewChat, onDelete }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Get initials for avatar
    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    return (
        <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-700 flex flex-col shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-zinc-700">
                <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                    <RiRobot2Line className="text-indigo-400 text-2xl" /> AI Chatbot
                </h1>
            </div>

            {/* New Chat Button */}
            <div className="p-3 pb-2">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                    <FiPlus className="text-lg" /> New Chat
                </button>
            </div>

            <div className="px-4 pt-3 pb-2">
                <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Recent Chats</p>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                {conversations.length === 0 && (
                    <p className="text-zinc-500 text-xs text-center mt-8 px-4">
                        No conversations yet. Start a new chat!
                    </p>
                )}
                {conversations.map((conv) => (
                    <div
                        key={conv._id}
                        onClick={() => onSelect(conv._id)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${activeId === conv._id
                            ? "bg-indigo-600/30 border border-indigo-500/40 text-white"
                            : "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                            }`}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FiMessageSquare className="text-zinc-500 shrink-0 text-sm" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{conv.title || "New Chat"}</p>
                                <p className="text-xs text-zinc-500 truncate mt-0.5">
                                    {new Date(conv.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(conv._id); }}
                            className="opacity-0 group-hover:opacity-100 ml-2 text-zinc-500 hover:text-red-400 transition-all p-1 rounded"
                            title="Delete"
                        >
                            <FiTrash2 className="text-sm" />
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Profile Section (bottom) ──────────────────────────────── */}
            <div className="p-3 border-t border-zinc-800 relative" ref={profileRef}>

                {/* Profile Popover — appears above the button */}
                {profileOpen && (
                    <div className="absolute bottom-full left-3 right-3 mb-2 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                                <p className="text-zinc-400 text-xs truncate">{user?.email}</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors text-sm font-medium"
                        >
                            <FiLogOut /> Sign Out
                        </button>
                    </div>
                )}

                {/* Profile Trigger Button */}
                <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${profileOpen
                        ? "bg-zinc-800 text-white"
                        : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate text-white">{user?.name || "Profile"}</p>
                    </div>
                    {/* Chevron */}
                    <FiUser className="text-zinc-500 text-sm shrink-0" />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
