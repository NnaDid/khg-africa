import axios from 'axios';
import { supabase } from '../services/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Auth Interceptor ─────────────────────────────────────────────────────────
// Uses Supabase client session directly — avoids localStorage key guessing
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Session unavailable — proceed without auth token
  }
  return config;
});

// ─── Response Error Handler ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut();
    }
    return Promise.reject(error);
  }
);

// ─── AI / Predictions ─────────────────────────────────────────────────────────
export const aiService = {
  getPredictions: () => api.get('/analytics/summary'),
  getRiskSummary: () => api.get('/analytics/summary'),
  getRiskTrends: () => api.get('/analytics/risk-trends'),
};

// ─── Sensors ──────────────────────────────────────────────────────────────────
export const sensorsService = {
  getReadings: (limit = 20) => api.get(`/sensors/readings?limit=${limit}`),
  getReadingsByDevice: (deviceId: string) => api.get(`/sensors/readings/${deviceId}`),
  getPredictions: (locationId: string) => api.get(`/sensors/predictions/${locationId}`),
};

// ─── Emergency ────────────────────────────────────────────────────────────────
export const emergencyService = {
  // Fixed: backend endpoint is /emergency/deploy, not /emergency/dispatch
  dispatchTeam: (data: {
    alert_id: string;
    team_name: string;
    action_taken: string;
    lat: number;
    lng: number;
  }) => api.post('/emergency/deploy', data),
  getLiveSimulation: () => api.get('/simulation/live'),
  getInterventions: () => api.get('/emergency/interventions'),
  updateIntervention: (id: string, status: string) =>
    api.patch(`/emergency/interventions/${id}`, { status }),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertsService = {
  getAlerts: () => api.get('/alerts/'),
  resolveAlert: (alertId: string) => api.patch(`/alerts/${alertId}/resolve`),
  broadcastAlert: (data: object) => api.post('/alerts/broadcast', data),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsService = {
  getSummary: () => api.get('/analytics/summary'),
  getRiskTrends: () => api.get('/analytics/risk-trends'),
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationsService = {
  getSchools: () => api.get('/locations/schools'),
  getClinics: () => api.get('/locations/clinics'),
  getSafetyScore: (locationId: string) =>
    api.get(`/locations/safety-scores/${locationId}`),
};

// ─── Simulation ───────────────────────────────────────────────────────────────
export const simulationService = {
  getStatus: () => api.get('/simulation/status'),
  getLive: () => api.get('/simulation/live'),
  triggerCycle: () => api.post('/simulation/trigger'),
};

export default api;
