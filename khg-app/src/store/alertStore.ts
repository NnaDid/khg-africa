import { create } from 'zustand';
import { Alert } from '../types';

interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => !a.acknowledged).length,
    }),

  addAlert: (alert) =>
    set((state) => {
      const exists = state.alerts.find((a) => a.id === alert.id);
      if (exists) return state;
      const updated = [alert, ...state.alerts];
      return { alerts: updated, unreadCount: updated.filter((a) => !a.acknowledged).length };
    }),

  acknowledgeAlert: (id) =>
    set((state) => {
      const alerts = state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
      return { alerts, unreadCount: alerts.filter((a) => !a.acknowledged).length };
    }),

  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}));
