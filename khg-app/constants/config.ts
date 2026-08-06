import Constants from "expo-constants";

const rawWsUrl = process.env.EXPO_PUBLIC_FASTAPI_WS_URL || "ws://localhost:8000/ws/realtime";
// Normalize WS URL: ensure it starts with ws:// or wss:// and ends with /ws/realtime or /ws
const normalizedWsUrl = rawWsUrl.endsWith("/realtime")
  ? rawWsUrl
  : rawWsUrl.endsWith("/ws")
  ? `${rawWsUrl}/realtime`
  : `${rawWsUrl.replace(/\/+$/, "")}/ws/realtime`;

export const APP_CONFIG = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
  fastapiBaseUrl: process.env.EXPO_PUBLIC_FASTAPI_BASE_URL || "http://localhost:8000/api/v1",
  fastapiWsUrl: normalizedWsUrl,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV || "development",
  isDemoModeDefault: process.env.EXPO_PUBLIC_DEMO_MODE === "true",
};

export const REPORT_TYPES = [
  { id: "mosquito_breeding", label: "Mosquito Breeding Site", icon: "bug-outline" },
  { id: "stagnant_water", label: "Stagnant Water Pool", icon: "water-outline" },
  { id: "waste_buildup", label: "Waste Accumulation", icon: "trash-outline" },
  { id: "flooding", label: "Localized Flooding", icon: "rainy-outline" },
  { id: "sick_children", label: "Sick Child Cluster", icon: "alert-circle-outline" },
];
