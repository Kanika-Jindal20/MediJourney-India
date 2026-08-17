import api from './api';

export const treatmentService = {
  getTreatments: async (params = {}) => {
    return await api.get('/treatments', { params });
  },

  getTreatment: async (slugOrId) => {
    return await api.get(`/treatments/${slugOrId}`);
  },

  compareTreatments: async (ids) => {
    return await api.get('/treatments/compare/items', { params: { ids } });
  },

  createTreatment: async (treatmentData) => {
    return await api.post('/treatments', treatmentData);
  },

  updateTreatment: async (id, treatmentData) => {
    return await api.put(`/treatments/${id}`, treatmentData);
  },

  deleteTreatment: async (id) => {
    return await api.delete(`/treatments/${id}`);
  },
};
