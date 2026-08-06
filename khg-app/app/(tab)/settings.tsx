import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";
import { COLORS } from "../../constants/colors";
import { getPendingOfflineReports, getDb } from "../../offline/database";
import { runSyncCycle } from "../../offline/sync";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const {
    isDemoMode,
    language,
    notificationsEnabled,
    offlineMode,
    setDemoMode,
    setLanguage,
    setNotifications,
    setOfflineMode,
  } = useSettingsStore();

  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    updatePendingReportsCount();
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
        text1: "Sync Failed",
        text2: e?.message ?? "An error occurred.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const db = await getDb();
      await db.runAsync("DELETE FROM cached_alerts");
      await db.runAsync("DELETE FROM cached_schools");
      await db.runAsync("DELETE FROM cached_clinics");
      Toast.show({
        type: "success",
        text1: "Cache Purged",
        text2: "Wiped local telemetry buffers.",
      });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Purge Failed",
        text2: e?.message ?? "Could not clear cache.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: "info",
        text1: "Signed Out",
        text2: "Authentication session cleared.",
      });
      router.replace("/(auth)/login");
    } catch {
      // Safe fallback redirect
      router.replace("/(auth)/login");
    }
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "sw", label: "Kiswahili" },
    { code: "fr", label: "Français" },
    { code: "ha", label: "Hausa" },
  ];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: COLORS.background }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Control Panel
          </Text>
          <Text className="text-white text-2xl font-bold mt-0.5">
            Settings & Sync
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Manage local caching, network behaviors, and credentials.
          </Text>
        </View>

        <View className="px-6 gap-6 mt-2">
          
          {/* 1. Profile Panel */}
          <View className="p-4 rounded-2xl border border-blue-900/20" style={{ backgroundColor: COLORS.surface }}>
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-slate-900 rounded-full border border-blue-950 items-center justify-center">
                <Ionicons name="person" size={24} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">{user?.full_name || "Agent KHG"}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">{user?.email || "field-companion@khg-africa.com"}</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-blue-900/10">
              <View>
                <Text className="text-slate-500 text-[9px] uppercase font-bold">Assigned Role</Text>
                <Text className="text-white text-xs font-bold mt-0.5 capitalize">
                  {user?.role?.replace("_", " ") || "Community Health Worker"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-500 text-[9px] uppercase font-bold">Operation Hub</Text>
                <Text className="text-white text-xs font-bold mt-0.5">
                  {user?.region || "Nairobi West"}
                </Text>
              </View>
            </View>
          </View>

          {/* 2. Sync Settings */}
          <View>
            <Text className="text-white text-sm font-bold mb-3">Offline Sync Center</Text>
            <View className="rounded-2xl border border-blue-900/20 overflow-hidden" style={{ backgroundColor: COLORS.surface }}>
              
              {/* Offline Mode Toggle */}
              <View className="flex-row justify-between items-center p-4 border-b border-blue-900/10">
                <View className="flex-1 pr-4">
                  <Text className="text-white font-bold text-sm">Force Offline Mode</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    Forces SQLite queues. Skips direct REST requests.
                  </Text>
                </View>
                <Switch
                  value={offlineMode}
                  onValueChange={setOfflineMode}
                  trackColor={{ false: "#1e293b", true: "#059669" }}
                  thumbColor={offlineMode ? "#34d399" : "#64748b"}
                />
              </View>

              {/* Sync trigger card */}
              <View className="p-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-semibold text-xs">SQLite Reports Cache</Text>
                  <Text className="text-slate-400 text-[10px] mt-0.5">
                    {pendingCount} records awaiting server verification.
                  </Text>
                </View>
                
                <Pressable
                  onPress={handleManualSync}
                  disabled={isSyncing || pendingCount === 0}
                  className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-75 ${
                    pendingCount > 0 ? "bg-blue-600" : "bg-slate-900/80 border border-blue-950/60"
                  }`}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={14} color={pendingCount > 0 ? "white" : "#64748b"} />
                      <Text className={`text-xs font-bold uppercase ${pendingCount > 0 ? "text-white" : "text-slate-500"}`}>
                        Sync Now
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

            </View>
          </View>

          {/* 3. Demo Simulator Mode */}
          <View>
            <Text className="text-white text-sm font-bold mb-3">Simulation Controls</Text>
            <View className="p-4 rounded-2xl border border-blue-900/20 flex-row justify-between items-center" style={{ backgroundColor: COLORS.surface }}>
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-sm">Demo / Simulator Mode</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Bypasses core Supabase servers to display high-fidelity simulated telemetry.
                </Text>
              </View>
              <Switch
                value={isDemoMode}
                onValueChange={setDemoMode}
                trackColor={{ false: "#1e293b", true: "#d97706" }}
                thumbColor={isDemoMode ? "#fbbf24" : "#64748b"}
              />
            </View>
          </View>

          {/* 4. Language Selection */}
          <View>
            <Text className="text-white text-sm font-bold mb-3">System Language</Text>
            <View className="flex-row gap-2.5">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                const activeBg = isSelected ? "bg-blue-600/30 border border-blue-500" : "bg-slate-900/60 border border-blue-950";
                const textColor = isSelected ? "text-white font-bold" : "text-slate-400";

                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => setLanguage(lang.code)}
                    className={`flex-1 py-3 rounded-xl items-center border active:opacity-75 ${activeBg}`}
                  >
                    <Text className={`text-xs ${textColor}`}>{lang.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 5. Cache Clear & Purging */}
          <View>
            <Text className="text-white text-sm font-bold mb-3">Local Storage Cleanup</Text>
            <View className="p-4 rounded-2xl border border-blue-900/20 flex-row justify-between items-center" style={{ backgroundColor: COLORS.surface }}>
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-sm">Purge Cached Telemetry</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Clears cached alerts, schools, and clinics. Offline reports remain intact.
                </Text>
              </View>
              
              <Pressable
                onPress={handleClearCache}
                disabled={isClearing}
                className="bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 active:opacity-75"
              >
                {isClearing ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    <Text className="text-red-400 text-xs font-bold uppercase">Purge</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* 6. Credentials / Session Actions */}
          <Pressable
            onPress={handleLogout}
            className="mt-4 py-4 bg-slate-900/80 border border-red-500/20 rounded-2xl items-center justify-center active:opacity-70 flex-row gap-2"
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text className="text-red-500 text-sm font-bold uppercase tracking-wider">
              Terminate Session (Logout)
            </Text>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
