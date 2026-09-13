/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Himanshu Bisht
 * Date of Last Modification: 13 September 2026
 * Brief Description:Handles API requests for chatbot communication.
 */
import axios from "axios";

const AI_BASE = import.meta.env.VITE_AI_BASE_API;

export const askChatbot = async (question) => {
  const response = await axios.post(`${AI_BASE}/ask`, {
    question,
  });

  return response.data;
};