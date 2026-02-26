// MessageBubble.jsx — User vs AI message styling
import { FiUser } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

const MessageBubble = ({ role, content, images }) => {
    const isUser = role === "user";

    return (
        <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-indigo-600" : "bg-zinc-700"}`}
            >
                {isUser
                    ? <FiUser className="text-white text-sm" />
                    : <RiRobot2Line className="text-zinc-300 text-sm" />
                }
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${isUser
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-sm"
                    }`}
            >
                {/* Render any attached images */}
                {images && images.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                        {images.map((base64, idx) => (
                            <img
                                key={idx}
                                src={`data:image/jpeg;base64,${base64}`}
                                alt="Shared image"
                                className="max-w-full rounded-lg max-h-60 object-contain shadow-sm border border-zinc-700/50"
                            />
                        ))}
                    </div>
                )}
                {/* Text content */}
                {content}
            </div>
        </div>
    );
};

export default MessageBubble;
