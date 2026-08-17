import api from './api';

export const doctorService = {
  getDoctors: async (params = {}) => {
    return await api.get('/doctors', { params });
  },

  getDoctor: async (id) => {
    return await api.get(`/doctors/${id}`);
  },

  getDoctorSlots: async (id, date) => {
    return await api.get(`/doctors/${id}/slots`, { params: { date } });
  },

  createSlot: async (doctorId, slotData) => {
    return await api.post(`/doctors/${doctorId}/slots`, slotData);
  },

  deleteSlot: async (slotId) => {
    return await api.delete(`/doctors/slots/${slotId}`);
  },

  getDoctorMetrics: async () => {
    return await api.get('/doctors/dashboard/metrics');
  },

  createDoctor: async (doctorData) => {
    return await api.post('/doctors', doctorData);
  },

  updateDoctor: async (id, doctorData) => {
    return await api.put(`/doctors/${id}`, doctorData);
  },
};
