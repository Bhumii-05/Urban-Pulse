import axios from "axios";

const API_BASE = "https://urban-pulse-r5jl.onrender.com/api/v1";
const AI_BASE = `${API_BASE}/ai`;

/*
 * ============================================
 * ASK URBANPULSE AI
 * ============================================
 */
export const askChatbot = async (question) => {
  const response = await axios.post(`${AI_BASE}/ask`, {
    question,
  });

  return response.data;
};
