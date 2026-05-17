import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Auth
api.interceptors.request.use(async (config) => {
  const session = JSON.parse(localStorage.getItem('sb-auth-token') || '{}');
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const aiService = {
  getPredictions: () => api.get('/ai/predict'),
  getRiskSummary: () => api.get('/analytics/summary'),
};

export const emergencyService = {
  dispatchTeam: (data: any) => api.post('/emergency/dispatch', data),
  getLiveSimulation: () => api.get('/simulation/live'),
};

export default api;
