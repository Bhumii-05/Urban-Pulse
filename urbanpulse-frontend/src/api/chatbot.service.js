import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1";
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

/*
 * ============================================
 * ANALYZE COMPLAINT
 *
 * AI analysis only.
 * Does NOT create a complaint.
 * ============================================
 */
export const analyzeComplaint = async (description, imageFile = null) => {
  const formData = new FormData();

  formData.append("complaint", description);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await axios.post(
    `${AI_BASE}/complaint/analyze`,
    formData
  );

  return response.data;
};

/*
 * ============================================
 * SUBMIT CONFIRMED COMPLAINT
 *
 * Creates the actual municipal complaint.
 * ============================================
 */
export const submitComplaint = async ({
  description,
  imageFile = null,
  analysis = {},
}) => {
  const formData = new FormData();

  // Primary text description required by FastAPI backend
  formData.append("complaint", description);

  // Fallback defaults for metadata
  formData.append("category", analysis?.category || "General");
  
  // Normalize severity values (e.g., convert "Medium" to "Moderate" if needed)
  let severityVal = analysis?.severity || "Moderate";
  if (severityVal.toLowerCase() === "medium") {
    severityVal = "Moderate";
  }
  formData.append("severity", severityVal);

  formData.append("description", analysis?.description || description);
  formData.append(
    "recommended_action",
    analysis?.recommended_action || "Review issue"
  );

  // Clean confidence string if it includes '%' signs (e.g., "90%" -> 90)
  let rawConf = String(analysis?.confidence || "0.9").replace("%", "").trim();
  let confVal = parseFloat(rawConf);

  if (isNaN(confVal)) {
    confVal = 0.9;
  } else if (confVal > 1.0) {
    confVal = confVal / 100.0; // Scale 90 to 0.90 for FastAPI validation
  }

  formData.append("confidence", String(confVal));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const response = await axios.post(`${API_BASE}/complaints`, formData);
    return response.data;
  } catch (error) {
    // Re-throw with exact backend detail string/object for React UI error rendering
    const message = error.response?.data?.detail || error.message;
    throw new Error(
      typeof message === "object" ? JSON.stringify(message) : message
    );
  }
};

export const getComplaint = async (
  complaintId
) => {
  if (!complaintId) {
    throw new Error(
      "Complaint ID is required."
    );
  }

  const response = await axios.get(
    `${API_BASE}/complaints/${complaintId}`
  );

  return response.data;
};

export const getComplaints = async () => {
  const response = await axios.get(`${API_BASE}/complaints`);
  const data = response.data;

  // Ensure we always return an array to prevent UI crashes
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.complaints)) return data.complaints;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  // Fallback if the structure is completely unrecognized
  return [];
};