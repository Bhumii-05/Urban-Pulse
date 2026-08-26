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
import {
  askChatbot,
  analyzeComplaint,
  submitComplaint,
  getComplaint,
  getComplaints,
} from "../api/chatbot.service";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("ask");
  const [step, setStep] = useState("initial");

  // Complaint States
  const [complaintText, setComplaintText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintError, setComplaintError] = useState("");

  // Track Complaint States
  const [tracking, setTracking] = useState(false);
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackingError, setTrackingError] = useState("");

  // History of Complaint
  const [myComplaints, setMyComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState("");

  // Complaint Details + Status Timeline.
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Q&A Chat States
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
  }, [messages, step, mode, analysisResult, trackedComplaint]);

  const resetToAskMode = () => {
    setMode("ask");
    setStep("initial");
    setComplaintText("");
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setComplaintSubmitting(false);
    setComplaintError("");
    setTrackedComplaint(null);
    setTrackingError("");
    setSelectedComplaint(null);
  };

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

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Step 1: Run AI Analysis
  const handleAnalyzeComplaint = async () => {
    if (!complaintText.trim()) return;
    setStep("analyzing");
    setLoading(true);

    try {
      const result = await analyzeComplaint(complaintText, selectedImage);
      setAnalysisResult(result);
      setStep("preview");
    } catch (err) {
      console.error(err);
      alert("Failed to analyze complaint. Please check server connection.");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm & Submit Complaint
  const handleConfirmComplaint = async () => {
    if (!analysisResult || complaintSubmitting) return;

    setComplaintSubmitting(true);
    setComplaintError("");

    try {
      const result = await submitComplaint({
        description: complaintText,
        imageFile: selectedImage,
        analysis: analysisResult,
      });

      setAnalysisResult(result);
      setStep("submitted");
    } catch (error) {
      console.error("Complaint submission failed:", error);
      
      const backendMessage =
        error.response?.data?.detail ||
        "Your complaint could not be submitted. Please try again.";
        
      setComplaintError(
        typeof backendMessage === "object" 
          ? JSON.stringify(backendMessage) 
          : backendMessage
      );
    } finally {
      setComplaintSubmitting(false);
    }
  };

  // Step 3: Track Complaint Status
  const handleTrackComplaint = async () => {
    const complaintId = analysisResult?.id;

    if (!complaintId || tracking) {
      return;
    }

    setTracking(true);
    setTrackingError("");

    try {
      const result = await getComplaint(complaintId);
      setTrackedComplaint(result);
    } catch (error) {
      console.error("Complaint tracking failed:", error);
      setTrackingError("Unable to retrieve your complaint right now.");
    } finally {
      setTracking(false);
    }
  };

  const handleLoadComplaints = async () => {
    if (complaintsLoading) {
      return;
    }

    setComplaintsLoading(true);
    setComplaintsError("");

    try {
      const result = await getComplaints();
      setMyComplaints(Array.isArray(result) ? result : result?.complaints || []);
      setStep("my-complaints");
    } catch (error) {
      console.error("Failed to load complaints:", error);
      setComplaintsError("Unable to load your complaints right now.");
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleViewComplaint = async (complaintId) => {
    if (!complaintId || detailsLoading) {
      return;
    }

    setDetailsLoading(true);
    setDetailsError("");

    try {
      const result = await getComplaint(complaintId);
      setSelectedComplaint(result);
      setStep("complaint-details");
    } catch (error) {
      console.error("Failed to load complaint:", error);
      setDetailsError("Unable to load complaint details.");
    } finally {
      setDetailsLoading(false);
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
          {/* Header Mode Switcher */}
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
                  setComplaintError("");
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
              className="rounded-lg p-1 hover:bg-[#00473e]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Ask View */}
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
                      Processing request...
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Complaint View */}
            {mode === "complaint" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-semibold text-emerald-900">
                    Complaint Assistant
                  </span>
                  <button
                    onClick={resetToAskMode}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Ask
                  </button>
                </div>

                {(step === "input" || step === "initial") && (
                  <div className="space-y-3">
                    <textarea
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="Describe the issue..."
                      className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#005B4F] outline-none resize-none"
                      rows={4}
                    />

                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
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
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
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
                        className="rounded-xl bg-[#005B4F] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Analyze Issue
                      </button>
                    </div>

                    {/* My Complaints Navigation Button */}
                    <button
                      onClick={handleLoadComplaints}
                      disabled={complaintsLoading}
                      className="w-full rounded-xl border border-[#005B4F] px-4 py-2.5 text-sm font-medium text-[#005B4F] transition hover:bg-[#005B4F] hover:text-white flex items-center justify-center gap-2 mt-2"
                    >
                      {complaintsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "My Complaints"
                      )}
                    </button>
                  </div>
                )}

                {step === "analyzing" && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#005B4F]" />
                    <p className="text-xs text-gray-500 font-medium">
                      Analyzing complaint...
                    </p>
                  </div>
                )}

                {step === "preview" && analysisResult && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-gray-700">
                        Complaint Analysis
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                        {Math.round(
                          (analysisResult?.confidence ?? 0.9) > 1
                            ? analysisResult.confidence
                            : (analysisResult?.confidence ?? 0.9) * 100
                        )}
                        % Match
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-800">Category:</span>{" "}
                        {analysisResult?.category || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">Severity:</span>{" "}
                        {analysisResult?.severity || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">Action:</span>{" "}
                        {analysisResult?.recommended_action || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">Summary:</span>{" "}
                        {analysisResult?.description || "N/A"}
                      </div>
                    </div>

                    {complaintError && (
                      <div className="rounded-md bg-red-50 p-2 text-xs text-red-600 border border-red-200">
                        {complaintError}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={() => {
                          setStep("input");
                          setComplaintError("");
                        }}
                        className="flex-1 rounded-lg border border-gray-300 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        Edit Details
                      </button>
                      <button
                        disabled={complaintSubmitting}
                        onClick={handleConfirmComplaint}
                        className="flex-1 rounded-lg bg-[#005B4F] py-1.5 text-xs font-medium text-white flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {complaintSubmitting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Confirm & Submit"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {step === "submitted" && (
                  <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Complaint Registered
                      </p>
                      <p className="text-xs text-gray-500">
                        Ticket #{analysisResult?.id || "N/A"}
                      </p>
                    </div>

                    <button
                      onClick={handleTrackComplaint}
                      disabled={tracking}
                      className="w-full rounded-xl bg-[#005B4F] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#00483F] disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {tracking ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Checking Status...
                        </>
                      ) : (
                        "Track Complaint"
                      )}
                    </button>

                    {trackingError && (
                      <p className="text-xs text-red-600">{trackingError}</p>
                    )}

                    {trackedComplaint && (
                      <div className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-1.5 text-xs">
                        <h3 className="font-semibold text-[#004D40] border-b pb-1 mb-1">
                          Complaint Status Details
                        </h3>
                        <p>
                          <span className="font-medium text-gray-700">ID:</span>{" "}
                          {trackedComplaint.id}
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Category:</span>{" "}
                          {trackedComplaint.category}
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Severity:</span>{" "}
                          {trackedComplaint.severity}
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Status:</span>{" "}
                          <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                            {trackedComplaint.status || "Registered"}
                          </span>
                        </p>
                      </div>
                    )}

                    <button
                      onClick={resetToAskMode}
                      className="mt-2 rounded-lg border border-[#005B4F] px-4 py-1.5 text-xs font-semibold text-[#005B4F] hover:bg-emerald-50"
                    >
                      Return to Chat Mode
                    </button>
                  </div>
                )}

                {/* My Complaints List Step */}
                {step === "my-complaints" && (
                  <div className="flex flex-xl flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#004D40]">
                          My Complaints
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          View your submitted complaints and their status.
                        </p>
                      </div>
                      <button
                        onClick={() => setStep("input")}
                        className="text-xs text-[#005B4F] underline hover:font-medium"
                      >
                        Back
                      </button>
                    </div>

                    {complaintsError && (
                      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        {complaintsError}
                      </div>
                    )}

                    {complaintsLoading && (
                      <div className="py-8 text-center text-sm text-gray-500">
                        Loading complaints...
                      </div>
                    )}

                    {!complaintsLoading &&
                      !complaintsError &&
                      myComplaints.length === 0 && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                          <p className="text-sm text-gray-600">
                            You haven't submitted any complaints yet.
                          </p>
                        </div>
                      )}

                    {!complaintsLoading &&
                      myComplaints.map((complaint) => (
                        <button
                          key={complaint.id}
                          type="button"
                          onClick={() => handleViewComplaint(complaint.id)}
                          className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#005B4F] hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-gray-400">
                                #{complaint.id}
                              </p>
                              <h4 className="mt-1 text-sm font-semibold text-gray-800">
                                {complaint.category}
                              </h4>
                            </div>

                            <span className="rounded-full bg-[#8FD14F]/20 px-2.5 py-1 text-xs font-medium text-[#005B4F]">
                              {complaint.status}
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-xs text-gray-500">
                            {complaint.description}
                          </p>

                          <div className="mt-3 text-xs text-gray-400">
                            Severity:{" "}
                            <span className="font-medium text-gray-700">
                              {complaint.severity}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                )}

                {/* Complaint Details View */}
                {step === "complaint-details" && selectedComplaint && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedComplaint(null);
                          setStep("my-complaints");
                        }}
                        className="mb-3 text-xs font-medium text-[#005B4F] hover:underline"
                      >
                        ← Back to My Complaints
                      </button>

                      <h3 className="text-lg font-semibold text-[#004D40]">
                        Complaint Details
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        #{selectedComplaint.id}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#005B4F] p-4 text-white">
                      <p className="text-xs text-white/70">Current Status</p>
                      <p className="mt-1 text-lg font-semibold">
                        {selectedComplaint.status}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <h4 className="mb-4 text-sm font-semibold text-[#004D40]">
                        Complaint Progress
                      </h4>
                      <StatusTimeline currentStatus={selectedComplaint.status} />
                    </div>

                    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
                      <DetailRow
                        label="Category"
                        value={selectedComplaint.category}
                      />
                      <DetailRow
                        label="Severity"
                        value={selectedComplaint.severity}
                      />
                      <DetailRow
                        label="Description"
                        value={selectedComplaint.description}
                      />
                      <DetailRow
                        label="Recommended Action"
                        value={selectedComplaint.recommended_action}
                      />
                      <DetailRow
                        label="Confidence"
                        value={
                          selectedComplaint.confidence != null
                            ? `${(selectedComplaint.confidence * 100).toFixed(0)}%`
                            : "N/A"
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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
                className="rounded-xl bg-[#005B4F] p-2 text-white disabled:opacity-50"
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

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-gray-700">
        {value || "N/A"}
      </p>
    </div>
  );
}

const STATUS_STEPS = ["SUBMITTED", "UNDER_REVIEW", "RESOLVED"];

function StatusTimeline({ currentStatus }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((status, index) => {
        const completed = index <= currentIndex;

        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  completed ? "bg-[#005B4F]" : "bg-gray-300"
                }`}
              />
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`h-8 w-0.5 ${
                    index < currentIndex ? "bg-[#005B4F]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            <div className="pb-5">
              <p
                className={`text-sm ${
                  completed ? "font-semibold text-gray-800" : "text-gray-400"
                }`}
              >
                {status.replace("_", " ")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}