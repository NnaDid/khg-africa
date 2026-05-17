import { RiskLevel, HazardType } from '../constants/colors';
import { UserRole } from '../constants/config';

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface KHGUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  language?: string;
  assigned_school_ids?: string[];
  assigned_clinic_ids?: string[];
  region?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthSession {
  user: KHGUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ─── Alerts ─────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  title: string;
  body: string;
  hazard_type: HazardType;
  risk_level: RiskLevel;
  region?: string;
  location?: Coordinates;
  affected_locations?: string[];
  issued_at: string;
  expires_at?: string;
  acknowledged?: boolean;
  source: 'ai' | 'manual' | 'weather_api' | 'sensor';
  metadata?: Record<string, unknown>;
}

// ─── Reports ────────────────────────────────────────────────────────────────
export interface Report {
  id: string;
  type: 'STAGNANT_WATER' | 'WASTE_BUILDUP' | 'FLOODING' | 'SICK_CHILD' | 'MOSQUITO_BREEDING';
  description?: string;
  image_url?: string;
  voice_note_url?: string;
  location: Coordinates;
  severity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  reporter_id: string;
  created_at: string;
  synced: boolean;
  local_id?: string;
}

export interface OfflineReport extends Omit<Report, 'id' | 'synced' | 'image_url' | 'voice_note_url'> {
  local_id: string;
  synced: 0 | 1;
  retry_count: number;
  local_image_url?: string;   // local file URI
  local_voice_note_url?: string; // local file URI
}

// ─── Locations ──────────────────────────────────────────────────────────────
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface School {
  id: string;
  name: string;
  location: Coordinates;
  region: string;
  student_count?: number;
  risk_level: RiskLevel;
  safety_score: number;  // 0-100
  temperature?: number;
  humidity?: number;
  air_quality_index?: number;
  uv_index?: number;
  overcrowding?: boolean;
  last_updated: string;
}

export interface Clinic {
  id: string;
  name: string;
  location: Coordinates;
  region: string;
  risk_level: RiskLevel;
  outbreak_indicators: string[];
  patient_influx_trend: 'low' | 'normal' | 'high' | 'surge';
  emergency_readiness: number;   // 0-100
  vaccine_availability: boolean;
  supply_level: 'critical' | 'low' | 'adequate' | 'good';
  last_updated: string;
}

// ─── Risk Forecast ───────────────────────────────────────────────────────────
export interface RiskForecast {
  location: Coordinates;
  region: string;
  overall_risk: RiskLevel;
  hazards: {
    type: HazardType;
    risk_level: RiskLevel;
    probability: number;
    trend: 'rising' | 'stable' | 'falling';
  }[];
  ai_recommendations: string[];
  forecast_date: string;
  valid_until: string;
}

// ─── Offline Queue ───────────────────────────────────────────────────────────
export interface QueueItem {
  id: string;
  type: 'report' | 'media_upload' | 'alert_ack';
  payload: string;    // JSON string
  created_at: string;
  retry_count: number;
  last_error?: string;
}

// ─── Sensor Data ─────────────────────────────────────────────────────────────
export interface SensorReading {
  school_id?: string;
  clinic_id?: string;
  temperature: number;
  humidity: number;
  air_quality_index: number;
  uv_index: number;
  timestamp: string;
}
