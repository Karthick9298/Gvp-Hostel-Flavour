import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Feedback API ──────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => api.post('/feedback/submit', data),
  getMyFeedback: () => api.get('/feedback/my-feedback'),
  getSubmissionStats: (date) => api.get(`/feedback/submission-stats${date ? `?date=${date}` : ''}`),
  getAll: (params) => api.get('/feedback/all', { params }),
};

// ── Analytics API ─────────────────────────────────────────────
export const analyticsAPI = {
  getDailyAnalysis: (date) => api.get(`/analytics/daily/${date}`),
  getSystemHealth: () => api.get('/analytics/system/health'),
};

// ── User API ──────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAll: (params) => api.get('/users/all', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
};

// ── Menu API ──────────────────────────────────────────────────
export const menuAPI = {
  getCurrentWeek: () => api.get('/menu/current'),
  getToday: () => api.get('/menu/today'),
  getByDate: (date) => api.get(`/menu/date/${date}`),
  createWeekly: (data) => api.post('/menu/weekly', data),
  getAllWeekly: (params) => api.get('/menu/weekly', { params }),
  updateWeekly: (id, data) => api.put(`/menu/weekly/${id}`, data),
  deleteWeekly: (id) => api.delete(`/menu/weekly/${id}`),
};

export default api;
