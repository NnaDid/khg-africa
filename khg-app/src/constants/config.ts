export const USER_ROLES = {
  teacher: {
    id: 'teacher',
    label: 'Teacher',
    icon: 'school',
    modules: ['dashboard', 'map', 'report', 'alerts', 'schools'],
  },
  chw: {
    id: 'chw',
    label: 'Community Health Worker',
    icon: 'medkit',
    modules: ['dashboard', 'map', 'report', 'alerts', 'clinics'],
  },
  clinic_staff: {
    id: 'clinic_staff',
    label: 'Clinic Staff',
    icon: 'medical',
    modules: ['dashboard', 'map', 'report', 'alerts', 'clinics', 'schools'],
  },
  emergency_officer: {
    id: 'emergency_officer',
    label: 'Emergency Officer',
    icon: 'warning',
    modules: ['dashboard', 'map', 'report', 'alerts', 'clinics', 'schools'],
  },
  school_admin: {
    id: 'school_admin',
    label: 'School Admin',
    icon: 'business',
    modules: ['dashboard', 'map', 'report', 'alerts', 'schools'],
  },
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const REPORT_TYPES = [
  { id: 'stagnant_water', label: 'Stagnant Water', icon: 'water', hazard: 'malaria' },
  { id: 'waste_buildup', label: 'Waste Buildup', icon: 'trash', hazard: 'cholera' },
  { id: 'flooding', label: 'Flooding', icon: 'rainy', hazard: 'flooding' },
  { id: 'mosquito_breeding', label: 'Mosquito Breeding Site', icon: 'bug', hazard: 'malaria' },
  { id: 'sick_children', label: 'Sick Children', icon: 'people', hazard: 'malaria' },
  { id: 'unsafe_classroom', label: 'Unsafe Classroom', icon: 'school', hazard: 'heat_stress' },
  { id: 'smoke_pollution', label: 'Smoke/Pollution', icon: 'cloudy', hazard: 'air_pollution' },
  { id: 'other', label: 'Other Hazard', icon: 'alert-circle', hazard: 'unknown' },
] as const;

export const APP_CONFIG = {
  offlineSyncInterval: 30_000,       // 30s sync attempt
  wsReconnectDelay: 5_000,           // 5s WS reconnect
  pollingInterval: 30_000,           // 30s fallback polling
  maxOfflineQueueSize: 100,
  maxMediaFileSizeMB: 5,
  locationUpdateInterval: 60_000,    // 1min location refresh
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  fastapiBaseUrl: process.env.EXPO_PUBLIC_FASTAPI_BASE_URL ?? 'https://api.khg-africa.com',
  fastapiWsUrl: process.env.EXPO_PUBLIC_FASTAPI_WS_URL ?? 'wss://api.khg-africa.com',
} as const;
