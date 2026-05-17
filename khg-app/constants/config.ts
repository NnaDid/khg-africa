import Constants from "expo-constants";

export const APP_CONFIG = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
  fastapiBaseUrl: process.env.EXPO_PUBLIC_FASTAPI_BASE_URL || "https://your-fastapi-server.com/api/v1",
  fastapiWsUrl: process.env.EXPO_PUBLIC_FASTAPI_WS_URL || "wss://your-fastapi-server.com/ws",
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
