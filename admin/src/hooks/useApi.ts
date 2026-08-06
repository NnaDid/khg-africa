import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import api from '../api';

// ─── Analytics / Summary ──────────────────────────────────────────────────────

export function useSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary');
      return data;
    },
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useRiskTrends() {
  return useQuery({
    queryKey: ['analytics', 'risk-trends'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/risk-trends');
      return data;
    },
    refetchInterval: 60_000,
    retry: 2,
  });
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      // Fetch directly from Supabase for fast response (bypassing FastAPI for reads)
      const { data, error } = await supabase
        .from('risk_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await api.patch(`/alerts/${alertId}/resolve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// ─── Schools ──────────────────────────────────────────────────────────────────

export function useSchools() {
  return useQuery({
    queryKey: ['locations', 'schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id, name, address, location, student_count,
          safety_scores(score, level, timestamp)
        `)
        .order('name');

      if (error) throw error;
      return (data || []).map((school: any) => {
        let gps_lat = 0;
        let gps_lng = 0;
        if (school.location) {
          if (typeof school.location === 'string') {
            const match = school.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            if (match) {
              gps_lng = parseFloat(match[1]);
              gps_lat = parseFloat(match[2]);
            }
          } else if (school.location.coordinates) {
            gps_lng = school.location.coordinates[0];
            gps_lat = school.location.coordinates[1];
          }
        }
        return {
          id: school.id,
          name: school.name,
          region: school.address,
          gps_lat,
          gps_lng,
          total_children: school.student_count,
          safety_scores: school.safety_scores,
        };
      });
    },
    refetchInterval: 60_000,
    retry: 2,
  });
}

// ─── Clinics ──────────────────────────────────────────────────────────────────

export function useClinics() {
  return useQuery({
    queryKey: ['locations', 'clinics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select(`
          id, name, address, location, capacity,
          safety_scores(score, level, timestamp)
        `)
        .order('name');

      if (error) throw error;
      return (data || []).map((clinic: any) => {
        let gps_lat = 0;
        let gps_lng = 0;
        if (clinic.location) {
          if (typeof clinic.location === 'string') {
            const match = clinic.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            if (match) {
              gps_lng = parseFloat(match[1]);
              gps_lat = parseFloat(match[2]);
            }
          } else if (clinic.location.coordinates) {
            gps_lng = clinic.location.coordinates[0];
            gps_lat = clinic.location.coordinates[1];
          }
        }
        return {
          id: clinic.id,
          name: clinic.name,
          region: clinic.address,
          gps_lat,
          gps_lng,
          capacity: clinic.capacity,
          safety_scores: clinic.safety_scores,
        };
      });
    },
    refetchInterval: 60_000,
    retry: 2,
  });
}

// ─── Emergency / Interventions ────────────────────────────────────────────────

export function useInterventions() {
  return useQuery({
    queryKey: ['emergency', 'interventions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_interventions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useDeployTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      alert_id: string;
      team_name: string;
      action_taken: string;
      lat: number;
      lng: number;
    }) => {
      const { data } = await api.post('/emergency/deploy', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency', 'interventions'] });
    },
  });
}

// ─── AI Predictions ───────────────────────────────────────────────────────────

export function useAIPredictions() {
  return useQuery({
    queryKey: ['ai', 'predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disease_predictions')
        .select('*, locations(name, region, type)')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
    retry: 2,
  });
}

// ─── Sensor Readings ──────────────────────────────────────────────────────────

export function useSensorReadings(limit = 20) {
  return useQuery({
    queryKey: ['sensors', 'readings', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15_000,
    retry: 2,
  });
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
    retry: 2,
  });
}

// ─── Simulation Status ────────────────────────────────────────────────────────

export function useSimulationStatus() {
  return useQuery({
    queryKey: ['simulation', 'status'],
    queryFn: async () => {
      const { data } = await api.get('/simulation/status');
      return data;
    },
    refetchInterval: 15_000,
    retry: 1,
  });
}
