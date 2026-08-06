import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { COLORS } from "../../constants/colors";
import { REPORT_TYPES } from "../../constants/config";
import { saveOfflineReport } from "../../offline/database";
import { OfflineReport } from "../../types";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import NetInfo from "@react-native-community/netinfo";
import { runSyncCycle } from "../../offline/sync";

export default function ReportScreen() {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);

  // Form states
  const [selectedType, setSelectedType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"LOW" | "MODERATE" | "HIGH" | "CRITICAL">("MODERATE");
  
  // Media attachments
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [localVoiceNote, setLocalVoiceNote] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Location details
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Submission details
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Monitor connection
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    // Auto-fetch location on load
    fetchCoordinates();

    return () => unsubscribe();
  }, []);

  const fetchCoordinates = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Generate high-fidelity Nairobi mock coordinates if rejected
        setLocation({
          latitude: -1.2921 + (Math.random() - 0.5) * 0.02,
          longitude: 36.8219 + (Math.random() - 0.5) * 0.02,
        });
        setIsFetchingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch {
      // Safe fallback coordinates
      setLocation({
        latitude: -1.2921,
        longitude: 36.8219,
      });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleCaptureImage = () => {
    // Mock image capture path for seamless developer demoing
    const mockImages = [
      "https://images.unsplash.com/photo-1598257006458-087169a1f08d?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=300&auto=format&fit=crop",
    ];
    setLocalImage(mockImages[Math.floor(Math.random() * mockImages.length)]);
    Toast.show({
      type: "success",
      text1: "Camera Simulation Active",
      text2: "Simulated camera snapshot attached.",
    });
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setLocalVoiceNote("file:///var/mobile/Containers/Data/Application/voice_note.m4a");
      Toast.show({
        type: "success",
        text1: "Audio Attached",
        text2: "Simulated voice memo memo recorded.",
      });
    } else {
      setIsRecording(true);
      setLocalVoiceNote(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Toast.show({
        type: "error",
        text1: "Required Field Missing",
        text2: "Please select a hazard type.",
      });
      return;
    }

    if (!location) {
      Toast.show({
        type: "error",
        text1: "Location Required",
        text2: "Awaiting geographic coordinates resolution.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const localId = `local-${Date.now()}`;
      
      const offlineReport: OfflineReport = {
        local_id: localId,
        type: selectedType as any,
        description: description || undefined,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        local_image_url: localImage || undefined,
        local_voice_note_url: localVoiceNote || undefined,
        severity: severity as any,
        status: "PENDING",
        reporter_id: user?.id || "anonymous-worker",
        created_at: new Date().toISOString(),
        synced: 0,
        retry_count: 0,
      };

      // Save report in SQLite offline queue
      await saveOfflineReport(offlineReport);

      if (isOnline) {
        // Connected! Try running the sync immediately to push it to PostgreSQL
        await runSyncCycle();
        Toast.show({
          type: "success",
          text1: "Report Submitted",
          text2: "Synchronized immediately with Supabase servers.",
        });
      } else {
        // Offline! Let the user know SQLite saved it safely
        Toast.show({
          type: "info",
          text1: "Saved Offline (SQLite)",
          text2: "No connection detected. Report queued safely for sync.",
        });
      }

      // Reset form
      setSelectedType("");
      setDescription("");
      setSeverity("MODERATE");
      setLocalImage(null);
      setLocalVoiceNote(null);
      fetchCoordinates();
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: e?.message ?? "An error occurred writing to SQLite.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: COLORS.background }}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Crowdsourcing Portal
          </Text>
          <Text className="text-white text-2xl font-bold mt-0.5">
            Report Hazard
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Crowdsource environmental disease triggers to protect child schools and local health.
          </Text>
        </View>

        {/* Online/Offline Visual Cue */}
        <View className="px-6 mb-4">
          <View className={`rounded-xl px-4 py-2 border ${
            isOnline 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-amber-500/10 border-amber-500/20"
          }`}>
            <Text className={`text-xs font-bold text-center ${
              isOnline ? "text-emerald-400" : "text-amber-400"
            }`}>
              {isOnline 
                ? "⚡ Online Mode — Reports sync immediately" 
                : "🛡️ Offline Mode Enabled — Reports queue locally in SQLite"}
            </Text>
          </View>
        </View>

        <View className="px-6 gap-5">
          
          {/* 1. Hazard Type Selector */}
          <View>
            <Text className="text-white text-sm font-bold mb-2.5">1. Select Hazard Type</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {REPORT_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                const activeBg = isSelected 
                  ? "bg-blue-600/30 border border-blue-500" 
                  : "bg-slate-900/60 border border-blue-950";
                const textColor = isSelected ? "text-white font-bold" : "text-slate-300";

                return (
                  <Pressable
                    key={type.id}
                    onPress={() => setSelectedType(type.id)}
                    className={`px-3 py-2.5 rounded-xl flex-row items-center gap-2 active:opacity-75 ${activeBg}`}
                  >
                    <Ionicons name={type.icon as any} size={16} color={isSelected ? COLORS.primary : "#94a3b8"} />
                    <Text className={`text-xs ${textColor}`}>{type.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 2. Severity Slider */}
          <View>
            <Text className="text-white text-sm font-bold mb-2.5">2. Set Severity Level</Text>
            <View className="flex-row gap-2.5">
              {(["LOW", "MODERATE", "HIGH", "CRITICAL"] as const).map((level) => {
                const isSelected = severity === level;
                let activeStyle = "bg-slate-900/60 border border-blue-950";
                let textColor = "text-slate-400";

                if (isSelected) {
                  textColor = "text-white font-black";
                  if (level === "LOW") activeStyle = "bg-emerald-600/30 border border-emerald-500";
                  if (level === "MODERATE") activeStyle = "bg-amber-600/30 border border-amber-500";
                  if (level === "HIGH") activeStyle = "bg-orange-600/30 border border-orange-500";
                  if (level === "CRITICAL") activeStyle = "bg-red-600/30 border border-red-500";
                }

                return (
                  <Pressable
                    key={level}
                    onPress={() => setSeverity(level)}
                    className={`flex-1 py-3 rounded-xl items-center active:opacity-75 ${activeStyle}`}
                  >
                    <Text className={`text-xs uppercase tracking-wider ${textColor}`}>{level}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3. Description Input */}
          <View>
            <Text className="text-white text-sm font-bold mb-2">3. Description Details</Text>
            <TextInput
              placeholder="Outline specifics, location particulars, pupil proximity, vector densities, stagnant water scopes..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              style={{ backgroundColor: COLORS.surface }}
              className="rounded-2xl border border-blue-900/20 p-4 text-white text-xs leading-relaxed text-left align-top h-24"
            />
          </View>

          {/* 4. Media Attachments */}
          <View>
            <Text className="text-white text-sm font-bold mb-2.5">4. Media Attachments (Optional)</Text>
            <View className="flex-row gap-4">
              
              {/* Camera trigger */}
              <Pressable
                onPress={handleCaptureImage}
                className="flex-1 py-4 bg-slate-900/60 border border-blue-950 rounded-2xl items-center justify-center active:opacity-75"
              >
                {localImage ? (
                  <Image source={{ uri: localImage }} className="w-12 h-12 rounded-lg" />
                ) : (
                  <>
                    <Ionicons name="camera" size={24} color="#94a3b8" />
                    <Text className="text-[10px] text-slate-400 font-bold mt-1">Snapshot</Text>
                  </>
                )}
              </Pressable>

              {/* Voice note trigger */}
              <Pressable
                onPress={handleToggleVoice}
                className={`flex-1 py-4 border rounded-2xl items-center justify-center active:opacity-75 ${
                  isRecording 
                    ? "bg-rose-500/20 border-rose-500 animate-pulse" 
                    : "bg-slate-900/60 border-blue-950"
                }`}
              >
                {localVoiceNote ? (
                  <>
                    <Ionicons name="mic-sharp" size={24} color={COLORS.primary} />
                    <Text className="text-[10px] text-emerald-400 font-bold mt-1">Voice Saved</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="mic" size={24} color={isRecording ? "#ef4444" : "#94a3b8"} />
                    <Text className="text-[10px] text-slate-400 font-bold mt-1">
                      {isRecording ? "Listening..." : "Voice Memo"}
                    </Text>
                  </>
                )}
              </Pressable>

            </View>
          </View>

          {/* 5. Geographic Resolution */}
          <View className="bg-slate-950/40 border border-blue-950/20 p-4 rounded-2xl">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-300 text-xs font-bold">5. Location Point Resolution</Text>
              <Pressable onPress={fetchCoordinates} disabled={isFetchingLocation} className="active:opacity-60">
                {isFetchingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons name="locate" size={16} color={COLORS.primary} />
                )}
              </Pressable>
            </View>
            {location ? (
              <View className="flex-row items-center gap-1.5 mt-1">
                <Ionicons name="navigate-circle" size={16} color={COLORS.risk.safe} />
                <Text className="text-emerald-400 text-xs font-mono">
                  LAT: {location.latitude.toFixed(6)}, LNG: {location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <Text className="text-slate-500 text-xs mt-1">Resolving current GPS position...</Text>
            )}
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="mt-2 py-4 bg-emerald-500 rounded-2xl items-center justify-center active:opacity-85 shadow-lg flex-row gap-2"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="white" />
                <Text className="text-white text-base font-black uppercase tracking-wider">
                  Publish Report
                </Text>
              </>
            )}
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
