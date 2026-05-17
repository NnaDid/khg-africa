import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { supabase } from "../services/supabase";
import { APP_CONFIG } from "../constants/config";

const apiClient = axios.create({
  baseURL: APP_CONFIG.fastapiBaseUrl,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
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
      // Proceed without token if session is missing
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
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && data.session) {
          original.headers.Authorization = `Bearer ${data.session.access_token}`;
          return apiClient(original);
        }
      } catch {
        // Refresh failed, let the downstream clean up
      }
      await supabase.auth.signOut();
    }

    if (!error.response) {
      return Promise.reject({ ...error, isNetworkError: true });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
