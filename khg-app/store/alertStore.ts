import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AlertItem {
  id: string;
  title: string;
  body: string;
  hazard_type: string;
  risk_level: string;
  region: string;
  issued_at: string;
  acknowledged: boolean;
}

interface AlertState {
  unreadCount: number;
  alerts: AlertItem[];
  setAlerts: (alerts: AlertItem[]) => void;
  addAlert: (alert: AlertItem) => void;
  acknowledgeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      unreadCount: 3,
      alerts: [],
      setAlerts: (alerts) => set({ alerts, unreadCount: alerts.filter(a => !a.acknowledged).length }),
      addAlert: (alert) => set((state) => {
        const alerts = [alert, ...state.alerts];
        return {
          alerts,
          unreadCount: state.unreadCount + 1
        };
      }),
      acknowledgeAlert: (id) => set((state) => {
        const alerts = state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a);
        return {
          alerts,
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      })
    }),
    {
      name: "khg-alerts",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
