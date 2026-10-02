import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const prescriptionService = {
  extract: async (text, notes = '') => {
    const res = await api.post('/prescriptions', { text, notes });
    return res.data;
  },
  getAll: async (page = 1, limit = 20) => {
    const res = await api.get(`/prescriptions?page=${page}&limit=${limit}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/prescriptions/${id}`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/prescriptions/${id}`);
    return res.data;
  },
};

export default api;
