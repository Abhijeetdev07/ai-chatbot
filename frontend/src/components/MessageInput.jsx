// MessageInput.jsx — Input box + Send button + Voice input (Web Speech API)
import { useState, useRef, useEffect } from "react";
import { IoSendSharp } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiMic, FiMicOff, FiImage, FiX } from "react-icons/fi";

// Check browser support
const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const MessageInput = ({ onSend, isLoading }) => {
    const [text, setText] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [noSupport, setNoSupport] = useState(false);
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    // Setup SpeechRecognition on mount
    useEffect(() => {
        if (!SpeechRecognition) {
            setNoSupport(true);
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;       // stop after one sentence
        recognition.interimResults = true;    // show partial results while speaking
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((r) => r[0].transcript)
                .join("");
            setText(transcript);
            // Auto-resize textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height =
                    Math.min(textareaRef.current.scrollHeight, 140) + "px";
            }
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognitionRef.current = recognition;
    }, []);

    const handleSend = () => {
        if ((!text.trim() && !selectedImage) || isLoading) return;

        if (selectedImage) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Parts = reader.result.split(",");
                const base64Data = base64Parts[base64Parts.length - 1]; // get the base64 part
                onSend(text.trim(), base64Data);
                clearImage();
            };
            reader.readAsDataURL(selectedImage);
        } else {
            onSend(text.trim(), null);
        }

        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
        // Reset file input value so selecting the same file again works
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleInput = (e) => {
        setText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setText("");
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    return (
        <div className="px-4 pb-5 pt-3 border-t border-zinc-700 bg-zinc-900">
            {/* Image Preview Area */}
            {previewUrl && (
                <div className="mb-3 relative inline-block">
                    <img
                        src={previewUrl}
                        alt="Selected"
                        className="h-20 w-auto rounded-lg object-cover border border-zinc-700"
                    />
                    <button
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 border border-zinc-600 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                        <FiX className="text-xs" />
                    </button>
                </div>
            )}

            <div
                className={`flex items-end gap-3 bg-zinc-800 border rounded-2xl px-4 py-3 transition-colors duration-200 ${isListening
                    ? "border-red-500/70 shadow-sm shadow-red-500/20"
                    : "border-zinc-600 focus-within:border-indigo-500"
                    }`}
            >
                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                />

                {/* Image upload button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    title="Upload image"
                    className="w-9 h-9 shrink-0 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-300 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <FiImage className="text-base" />
                </button>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isListening
                            ? "Listening… speak now"
                            : "Message AI... (Enter to send, Shift+Enter for newline)"
                    }
                    rows={1}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm resize-none outline-none max-h-36 leading-relaxed disabled:opacity-50"
                />

                {/* Mic Button */}
                {!noSupport && (
                    <button
                        onClick={toggleListening}
                        disabled={isLoading}
                        title={isListening ? "Stop listening" : "Voice input"}
                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${isListening
                            ? "bg-red-500 hover:bg-red-400 animate-pulse"
                            : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                            }`}
                    >
                        {isListening
                            ? <FiMicOff className="text-white text-base" />
                            : <FiMic className="text-base" />
                        }
                    </button>
                )}

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={(!text.trim() && !selectedImage) || isLoading}
                    className="w-9 h-9 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Send message"
                >
                    {isLoading
                        ? <AiOutlineLoading3Quarters className="text-white text-base animate-spin" />
                        : <IoSendSharp className="text-white text-base" />
                    }
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
