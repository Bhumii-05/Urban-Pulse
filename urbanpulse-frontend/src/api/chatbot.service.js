import axios from "axios";

const AI_BASE = "https://urban-pulse-ct8w.onrender.com/api/v1/ai";

// ============================================
// ASK URBANPULSE AI
// ============================================

export const askChatbot = async (question) => {
  const response = await axios.post(`${AI_BASE}/ask`, {
    question,
  });

  return response.data;
};