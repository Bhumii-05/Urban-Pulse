import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  Loader2,
  Paperclip,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { askChatbot, analyzeComplaint } from "../api/chatbot.service";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("ask"); // "ask" | "complaint"
  const [step, setStep] = useState("initial"); // "initial" | "input" | "analyzing" | "preview" | "submitted"

  // Complaint Flow States
  const [complaintText, setComplaintText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);

  // Standard Q&A Chat States
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
  }, [messages, step, mode, analysisResult]);

  // Reset complaint flow back to standard chat
  const resetToAskMode = () => {
    setMode("ask");
    setStep("initial");
    setComplaintText("");
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setComplaintSubmitting(false);
  };

  // Standard Q&A handler
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
        { role: "assistant", content: data.answer, sources: data.sources },
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

  // Image Selection Handler
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Process complaint analysis
  const handleAnalyzeComplaint = async () => {
    if (!complaintText.trim()) return;
    setStep("analyzing");
    setLoading(true);

    try {
      const result = await analyzeComplaint(complaintText, selectedImage);
      setAnalysisResult(result);
      setStep("preview");
    } catch (err) {
      alert("Failed to analyze complaint. Please try again.");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#005B4F] px-4 py-3 text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="font-medium">UrbanPulse AI</span>
        </button>
      )}

      {/* Main Chat Interface */}
      {isOpen && (
        <div className="flex h-[520px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
          {/* Top Header with Mode Switcher */}
          <div className="flex items-center justify-between bg-[#005B4F] px-3 py-2.5 text-white">
            <div className="flex items-center gap-1 bg-[#00473e] p-1 rounded-xl">
              <button
                onClick={resetToAskMode}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  mode === "ask"
                    ? "bg-white text-[#005B4F] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Ask Question
              </button>
              <button
                onClick={() => {
                  setMode("complaint");
                  setStep("input");
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  mode === "complaint"
                    ? "bg-white text-[#005B4F] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Report Issue
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 hover:bg-[#00473e] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Action Options on Fresh Chat Start */}
          {mode === "ask" && messages.length === 1 && (
            <div className="p-3 bg-emerald-50/60 border-b border-emerald-100 flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                Select Option
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMode("ask");
                    setStep("input");
                  }}
                  className="rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  Ask Question
                </button>
                <button
                  onClick={() => {
                    setMode("complaint");
                    setStep("input");
                  }}
                  className="rounded-xl border border-emerald-600 bg-white px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Report Complaint
                </button>
              </div>
            </div>
          )}

          {/* Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Standard Q&A View */}
            {mode === "ask" && (
              <>
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
                      Searching municipal records...
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Guided Complaint Flow View */}
            {mode === "complaint" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-semibold text-emerald-900">
                    Complaint Assistant Mode
                  </span>
                  <button
                    onClick={resetToAskMode}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Ask
                  </button>
                </div>

                {/* Input Step */}
                {(step === "input" || step === "initial") && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Describe your municipal issue and optionally attach a photo.
                    </p>

                    <textarea
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="E.g., Illegal dumping behind the public park on Elm Street..."
                      className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#005B4F] focus:ring-1 focus:ring-[#005B4F] outline-none resize-none"
                      rows={4}
                    />

                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer hover:text-[#005B4F]">
                        <Paperclip className="h-4 w-4" />
                        <span>
                          {selectedImage ? "Change Photo" : "Attach Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>

                      <button
                        disabled={!complaintText.trim()}
                        onClick={handleAnalyzeComplaint}
                        className="rounded-xl bg-[#005B4F] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-colors hover:bg-[#00473e]"
                      >
                        Analyze Issue
                      </button>
                    </div>
                  </div>
                )}

                {/* Processing Loader Step */}
                {step === "analyzing" && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#005B4F]" />
                    <p className="text-xs text-gray-500 font-medium">
                      Extracting severity and municipal route...
                    </p>
                  </div>
                )}

                {/* Confirmation Preview Step */}
                {step === "preview" && analysisResult && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-gray-700">
                        Complaint Analysis
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                        {Math.round(
                          analysisResult.confidence > 1
                            ? analysisResult.confidence
                            : analysisResult.confidence * 100
                        )}
                        % Match
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800">
                          Category:
                        </span>{" "}
                        {analysisResult.category}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          Severity:
                        </span>{" "}
                        {analysisResult.severity}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          Recommended Action:
                        </span>{" "}
                        {analysisResult.recommended_action}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          Summary:
                        </span>{" "}
                        {analysisResult.description}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={() => setStep("input")}
                        className="flex-1 rounded-lg border border-gray-300 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => setStep("submitted")}
                        className="flex-1 rounded-lg bg-[#005B4F] py-1.5 text-xs font-medium text-white hover:bg-[#00473e]"
                      >
                        Confirm & Submit
                      </button>
                    </div>
                  </div>
                )}

                {/* Submission Completed Step */}
                {step === "submitted" && (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    <p className="text-sm font-semibold text-gray-800">
                      Complaint Ticket Created
                    </p>
                    <p className="text-xs text-gray-500">
                      Reference ID: #{analysisResult?.id || "REG-3042"}
                    </p>
                    <button
                      onClick={resetToAskMode}
                      className="mt-3 rounded-lg border border-[#005B4F] px-4 py-1.5 text-xs font-semibold text-[#005B4F] hover:bg-emerald-50"
                    >
                      Return to Chat Mode
                    </button>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Standard Chat Footer Input (Only active in "ask" mode) */}
          {mode === "ask" && (
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
                className="rounded-xl bg-[#005B4F] p-2 text-white disabled:opacity-50 transition-colors hover:bg-[#00473e]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}