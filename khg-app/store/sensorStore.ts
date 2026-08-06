import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SensorReading {
  device_id: string;
  device_name?: string;
  location_id?: string;
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
  predictions?: Record<string, any>;
  timestamp: string;
}

interface SensorState {
  /** Latest reading per device (keyed by device_id) */
  latestReadings: Record<string, SensorReading>;
  /** Most recent reading across all devices (for dashboard primary card) */
  primaryReading: SensorReading | null;
  /** Recent history for sparklines (last 20 readings across all devices) */
  readingHistory: SensorReading[];

  updateReading: (reading: SensorReading) => void;
  clearReadings: () => void;
}

export const useSensorStore = create<SensorState>()(
  persist(
    (set) => ({
      latestReadings: {},
      primaryReading: null,
      readingHistory: [],

      updateReading: (reading) =>
        set((state) => {
          const newHistory = [reading, ...state.readingHistory].slice(0, 20);
          return {
            latestReadings: {
              ...state.latestReadings,
              [reading.device_id]: reading,
            },
            primaryReading: reading,
            readingHistory: newHistory,
          };
        }),

      clearReadings: () =>
        set({
          latestReadings: {},
          primaryReading: null,
          readingHistory: [],
        }),
    }),
    {
      name: "khg-sensors",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist latest readings and history — not derived state
      partialize: (state) => ({
        latestReadings: state.latestReadings,
        primaryReading: state.primaryReading,
        readingHistory: state.readingHistory,
      }),
    }
  )
);
