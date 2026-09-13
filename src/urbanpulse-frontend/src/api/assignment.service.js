/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Ashish Pant
 * Date of Last Modification: 13 September 2026
 * Brief Description:Handles API requests for worker assignments and assignment status.
 */

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
      concern_id: parseInt(
        assignmentData.concern_id ?? assignmentData.point_id ?? assignmentData.id,
        10
      ),
      status: assignmentData.status || 'assigned',
    };
    const response = await api.post('/assignments', payload);
    return response.data;
  },

  updateAssignmentStatus: async (assignmentId, status, issueReason = null) => {
    const payload = {
      status: String(status).toLowerCase(),
      ...(issueReason ? { issue_reason: issueReason } : {}),
    };
    const response = await api.patch(`/assignments/${assignmentId}/status`, payload);
    return response.data;
  },
};

export default assignmentService;