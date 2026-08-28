import api from "./axios";

export async function submitComplaint(
  complaint,
  image = null
) {
  if (!complaint || !complaint.trim()) {
    throw new Error(
      "Complaint cannot be empty."
    );
  }

  const formData = new FormData();

  formData.append(
    "complaint",
    complaint.trim()
  );

  if (image) {
    formData.append(
      "image",
      image
    );
  }

  const response = await api.post(
    "/ai/complaint",
    formData
  );

  return response.data;
}