// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface KHGUser {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
  region?: string;
  phone?: string;
  push_token?: string;
}

export type UserRole =
  | "teacher"
  | "community_health_worker"
  | "clinic_staff"
  | "emergency_officer"
  | "school_admin"
  | "super_admin";

// ─── Offline Reporting ────────────────────────────────────────────────────────

export type ReportType =
  | "mosquito_breeding"
  | "stagnant_water"
  | "waste_buildup"
  | "flooding"
  | "sick_children";

export type SeverityLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

export interface OfflineReport {
  local_id: string;
  type: ReportType;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  local_image_url?: string;
  local_voice_note_url?: string;
  severity: SeverityLevel;
  status: ReportStatus;
  reporter_id: string;
  created_at: string;
  synced: number | boolean;
  retry_count?: number;
}

// ─── Risk Alerts ──────────────────────────────────────────────────────────────

export type HazardType =
  | "flooding"
  | "heat_stress"
  | "malaria"
  | "cholera"
  | "dengue"
  | "air_pollution"
  | "stagnant_water";

export type RiskLevel = "safe" | "moderate" | "high" | "critical";

export interface Alert {
  id: string;
  title: string;
  body: string;
  hazard_type: HazardType;
  risk_level: RiskLevel;
  region: string;
  issued_at: string;
  acknowledged: boolean;
  source?: "ai" | "sensor" | "weather_api" | "manual";
  location_id?: string;
}

// ─── Locations ────────────────────────────────────────────────────────────────

export interface School {
  id: string;
  name: string;
  address: string;
  student_count: number;
  latitude: number;
  longitude: number;
  safety_score?: number;
  region?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  safety_score?: number;
  capacity?: number;
  region?: string;
}

export interface Community {
  id: string;
  name: string;
  region: string;
  population?: number;
  latitude: number;
  longitude: number;
}

// ─── Sensor / IoT Data ────────────────────────────────────────────────────────

export interface SensorDevice {
  id: string;
  device_id: string;
  location_id?: string;
  device_type: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  last_seen?: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  air_quality_index?: number;
  uv_index?: number;
  water_level?: number;
  pm25?: number;
}

// ─── AI Predictions ──────────────────────────────────────────────────────────

export interface DiseasePrediction {
  id: string;
  location_id: string;
  disease: string;
  probability: number; // 0.0 – 1.0
  risk_level: RiskLevel;
  prediction_date: string;
  confidence?: number;
  factors?: string[];
}

export interface RiskForecast {
  location_id: string;
  overall_risk: RiskLevel;
  predictions: DiseasePrediction[];
  generated_at: string;
}

// ─── Map Markers ─────────────────────────────────────────────────────────────

export type MarkerType = "school" | "clinic" | "hazard" | "community";

export interface MapMarker {
  id: string;
  name: string;
  type: MarkerType;
  latitude: number;
  longitude: number;
  risk_level: RiskLevel;
  safety_score?: number;
  details?: string;
}
