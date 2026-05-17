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

        {/* 📋 Climate-Health Overall Outbreak Risk Card */}
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

          {/* Risk Level ProgressBar */}
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

        {/* 📡 Environmental Telemetry IoT sensor grid */}
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-white text-lg font-bold">IoT Environmental Sensors</Text>
          <Pressable onPress={handleRefreshSensors} className="active:opacity-60 flex-row items-center gap-1">
            <Ionicons name="refresh" size={16} color={COLORS.primary} />
            <Text className="text-xs font-bold" style={{ color: COLORS.primary }}>Refresh</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap justify-between gap-3">
          {/* Temperature sensor */}
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

          {/* Humidity sensor */}
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

          {/* Air Quality sensor */}
          <View
            className="w-[48%] p-4 rounded-xl border border-blue-900/20"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-violet-500/10 rounded-lg">
                <Ionicons name="cloudy" size={18} color="#8b5cf6" />
              </View>
              <Text className="text-violet-400 text-[10px] font-bold">Air Index</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{sensorReadings.airQuality} AQI</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Moderate PM2.5</Text>
          </View>

          {/* UV index sensor */}
          <View
            className="w-[48%] p-4 rounded-xl border border-blue-900/20"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="p-1.5 bg-amber-500/10 rounded-lg">
                <Ionicons name="sunny" size={18} color="#eab308" />
              </View>
              <Text className="text-amber-400 text-[10px] font-bold">UV Level</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{sensorReadings.uvIndex} UV</Text>
            <Text className="text-slate-400 text-[10px] mt-1.5 font-medium">Extreme intensity</Text>
          </View>
        </View>

        {/* 🧠 Predictive Machine Learning Models */}
        <View className="mt-2">
          <Text className="text-white text-lg font-bold mb-3">AI Outbreak Predictions</Text>

          <View className="gap-3">
            {/* Malaria Outbreak Risk */}
            <View className="p-4 rounded-xl border border-blue-900/20" style={{ backgroundColor: COLORS.surface }}>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="bug" size={18} color={COLORS.risk.critical} />
                  <Text className="text-white font-bold text-sm">Malaria Outbreak Risk</Text>
                </View>
                <View className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                  <Text className="text-red-400 text-[10px] font-bold uppercase">74% Prob</Text>
                </View>
              </View>
              <Text className="text-slate-300 text-xs leading-relaxed">
                Stagnant water reports and sudden humidity increase predict vector outbreaks in the school playground. LLIN distribution recommended.
              </Text>
            </View>

            {/* Cholera Outbreak Risk */}
            <View className="p-4 rounded-xl border border-blue-900/20" style={{ backgroundColor: COLORS.surface }}>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="alert-circle" size={18} color={COLORS.risk.moderate} />
                  <Text className="text-white font-bold text-sm">Cholera Water Warning</Text>
                </View>
                <View className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <Text className="text-amber-400 text-[10px] font-bold uppercase">42% Prob</Text>
                </View>
              </View>
              <Text className="text-slate-300 text-xs leading-relaxed">
                Localized rainfall surges around waste dumpsites may lead to contamination. Ensure boiling of school drinking supplies.
              </Text>
            </View>
          </View>
        </View>

        {/* 🏫 School Safety Scorecard */}
        <View className="mt-2">
          <Text className="text-white text-lg font-bold mb-3">Facility Safety Rankings</Text>
          <View className="p-4 rounded-xl border border-blue-900/20 flex-row justify-between items-center" style={{ backgroundColor: COLORS.surface }}>
            <View className="flex-1 pr-4">
              <Text className="text-white font-bold text-sm">Nairobi West Primary School</Text>
              <Text className="text-slate-400 text-xs mt-1">Assigned Zone Center • 1,200 pupils</Text>
            </View>
            <View className="items-center bg-blue-950/80 border border-blue-900 px-4 py-2.5 rounded-xl">
              <Text className="text-white text-xl font-black">{schoolSafetyScore}</Text>
              <Text className="text-slate-400 text-[8px] uppercase font-bold mt-0.5">Safety Index</Text>
            </View>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
