-- Enable PostGIS for geo-intelligence
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Profiles (RBAC)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'community_health_worker' 
        CHECK (role IN ('super_admin', 'government_admin', 'ngo_admin', 'school_admin', 'clinic_staff', 'teacher', 'community_health_worker', 'emergency_officer')),
    location_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Schools
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT),
    address TEXT,
    contact_email TEXT,
    student_count INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Clinics
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT),
    address TEXT,
    contact_phone TEXT,
    capacity INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Communities
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT,
    population_est INT,
    risk_level TEXT DEFAULT 'SAFE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Sensor Devices
CREATE TABLE sensor_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('WEATHER_STATION', 'AIR_QUALITY_SENSOR', 'FLOOD_SENSOR')),
    location_id UUID NOT NULL, -- FK to school, clinic or community
    location_type TEXT CHECK (location_type IN ('school', 'clinic', 'community')),
    status TEXT DEFAULT 'ACTIVE',
    last_seen TIMESTAMP WITH TIME ZONE
);

-- 6. Sensor Readings
CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES sensor_devices(id),
    temperature NUMERIC,
    humidity NUMERIC,
    air_quality INT,
    uv_index INT,
    rainfall NUMERIC,
    overcrowding_index INT,
    flood_risk NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Risk Alerts
CREATE TABLE risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    message TEXT,
    location_id UUID,
    location_type TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Disease Predictions
CREATE TABLE disease_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID,
    disease_type TEXT NOT NULL,
    risk_score NUMERIC,
    risk_level TEXT,
    recommendation TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Community Reports (Crowdsourcing)
CREATE TABLE community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES profiles(id),
    type TEXT CHECK (type IN ('STAGNANT_WATER', 'WASTE_BUILDUP', 'FLOODING', 'SICK_CHILD', 'MOSQUITO_BREEDING')),
    description TEXT,
    image_url TEXT,
    voice_note_url TEXT,
    location GEOGRAPHY(POINT),
    severity TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Safety Scores
CREATE TABLE safety_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID,
    score NUMERIC,
    level TEXT,
    predictions JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. SMS & Email Logs
CREATE TABLE sms_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient TEXT,
    message TEXT,
    provider TEXT,
    status TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient TEXT,
    subject TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Emergency Interventions
CREATE TABLE emergency_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES risk_alerts(id),
    team_name TEXT,
    action_taken TEXT,
    status TEXT DEFAULT 'DEPLOYED',
    gps_coords GEOGRAPHY(POINT),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create a trigger to create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'community_health_worker'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- 13. System Settings
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Offline Sync Queue
CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    payload JSONB,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
