import api from './axios';

export const routeService = {
  // Collection Routes
  getAllRoutes: async () => {
    const response = await api.get('/collection-routes');
    return response.data;
  },
  createRoute: async (routeData) => {
    const payload = {
      route_name: routeData.name,
      description: routeData.description || "",
      worker_id: parseInt(routeData.worker_id, 10),
      route_date: routeData.route_date || new Date().toISOString().split("T")[0],
    };
    const response = await api.post('/collection-routes', payload);
    return response.data;
  },
  getRouteById: async (routeId) => {
    const response = await api.get(`/collection-routes/${routeId}`);
    return response.data;
  },
  updateRouteStatus: async (routeId, status) => {
    const response = await api.patch(`/collection-routes/${routeId}/status`, { status });
    return response.data;
  },

  // Collection Points
  getAllPoints: async () => {
    const response = await api.get('/collection-points');
    return response.data;
  },
  createPoint: async (pointData) => {
  const payload = {
    name: pointData.name,
    latitude: parseFloat(pointData.latitude),
    longitude: parseFloat(pointData.longitude),
    route_id: parseInt(pointData.route_id, 10),
    sequence_order: parseInt(pointData.sequence_order || 1, 10),
  };

  // Only send waste_bin_id if it actually has a UUID value
  if (
    pointData.waste_bin_id &&
    String(pointData.waste_bin_id).trim()
  ) {
    payload.waste_bin_id = String(pointData.waste_bin_id).trim();
  }

  const response = await api.post('/collection-points', payload);
  return response.data;
},
  getPointsByRoute: async (routeId) => {
    const response = await api.get(`/collection-points/route/${routeId}`);
    return response.data;
  },
  markPointCollected: async (pointId) => {
    const response = await api.patch(`/collection-points/${pointId}/collect`);
    return response.data;
  },

  // Worker Assignments
  createAssignment: async (assignmentData) => {
    const payload = {
      worker_id: parseInt(assignmentData.worker_id, 10),
      point_id: parseInt(assignmentData.point_id, 10),
      status: assignmentData.status || "assigned",
    };
    const response = await api.post('/assignments', payload);
    return response.data;
  },
  getAssignments: async () => {
    const response = await api.get('/assignments');
    return response.data;
  },
};