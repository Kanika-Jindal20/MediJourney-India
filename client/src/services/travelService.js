import api from './api';

export const travelService = {
  getTravelGuidelines: async () => {
    return await api.get('/travel/guidelines');
  },
};
