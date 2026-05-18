import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useAlertStore } from "../../store/alertStore";
import { COLORS, RISK_LEVELS } from "../../constants/colors";
import { getPendingOfflineReports } from "../../offline/database";
import { runSyncCycle } from "../../offline/sync";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { isDemoMode, offlineMode } = useSettingsStore();
  const { unreadCount } = useAlertStore();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  // Local states
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sensorReadings, setSensorReadings] = useState({
    temperature: 32.8,
    humidity: 79,
    airQuality: 88,
    uvIndex: 9,
  });

  // Simulated metrics for demo mode
  const schoolSafetyScore = 74;
  const generalRiskLevel = "moderate"; // safe, moderate, high, critical

  useEffect(() => {
    // Monitor real network state
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    // Check offline reports count
    updatePendingReportsCount();

    return () => unsubscribe();
  }, []);

  const updatePendingReportsCount = async () => {
    try {
      const pending = await getPendingOfflineReports();
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline && !isDemoMode) {
      Toast.show({
        type: "error",
        text1: "Offline Mode",
        text2: "Cannot sync reports without network connection.",
      });
      return;
    }

    setIsSyncing(true);
    try {
      await runSyncCycle((count) => {
        Toast.show({
          type: "success",
          text1: "Sync Successful",
          text2: `Successfully synchronized ${count} reports to servers.`,
        });
      });
      await updatePendingReportsCount();
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Sync Error",
        text2: e?.message ?? "An error occurred during sync.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate some simulated variations in readings for interactive fun
  const handleRefreshSensors = () => {
    setSensorReadings({
      temperature: +(30 + Math.random() * 6).toFixed(1),
      humidity: Math.floor(65 + Math.random() * 25),
      airQuality: Math.floor(50 + Math.random() * 70),
      uvIndex: Math.floor(4 + Math.random() * 8),
    });
    Toast.show({
      type: "info",
      text1: "Sensor Feed Updated",
      text2: "Fetched latest real-time environmental telemetry.",
    });
  };

  const activeRisk = RISK_LEVELS[generalRiskLevel];
  const netStatusColor = (isOnline && !offlineMode) ? "bg-emerald-500" : "bg-rose-500";
  const netStatusText = (isOnline && !offlineMode) ? "Online (Cloud Sync Active)" : "Offline (SQLite Enabled)";

  // ─── 🎒 Teacher Dashboard Renderer ───
  const renderTeacherDashboard = () => {
    return (
      <View className="gap-5">
        <LinearGradient
          colors={["#2e1065", "#0f052d"]}
          className="p-5 rounded-2xl border border-purple-500/20 shadow-2xl relative overflow-hidden"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-purple-200 text-sm font-semibold">School Wellness Bulletin</Text>
            <Ionicons name="school" size={20} color="#c084fc" />
          </View>
          <Text className="text-white text-base font-extrabold mb-1">
            Nairobi West Primary School
          </Text>
          <Text className="text-slate-300 text-xs leading-relaxed">
            Dry & dusty weather expected this afternoon. Keep classroom windows partially open to maintain air flow and ensure students stay hydrated.
          </Text>
          <View className="flex-row items-center gap-1.5 mt-3 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg self-start">
            <Ionicons name="sunny-sharp" size={14} color="#eab308" />
            <Text className="text-amber-400 text-[10px] font-black uppercase">Heat Advisory Active</Text>
          </View>
        </LinearGradient>

        <Text className="text-white text-lg font-bold">Classroom Wellness Monitor</Text>
        <View className="flex-row flex-wrap justify-between gap-3">
          <View className="w-[48%] p-4 rounded-xl border border-purple-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-violet-500/10 rounded-lg">
                <Ionicons name="people" size={18} color="#a78bfa" />
              </View>
              <Text className="text-violet-400 text-[10px] font-bold">Absenteeism</Text>
            </View>
            <Text className="text-white text-2xl font-bold">14 pupils</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">+3 Sick Leaves today</Text>
          </View>

          <View className="w-[48%] p-4 rounded-xl border border-purple-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-emerald-500/10 rounded-lg">
                <Ionicons name="shield-checkmark" size={18} color="#34d399" />
              </View>
              <Text className="text-emerald-400 text-[10px] font-bold">Netting (LLIN)</Text>
            </View>
            <Text className="text-white text-2xl font-bold">88%</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Zone targets reached</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold">Classroom Environmental Feed</Text>
        <View className="flex-row flex-wrap justify-between gap-3">
          <View className="w-[31%] p-3 rounded-xl border border-purple-900/15 bg-slate-900/60 items-center">
            <Ionicons name="thermometer-outline" size={20} color="#f87171" />
            <Text className="text-white text-lg font-extrabold mt-1.5">{sensorReadings.temperature}°C</Text>
            <Text className="text-slate-500 text-[8px] uppercase font-bold mt-0.5">Class Temp</Text>
          </View>
          <View className="w-[31%] p-3 rounded-xl border border-purple-900/15 bg-slate-900/60 items-center">
            <Ionicons name="water-outline" size={20} color="#60a5fa" />
            <Text className="text-white text-lg font-extrabold mt-1.5">{sensorReadings.humidity}%</Text>
            <Text className="text-slate-500 text-[8px] uppercase font-bold mt-0.5">Humidity</Text>
          </View>
          <View className="w-[31%] p-3 rounded-xl border border-purple-900/15 bg-slate-900/60 items-center">
            <Ionicons name="leaf-outline" size={20} color="#34d399" />
            <Text className="text-white text-lg font-extrabold mt-1.5">{sensorReadings.airQuality} AQI</Text>
            <Text className="text-slate-500 text-[8px] uppercase font-bold mt-0.5">Air Quality</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold">Quick Wellness Actions</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push("/(tab)/report")}
            className="flex-1 py-3.5 bg-purple-600 rounded-xl items-center justify-center active:opacity-85 shadow-md flex-row gap-1.5"
          >
            <Ionicons name="alert-circle-sharp" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Report Sick Child</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Toast.show({
                type: "success",
                text1: "LLIN Nets Ordered",
                text2: "Requested 25 mosquito nets for classroom distribution.",
              });
            }}
            className="flex-1 py-3.5 bg-emerald-600 rounded-xl items-center justify-center active:opacity-85 shadow-md flex-row gap-1.5"
          >
            <Ionicons name="cart" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Order LLIN Nets</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ─── 🩺 Clinic Staff Dashboard Renderer ───
  const renderClinicStaffDashboard = () => {
    return (
      <View className="gap-5">
        <LinearGradient
          colors={["#064e3b", "#022c22"]}
          className="p-5 rounded-2xl border border-emerald-500/20 shadow-2xl relative overflow-hidden"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-emerald-200 text-sm font-semibold">Clinical Epidemic Forecast</Text>
            <Ionicons name="pulse" size={20} color="#34d399" />
          </View>
          <Text className="text-white text-base font-extrabold mb-1">
            Nairobi West Clinic
          </Text>
          <Text className="text-slate-300 text-xs leading-relaxed">
            Vector density mapping indicates a 34% increase in local fever cases over baseline. Ensure malaria RDT and therapeutic stock is verified. Keep vaccine refrigerator doors closed.
          </Text>
          <View className="flex-row items-center gap-1.5 mt-3 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg self-start">
            <Ionicons name="shield" size={14} color="#34d399" />
            <Text className="text-emerald-400 text-[10px] font-black uppercase">Vaccine Cold-Chain Active</Text>
          </View>
        </LinearGradient>

        <Text className="text-white text-lg font-bold">Surveillance & Logistics</Text>
        <View className="flex-row flex-wrap justify-between gap-3">
          <View className="w-[48%] p-4 rounded-xl border border-emerald-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-rose-500/10 rounded-lg">
                <Ionicons name="trending-up" size={18} color="#f87171" />
              </View>
              <Text className="text-rose-400 text-[10px] font-bold">Fever Incidents</Text>
            </View>
            <Text className="text-white text-2xl font-bold">+34%</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Spike vs 7-day average</Text>
          </View>

          <View className="w-[48%] p-4 rounded-xl border border-emerald-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-emerald-500/10 rounded-lg">
                <Ionicons name="medkit" size={18} color="#34d399" />
              </View>
              <Text className="text-emerald-400 text-[10px] font-bold">Malaria RDTs</Text>
            </View>
            <Text className="text-white text-2xl font-bold">420 kits</Text>
            <Text className="text-emerald-400 text-[10px] mt-1.5 font-medium">Status: Secure</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold">Storage Cold-Chain Telemetry</Text>
        <View className="p-4 rounded-xl border border-emerald-900/20 bg-slate-900/60 flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-sm">Vaccine Cold Refrigerator #1</Text>
            <Text className="text-slate-400 text-xs mt-1">Real-time solar-powered thermostat monitor</Text>
          </View>
          <View className="items-center bg-emerald-950/80 border border-emerald-900/40 px-4 py-2.5 rounded-xl">
            <Text className="text-emerald-400 text-xl font-black">4.2°C</Text>
            <Text className="text-slate-400 text-[8px] uppercase font-bold mt-0.5">Status: Safe</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold">Quick Clinical Actions</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push("/(tab)/report")}
            className="flex-1 py-3.5 bg-emerald-600 rounded-xl items-center justify-center active:opacity-85 shadow-md flex-row gap-1.5"
          >
            <Ionicons name="medical-sharp" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Report Disease Case</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Toast.show({
                type: "success",
                text1: "Restock Requested",
                text2: "Resupply order for 200 Malaria RDT kits has been logged.",
              });
            }}
            className="flex-1 py-3.5 bg-teal-600 rounded-xl items-center justify-center active:opacity-85 shadow-md flex-row gap-1.5"
          >
            <Ionicons name="refresh-sharp" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Restock Supplies</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ─── 🚨 Emergency Officer Dashboard Renderer ───
  const renderEmergencyOfficerDashboard = () => {
    return (
      <View className="gap-5">
        <LinearGradient
          colors={["#7f1d1d", "#450a0a"]}
          className="p-5 rounded-2xl border border-red-500/20 shadow-2xl relative overflow-hidden"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-red-200 text-sm font-semibold">Crisis Operations Terminal</Text>
            <Ionicons name="nuclear" size={20} color="#f87171" />
          </View>
          <Text className="text-white text-base font-extrabold mb-1">
            Emergency Command Center
          </Text>
          <Text className="text-slate-300 text-xs leading-relaxed">
            Severe flooding forecast at Sensor Node #12 (Nairobi River). Vector surveillance reports high mosquito breeding cluster in Mathare Sector 4. Dispatching rapid response drainage crew.
          </Text>
          <View className="flex-row items-center gap-1.5 mt-3 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg self-start">
            <Ionicons name="warning" size={14} color="#f87171" />
            <Text className="text-red-400 text-[10px] font-black uppercase">3 High Alarms Unresolved</Text>
          </View>
        </LinearGradient>

        <Text className="text-white text-lg font-bold">Interventions & Telemetry</Text>
        <View className="flex-row flex-wrap justify-between gap-3">
          <View className="w-[48%] p-4 rounded-xl border border-red-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-rose-500/10 rounded-lg">
                <Ionicons name="speedometer" size={18} color="#f87171" />
              </View>
              <Text className="text-rose-400 text-[10px] font-bold">Response Units</Text>
            </View>
            <Text className="text-white text-2xl font-bold">Team Beta</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Status: Deployed (Ward 4)</Text>
          </View>

          <View className="w-[48%] p-4 rounded-xl border border-red-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-emerald-500/10 rounded-lg">
                <Ionicons name="hardware-chip" size={18} color="#34d399" />
              </View>
              <Text className="text-emerald-400 text-[10px] font-bold">Sensor Network</Text>
            </View>
            <Text className="text-white text-2xl font-bold">24 / 26</Text>
            <Text className="text-emerald-400 text-[10px] mt-1.5 font-medium">Nodes Online (2 Off)</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold">Active Interventions Map Grid</Text>
        <View className="p-4 rounded-xl border border-red-900/20 bg-slate-900/60 flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-sm">Incident #8809: Stagnant Water Drainage</Text>
            <Text className="text-slate-400 text-xs mt-1">Mathare Sector 4 • Rapid Intervention Unit</Text>
          </View>
          <View className="bg-red-950/80 border border-red-900/40 px-3 py-1.5 rounded-xl">
            <Text className="text-red-400 text-xs font-black uppercase">ACTIVE</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold">Dispatch Control</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => {
              Toast.show({
                type: "error",
                text1: "Intervention Deployed",
                text2: "Emergency Rapid Response Unit (RIU) Team Alpha dispatched.",
              });
            }}
            className="flex-1 py-3.5 bg-red-600 rounded-xl items-center justify-center active:opacity-85 shadow-md flex-row gap-1.5"
          >
            <Ionicons name="paper-plane" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Deploy RIU Team</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Broadcast Sent",
                text2: "Critical weather warning broadcasted to all local school admins.",
              });
            }}
            className="flex-1 py-3.5 bg-slate-800 rounded-xl items-center justify-center active:opacity-85 shadow-md border border-red-950 flex-row gap-1.5"
          >
            <Ionicons name="megaphone" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Broadcast Alert</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ─── 🏡 Community Health Worker Dashboard Renderer ───
  const renderCHWDashboard = () => {
    return (
      <View className="gap-5">
        <LinearGradient
          colors={[COLORS.surface, COLORS.surfaceLight]}
          className="p-5 rounded-2xl border border-blue-900/30 shadow-2xl relative overflow-hidden"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-300 text-sm font-semibold">Local Outbreak Risk Level</Text>
            <Ionicons name="pulse" size={20} color={activeRisk.color} />
          </View>
          
          <View className="flex-row items-end gap-2.5 my-2">
            <Text className="text-white text-3xl font-extrabold" style={{ color: activeRisk.color }}>
              {activeRisk.label}
            </Text>
            <Text className="text-slate-400 text-xs font-medium mb-1.5">
              Based on environmental sensor telemetry & AI forecasting models
            </Text>
          </View>

          <View className="h-2 bg-slate-900/80 rounded-full overflow-hidden mt-3 mb-2 border border-slate-800">
            <View
              className="h-full rounded-full"
              style={{
                width: `${activeRisk.score}%`,
                backgroundColor: activeRisk.color,
              }}
            />
          </View>

          <View className="flex-row justify-between text-slate-500 text-[10px] uppercase font-bold mt-1 px-1">
            <Text className="text-slate-500">Safe</Text>
            <Text className="text-slate-500">Moderate</Text>
            <Text className="text-slate-500">High</Text>
            <Text className="text-slate-500">Critical</Text>
          </View>
        </LinearGradient>

        <Text className="text-white text-lg font-bold">Community Field Surveillance</Text>
        <View className="flex-row flex-wrap justify-between gap-3">
          <View className="w-[48%] p-4 rounded-xl border border-blue-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-blue-500/10 rounded-lg">
                <Ionicons name="home" size={18} color="#3b82f6" />
              </View>
              <Text className="text-blue-400 text-[10px] font-bold">Households</Text>
            </View>
            <Text className="text-white text-2xl font-bold">45 / 60</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Visited this week (75%)</Text>
          </View>

          <View className="w-[48%] p-4 rounded-xl border border-blue-900/20 bg-slate-900/90">
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-amber-500/10 rounded-lg">
                <Ionicons name="bug" size={18} color="#eab308" />
              </View>
              <Text className="text-amber-400 text-[10px] font-bold">Vector Hotspots</Text>
            </View>
            <Text className="text-white text-2xl font-bold">8 active</Text>
            <Text className="text-amber-400 text-[10px] mt-1.5 font-medium">Stagnant pools logged</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-white text-lg font-bold">IoT Environmental Sensors</Text>
          <Pressable onPress={handleRefreshSensors} className="active:opacity-60 flex-row items-center gap-1">
            <Ionicons name="refresh" size={16} color={COLORS.primary} />
            <Text className="text-xs font-bold" style={{ color: COLORS.primary }}>Refresh</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap justify-between gap-3">
          <View
            className="w-[48%] p-4 rounded-xl border border-blue-900/20"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-red-500/10 rounded-lg">
                <Ionicons name="thermometer" size={20} color="#ef4444" />
              </View>
              <Text className="text-red-400 text-[10px] font-bold">Heat Risk</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{sensorReadings.temperature}°C</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Extreme Heat Warn</Text>
          </View>

          <View
            className="w-[48%] p-4 rounded-xl border border-blue-900/20"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-blue-500/10 rounded-lg">
                <Ionicons name="water" size={18} color="#3b82f6" />
              </View>
              <Text className="text-blue-400 text-[10px] font-bold">Mosquitoes</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{sensorReadings.humidity}%</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Outbreak breeding high</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold">Quick Field Actions</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push("/(tab)/report")}
            className="flex-1 py-3.5 bg-blue-600 rounded-xl items-center justify-center active:opacity-85 shadow-md flex-row gap-1.5"
          >
            <Ionicons name="megaphone-sharp" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Log Water Hazard</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Toast.show({
                type: "success",
                text1: "Visit Started",
                text2: "Household visit logged. GPS telemetry synchronization active.",
              });
            }}
            className="flex-1 py-3.5 bg-slate-800 rounded-xl items-center justify-center active:opacity-85 shadow-md border border-blue-950 flex-row gap-1.5"
          >
            <Ionicons name="add-circle-sharp" size={16} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Household Check</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ─── 📱 Role Dashboard Dispatcher ───
  const renderRoleDashboard = () => {
    const role = user?.role || "community_health_worker";
    switch (role) {
      case "teacher":
        return renderTeacherDashboard();
      case "clinic_staff":
        return renderClinicStaffDashboard();
      case "emergency_officer":
        return renderEmergencyOfficerDashboard();
      case "community_health_worker":
      default:
        return renderCHWDashboard();
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Premium Glassmorphic Header ─── */}
      <LinearGradient
        colors={[COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-6 pt-12 pb-6 border-b border-blue-900/30"
      >
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Field Companion
            </Text>
            <Text className="text-white text-2xl font-bold mt-0.5">
              {user?.full_name || "Agent KHG"}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                <Text className="text-emerald-400 text-[10px] font-bold uppercase">
                  {user?.role?.replace("_", " ") || "Health Worker"}
                </Text>
              </View>
              {isDemoMode && (
                <View className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <Text className="text-amber-400 text-[10px] font-bold uppercase">
                    Demo Active
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Avatar / Unread Icon */}
          <View className="flex-row items-center gap-3">
            <Pressable className="relative p-2 bg-slate-800/40 rounded-full border border-slate-700/50">
              <Ionicons name="notifications-outline" size={22} color={COLORS.text.primary} />
              {unreadCount > 0 && (
                <View className="absolute top-1.5 right-1.5 bg-rose-500 w-4 h-4 rounded-full justify-center items-center">
                  <Text className="text-white text-[9px] font-bold">{unreadCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Sync / Connection Status Banner */}
        <View className="flex-row justify-between items-center bg-slate-900/60 border border-blue-950 px-4 py-3 rounded-xl mt-2">
          <View className="flex-row items-center gap-2">
            <View className={`w-2.5 h-2.5 rounded-full ${netStatusColor}`} />
            <Text className="text-slate-300 text-xs font-medium">{netStatusText}</Text>
          </View>
          {pendingCount > 0 ? (
            <Pressable
              onPress={handleManualSync}
              disabled={isSyncing}
              className="bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg flex-row items-center gap-1.5 active:opacity-70"
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#eab308" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={14} color="#eab308" />
                  <Text className="text-amber-400 text-xs font-bold">{pendingCount} Sync Pending</Text>
                </>
              )}
            </Pressable>
          ) : (
            <View className="flex-row items-center gap-1">
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.risk.safe} />
              <Text className="text-emerald-400 text-xs font-semibold">Synced</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* ─── Main Content ─── */}
      <View className="px-6 mt-4 gap-5">
        {renderRoleDashboard()}
      </View>
    </ScrollView>
  );
}
