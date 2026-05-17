import apiClient from "../api/apiClient";

export const backendApi = {
  // ─── Crowdsourced Hazards Reporting ───
  submitReport: async (reportData: {
    type: string;
    description: string;
    severity: string;
    lat: number;
    lng: number;
    image_url?: string;
  }) => {
    const res = await apiClient.post("/reports/", reportData);
    return res.data;
  },

  syncOfflineReports: async (reports: Array<{
    type: string;
    description?: string;
    severity: string;
    lat: number;
    lng: number;
    image_url?: string;
    created_at: string;
  }>) => {
    const res = await apiClient.post("/reports/sync", reports);
    return res.data;
  },

  // ─── Alerts Bulletin ───
  getAlerts: async () => {
    const res = await apiClient.get("/alerts/");
    return res.data;
  },

  resolveAlert: async (alertId: string) => {
    const res = await apiClient.post(`/alerts/${alertId}/resolve`);
    return res.data;
  },

  // ─── Locations ───
  getSchools: async () => {
    const res = await apiClient.get("/locations/schools");
    return res.data;
  },

  getClinics: async () => {
    const res = await apiClient.get("/locations/clinics");
    return res.data;
  },

  getCommunities: async () => {
    const res = await apiClient.get("/locations/communities");
    return res.data;
  },

  getLocationSafetyScore: async (locationId: string) => {
    const res = await apiClient.get(`/locations/safety-scores/${locationId}`);
    return res.data;
  },

  // ─── IoT Sensor Readings ───
  getSensorDevices: async () => {
    const res = await apiClient.get("/sensors/devices");
    return res.data;
  },

  getDeviceReadings: async (deviceId: string, limit: number = 50) => {
    const res = await apiClient.get(`/sensors/readings/${deviceId}?limit=${limit}`);
    return res.data;
  },

  getLocationDiseasePredictions: async (locationId: string) => {
    const res = await apiClient.get(`/sensors/predictions/${locationId}`);
    return res.data;
  },
};
