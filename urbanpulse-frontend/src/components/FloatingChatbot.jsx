import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { askChatbot } from "../api/chatbot.service";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! How can I help you with municipal services today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || loading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const data = await askChatbot(userMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.answer || "No response received." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#005B4F] px-4 py-3 text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="font-medium">UrbanPulse AI</span>
        </button>
      )}

      {isOpen && (
        <div className="flex h-[520px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between bg-[#005B4F] px-4 py-3 text-white">
            <span className="font-semibold text-sm">UrbanPulse Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 hover:bg-[#00473e]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-[#005B4F] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-xs text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-[#005B4F]" />
                  Processing request...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-3 bg-white flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Ask a question..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#005B4F]"
            />
            <button
              onClick={handleSendChat}
              disabled={loading || !chatInput.trim()}
              className="rounded-xl bg-[#005B4F] p-2 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}