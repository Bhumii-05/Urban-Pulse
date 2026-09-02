import api from './axios';

export const assignmentService = {
  getAssignments: async () => {
    const response = await api.get('/assignments');
    const data = response.data;
    return Array.isArray(data)
      ? data
      : data?.assignments || data?.results || data?.data || [];
  },

  getAssignmentById: async (assignmentId) => {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data;
  },

  createAssignment: async (assignmentData) => {
    // FastAPI Schema requires concern_id and worker_id
    const payload = {
      worker_id: parseInt(assignmentData.worker_id, 10),
      concern_id: parseInt(assignmentData.concern_id ?? assignmentData.point_id ?? assignmentData.id, 10),
      status: assignmentData.status || 'assigned',
    };
    const response = await api.post('/assignments', payload);
    return response.data;
  },

  updateAssignmentStatus: async (assignmentId, status) => {
    const response = await api.patch(`/assignments/${assignmentId}/status`, {
      status: String(status).toLowerCase(),
    });
    return response.data;
  },
};

export default assignmentService;