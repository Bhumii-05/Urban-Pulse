/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Ashish Pant
 * Date of Last Modification: 13 September 2026
 * Brief Description: Handles API requests for map and location-based services.
 */

import api from './axios';

export const mapService = {

  getNearbyBins: async (latitude, longitude, radius = 5000) => {
    const response = await api.get('/maps/nearby-bins', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  getNearbyConcerns: async (latitude, longitude, radius = 5000) => {
    const response = await api.get('/maps/nearby-concerns', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  getNearbyCollectionPoints: async (latitude, longitude, radius = 5000) => {
    const response = await api.get('/maps/nearby-collection-points', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },
};