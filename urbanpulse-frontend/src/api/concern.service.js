import api from "./axios";

export const concernService = {
  createConcern: async ({ category, description, location, priority }) => {
    let formattedLocation = location;

    if (location && typeof location === "object") {
      const lat = location.latitude ?? location.lat;
      const lng = location.longitude ?? location.lng;
      formattedLocation = {
        latitude: Number(lat),
        longitude: Number(lng),
      };
    } else if (typeof location === "string" && location.includes(",")) {
      const [lat, lng] = location.split(",").map((v) => Number(v.trim()));
      formattedLocation = { latitude: lat, longitude: lng };
    }

    const response = await api.post("/concerns/", {
      category,
      description,
      location: formattedLocation,
      priority: String(priority).toLowerCase(),
    });
    return response.data;
  },

  uploadConcernImage: async (concernId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/concerns/${concernId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getAllConcerns: async () => {
    const response = await api.get("/concerns/");
    return response.data;
  },

  getConcernImages: async (concernId) => {
    const response = await api.get(`/concerns/${concernId}/images`);
    return response.data;
  },

  updateConcernStatus: async (concernId, status) => {
    const response = await api.patch(`/concerns/${concernId}/status`, {
      status,
    });
    return response.data;
  },

  deleteConcern: async (concernId) => {
    const response = await api.delete(`/concerns/${concernId}`);
    return response.data;
  },
};
