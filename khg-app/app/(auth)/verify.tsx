import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../services/supabase";
import { COLORS } from "../../constants/colors";
import Toast from "react-native-toast-message";

export default function VerifyOTP() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<boolean>(false);

  const handleVerifyOTP = async () => {
    if (!otp) {
      Toast.show({
        type: "error",
        text1: "Verification Required",
        text2: "Please enter the 6-digit OTP code sent to your inbox.",
      });
      return;
    }

    if (otp.length < 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "OTP code must be exactly 6 characters.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email || "",
        token: otp.trim(),
        type: "recovery",
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "OTP Verified",
        text2: "Authentication session active. Set your new password.",
      });
      router.push("/(auth)/reset-password");
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: e?.message ?? "Invalid or expired verification code.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.secondary, COLORS.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 justify-between p-6 pb-12"
    >
      {/* Background Grids */}
      <View className="absolute inset-0 flex-row flex-wrap opacity-5">
        {Array.from({ length: 48 }).map((_, i) => (
          <View key={i} className="w-[25%] h-[120px] border border-blue-900/10" />
        ))}
      </View>

      {/* Top Header */}
      <View className="pt-16 items-center">
        <Pressable onPress={() => router.back()} className="absolute left-0 top-16 p-2 bg-slate-900 rounded-full border border-blue-950">
          <Ionicons name="arrow-back" size={20} color="white" />
        </Pressable>
        <View className="w-16 h-16 bg-blue-600/15 border border-blue-500/30 rounded-2xl items-center justify-center mb-4 mt-6">
          <Ionicons name="lock-open" size={32} color={COLORS.primary} />
        </View>
        <Text className="text-white text-2xl font-black uppercase tracking-widest text-center">
          Verify Token
        </Text>
        <Text className="text-slate-400 text-xs text-center mt-1">
          Verify one-time credential ticket
        </Text>
      </View>

      {/* Form Card */}
      <View className="bg-slate-950/80 border border-blue-950/60 p-6 rounded-3xl shadow-2xl backdrop-blur-md">
        <Text className="text-slate-300 text-xs leading-relaxed mb-6">
          We have sent a verification code to <Text className="font-bold text-white">{email || "your address"}</Text>. Please enter it below to confirm security possession.
        </Text>

        {/* OTP Input */}
        <View className="mb-6">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            6-Digit OTP Token
          </Text>
          <View
            className={`flex-row items-center border rounded-xl px-4 py-3 bg-slate-900 ${
              focusedField ? "border-emerald-500" : "border-blue-950"
            }`}
          >
            <Ionicons name="finger-print-outline" size={18} color={focusedField ? COLORS.primary : "#64748b"} className="mr-3" />
            <TextInput
              placeholder="Enter OTP token"
              placeholderTextColor="#475569"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
              onFocus={() => setFocusedField(true)}
              onBlur={() => setFocusedField(false)}
              className="flex-1 text-white text-sm font-mono tracking-widest"
              style={{ paddingVertical: 2 }}
            />
          </View>
        </View>

        {/* Action Button */}
        <Pressable
          onPress={handleVerifyOTP}
          disabled={loading}
          className="py-4 bg-emerald-500 rounded-2xl items-center justify-center active:opacity-85 shadow-lg flex-row gap-2"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text className="text-white text-sm font-black uppercase tracking-widest">
                Verify Credentials
              </Text>
              <Ionicons name="checkmark-done" size={18} color="white" />
            </>
          )}
        </Pressable>
      </View>

      {/* Resend Footer Info */}
      <View className="items-center">
        <Text className="text-slate-500 text-[10px] text-center max-w-xs leading-relaxed">
          It might take up to 2 minutes for the email server to dispatch OTP codes. Check your spam and updates folders.
        </Text>
      </View>

    </LinearGradient>
  );
}
