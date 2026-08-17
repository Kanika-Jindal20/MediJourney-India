import api from './api';

export const aiService = {
  getDiscoveryRecommendations: async (queryData) => {
    return await api.post('/ai/discovery', queryData);
  },
};
