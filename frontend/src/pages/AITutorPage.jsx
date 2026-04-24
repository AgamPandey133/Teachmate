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
        <div className="h-[calc(100vh-4rem)] pt-6 pb-6 px-4 max-w-4xl mx-auto flex flex-col">
            <div className="bg-base-100/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-content/10 flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-base-content/10 bg-base-200/50 flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl ring-4 ring-primary/10">
                        <Bot className="size-7 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">TeachMate AI Tutor</h2>
                        <p className="text-sm text-base-content/70 font-medium">Powered by Gemini RAG</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-base-100/50">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"} group`}>
                             <div className="chat-image avatar">
                                <div className={`size-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${msg.sender === "ai" ? "border-primary/30 bg-primary/10 group-hover:border-primary" : "border-base-300 bg-base-200"}`}>
                                   {msg.sender === "ai" ? <Bot size={20} className="text-primary" /> : <User size={20} />}
                                </div>
                            </div>
                            <div className="chat-header mb-1 opacity-50 text-xs font-medium pl-1">
                                {msg.sender === "ai" ? "AI Tutor" : "You"}
                                <time className="ml-2 opacity-70">{formatMessageTime(msg.createdAt)}</time>
                            </div>
                            <div className={`chat-bubble shadow-sm ${msg.sender === "ai" ? "bg-gradient-to-br from-primary to-secondary text-primary-content" : "bg-base-200 text-base-content"}`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat chat-start">
                             <div className="chat-image avatar">
                                <div className="size-10 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center">
                                   <Bot size={20} className="text-primary" />
                                </div>
                            </div>
                            <div className="chat-bubble bg-base-200">
                                <Loader2 className="animate-spin size-5 text-primary" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-base-content/10 bg-base-200/50">
                    <div className="flex gap-3 bg-base-100 p-2 rounded-full border border-base-content/10 shadow-inner focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                        <input
                            type="text"
                            className="input bg-transparent border-none flex-1 focus:outline-none w-full px-4"
                            placeholder="Ask me to explain a concept or translate a phrase..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="btn btn-primary btn-circle shadow-lg hover:shadow-primary/50 transition-all" disabled={isLoading || !input.trim()}>
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AITutorPage;
