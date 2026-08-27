import api from './axios'

export const concernService = {
  // Notice the trailing slash added after /concerns/
  createConcern: async ({ category, description, location, priority }) => {
    const response = await api.post('/concerns/', {
      category,
      description,
      location,
      priority,
    })
    return response.data
  },

  // Notice the trailing slash added after /images/
  uploadConcernImage: async (concernId, file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(`/concerns/${concernId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}