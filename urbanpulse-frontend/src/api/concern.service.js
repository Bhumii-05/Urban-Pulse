import api from "./axios";

export const concernService = {
  createConcern: async ({
    title,
    category = "missed_pickup",
    description,
    location,
    priority = "high",
  }) => {
    // Robust location normalization
    let formattedLocation = location;

    if (location && typeof location === "object") {
      const lat = location.latitude ?? location.lat;
      const lng = location.longitude ?? location.lng;
      if (lat != null && lng != null) {
        formattedLocation = {
          latitude: Number(lat),
          longitude: Number(lng),
        };
      }
    } else if (typeof location === "string" && location.includes(",")) {
      const [lat, lng] = location.split(",").map((v) => Number(v.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        formattedLocation = { latitude: lat, longitude: lng };
      }
    }

    // Base payload
    const payload = {
      category: String(category).toLowerCase(),
      description: description || "Reported collection issue",
      location: formattedLocation,
      priority: String(priority).toLowerCase(),
    };

    // Attach title if provided (for schemas that require it)
    if (title && String(title).trim()) {
      payload.title = String(title).trim();
    }

    const response = await api.post("/concerns/", payload);
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
      status: String(status).toLowerCase(),
    });
    return response.data;
  },

  deleteConcern: async (concernId) => {
    const response = await api.delete(`/concerns/${concernId}`);
    return response.data;
  },
};

export default concernService;