import api from './api';

export const appointmentService = {
  createAppointment: async (formData) => {
    // Supports FormData for file upload or raw JSON
    const headers =
      formData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

    return await api.post('/appointments', formData, { headers });
  },

  getPatientAppointments: async (email) => {
    return await api.get('/appointments/my-requests', { params: { email } });
  },

  getDoctorQueue: async (params = {}) => {
    return await api.get('/appointments/doctor-queue', { params });
  },

  getAdminAppointments: async (params = {}) => {
    return await api.get('/appointments/admin-all', { params });
  },

  getAppointment: async (idOrRef) => {
    return await api.get(`/appointments/${idOrRef}`);
  },

  updateStatus: async (id, statusData) => {
    return await api.patch(`/appointments/${id}/status`, statusData);
  },

  uploadDocument: async (id, file, category = 'Diagnostic Scan (MRI/CT/X-Ray)') => {
    const formData = new FormData();
    formData.append('medicalReport', file);
    formData.append('category', category);
    return await api.post(`/appointments/${id}/upload-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getVisaLetter: async (idOrRef) => {
    return await api.get(`/appointments/${idOrRef}/visa-letter`);
  },

  updateFlightLogistics: async (id, flightData) => {
    return await api.patch(`/appointments/${id}/flight-logistics`, flightData);
  },
};
