import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase';
import { APP_CONFIG } from '../constants/config';

const apiClient = axios.create({
  baseURL: APP_CONFIG.fastapiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor: inject JWT ────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: token refresh + global error handling ─────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && data.session) {
        original.headers.Authorization = `Bearer ${data.session.access_token}`;
        return apiClient(original);
      }
      // refresh failed — sign out
      await supabase.auth.signOut();
    }

    // Network error handling
    if (!error.response) {
      return Promise.reject({ ...error, isNetworkError: true });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
