// ChatWindow.jsx — Scrollable message feed with typing indicator
import { useEffect, useRef } from "react";
import { RiRobot2Line } from "react-icons/ri";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ messages, isLoading }) => {
    const bottomRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
            {/* Empty state */}
            {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                    <RiRobot2Line className="text-6xl text-zinc-400" />
                    <p className="text-zinc-400 text-lg font-medium">How can I help you today?</p>
                    <p className="text-zinc-600 text-sm">Type a message below to start chatting</p>
                </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role} content={msg.content} images={msg.images} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
                <div className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        <RiRobot2Line className="text-zinc-300 text-sm" />
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-sm px-5 py-3 flex gap-1.5 items-center">
                        <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
        </div>
    );
};

export default ChatWindow;
