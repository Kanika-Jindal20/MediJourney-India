import api from './api';

export const hospitalService = {
  getHospitals: async (params = {}) => {
    return await api.get('/hospitals', { params });
  },

  getFeatured: async () => {
    return await api.get('/hospitals/featured');
  },

  getCities: async () => {
    return await api.get('/hospitals/cities');
  },

  getHospital: async (idOrSlug) => {
    return await api.get(`/hospitals/${idOrSlug}`);
  },

  createHospital: async (hospitalData) => {
    return await api.post('/hospitals', hospitalData);
  },

  updateHospital: async (id, hospitalData) => {
    return await api.put(`/hospitals/${id}`, hospitalData);
  },

  deleteHospital: async (id) => {
    return await api.delete(`/hospitals/${id}`);
  },
};
