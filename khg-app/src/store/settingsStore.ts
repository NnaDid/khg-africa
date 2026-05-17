import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  isDemoMode: boolean;
  language: string;
  notificationsEnabled: boolean;
  offlineMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  setNotifications: (enabled: boolean) => void;
  setOfflineMode: (offline: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      isDemoMode: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
      language: 'en',
      notificationsEnabled: true,
      offlineMode: false,

      setDemoMode: (isDemoMode) => set({ isDemoMode }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),
      setOfflineMode: (offlineMode) => set({ offlineMode }),
    }),
    {
      name: 'khg-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
