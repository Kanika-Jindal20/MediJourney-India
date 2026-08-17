import api from './api';

export const analyticsService = {
  getSummary: async () => {
    return await api.get('/analytics/summary');
  },
};
