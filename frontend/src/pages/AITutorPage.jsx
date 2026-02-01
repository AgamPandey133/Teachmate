import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { sendAIMessage } from "../lib/api";
import { formatMessageTime } from "../lib/utils";

const AITutorPage = () => {
    const [messages, setMessages] = useState([
        {
            _id: "1",
            text: "Hello! I am TeachMate AI. Ask me anything about languages, coding, or math!",
            sender: "ai",
            createdAt: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = {
            _id: Date.now().toString(),
            text: input,
            sender: "user",
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const data = await sendAIMessage(input);
            const aiMsg = {
                _id: (Date.now() + 1).toString(),
                text: data.text,
                sender: "ai",
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg = {
                _id: (Date.now() + 1).toString(),
                text: error.response?.data?.message || "Sorry, I encountered an error. Please try again.",
                sender: "ai",
                createdAt: new Date().toISOString()
            };
             setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen pt-20 px-4 max-w-4xl mx-auto flex flex-col">
            <div className="bg-base-100 rounded-xl shadow-lg border border-base-300 flex-1 flex flex-col overflow-hidden mb-4">
                {/* Header */}
                <div className="p-4 border-b border-base-300 bg-base-200 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Bot className="size-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">TeachMate AI Tutor</h2>
                        <p className="text-xs text-base-content/70">Powered by Gemini Pro</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}>
                             <div className="chat-image avatar">
                                <div className="size-10 rounded-full border flex items-center justify-center bg-base-300">
                                   {msg.sender === "ai" ? <Bot size={20} /> : <User size={20} />}
                                </div>
                            </div>
                            <div className="chat-header mb-1 opacity-50 text-xs">
                                {msg.sender === "ai" ? "AI Tutor" : "You"}
                                <time className="ml-2">{formatMessageTime(msg.createdAt)}</time>
                            </div>
                            <div className={`chat-bubble ${msg.sender === "ai" ? "chat-bubble-primary" : ""}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat chat-start">
                             <div className="chat-image avatar">
                                <div className="size-10 rounded-full border flex items-center justify-center bg-base-300">
                                   <Bot size={20} />
                                </div>
                            </div>
                            <div className="chat-bubble chat-bubble-primary">
                                <Loader2 className="animate-spin size-5" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input input-bordered flex-1"
                            placeholder="Ask me to explain a concept..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="btn btn-primary btn-circle" disabled={isLoading || !input.trim()}>
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AITutorPage;
