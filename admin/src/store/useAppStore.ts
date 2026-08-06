import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: 'super_admin' | 'gov_admin' | 'ngo_admin' | 'school_admin' | 'clinic_staff' | 'emergency_officer' | 'data_analyst';
  region?: string;
  organization?: string;
}

export interface LiveAlert {
  id: string;
  title: string;
  body: string;
  hazard_type: string;
  risk_level: string;
  region: string;
  location_type?: string;
  issued_at: string;
  acknowledged: boolean;
  score?: number;
  recommendation?: string;
}

export interface SensorFeedEntry {
  device_id: string;
  device_name?: string;
  location_id: string;
  location_type?: string;
  temperature: number;
  humidity: number;
  air_quality: number;
  uv_index: number;
  rainfall: number;
  overcrowding_index: number;
  flood_risk: number;
  safety_score?: number;
  safety_level?: string;
  timestamp: string;
}

interface AppState {
  // ── Auth ───────────────────────────────────────────────────────────────────
  user: User | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // ── WebSocket Status ───────────────────────────────────────────────────────
  isWsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // ── Live Alerts (pushed via WebSocket) ────────────────────────────────────
  liveAlerts: LiveAlert[];
  addLiveAlert: (alert: LiveAlert) => void;
  clearLiveAlerts: () => void;
  acknowledgeAlert: (alertId: string) => void;

  // ── Sensor Feed (latest reading per device) ────────────────────────────────
  sensorFeed: Record<string, SensorFeedEntry>;
  updateSensorFeed: (data: SensorFeedEntry & { _type?: string }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // ── Auth ───────────────────────────────────────────────────────────────────
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // ── WebSocket Status ───────────────────────────────────────────────────────
  isWsConnected: false,
  setWsConnected: (connected) => set({ isWsConnected: connected }),

  // ── Live Alerts ────────────────────────────────────────────────────────────
  liveAlerts: [],
  addLiveAlert: (alert) =>
    set((state) => {
      // Deduplicate by alert ID
      const existing = state.liveAlerts.find((a) => a.id === alert.id);
      if (existing) return state;
      // Keep most recent 50 alerts
      return { liveAlerts: [alert, ...state.liveAlerts].slice(0, 50) };
    }),
  clearLiveAlerts: () => set({ liveAlerts: [] }),
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      liveAlerts: state.liveAlerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    })),

  // ── Sensor Feed ────────────────────────────────────────────────────────────
  sensorFeed: {},
  updateSensorFeed: (data) =>
    set((state) => ({
      sensorFeed: {
        ...state.sensorFeed,
        [data.device_id || 'unknown']: {
          ...data,
          timestamp: data.timestamp || new Date().toISOString(),
        },
      },
    })),
}));
