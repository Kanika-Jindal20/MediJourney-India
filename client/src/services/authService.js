import api from './api';

export const authService = {
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('medijourney_token', data.token);
      localStorage.setItem('medijourney_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData) => {
    const data = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('medijourney_token', data.token);
      localStorage.setItem('medijourney_user', JSON.stringify(data.user));
    }
    return data;
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    const data = await api.put('/auth/profile', profileData);
    if (data.user) {
      localStorage.setItem('medijourney_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('medijourney_token');
    localStorage.removeItem('medijourney_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('medijourney_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
