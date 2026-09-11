import axios from "axios";

const AI_BASE = import.meta.env.VITE_AI_BASE_API;

// ============================================
// ASK URBANPULSE AI
// ============================================

export const askChatbot = async (question) => {
  const response = await axios.post(`${AI_BASE}/ask`, {
    question,
  });

  return response.data;
};