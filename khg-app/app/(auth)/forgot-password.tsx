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
import { router } from "expo-router";
import { supabase } from "../../services/supabase";
import { COLORS } from "../../constants/colors";
import Toast from "react-native-toast-message";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<boolean>(false);

  const handleRequestOTP = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your registered email address.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Recovery Email Sent",
        text2: "A one-time verification code has been dispatched.",
      });
      // Navigate to OTP verification passing the email context
      router.push({
        pathname: "/(auth)/verify",
        params: { email: email.trim() }
      });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: e?.message ?? "An error occurred, please try again.",
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
      {/* Absolute background grids */}
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
          <Ionicons name="key" size={32} color={COLORS.primary} />
        </View>
        <Text className="text-white text-2xl font-black uppercase tracking-widest text-center">
          Recover Session
        </Text>
        <Text className="text-slate-400 text-xs text-center mt-1">
          Request email OTP recovery sequence
        </Text>
      </View>

      {/* Form Card */}
      <View className="bg-slate-950/80 border border-blue-950/60 p-6 rounded-3xl shadow-2xl backdrop-blur-md">
        <Text className="text-slate-300 text-xs leading-relaxed mb-6">
          Enter your registered professional email below. If authorized on our database, we will send an OTP token to initiate verification.
        </Text>

        {/* Email Input */}
        <View className="mb-6">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            Email Address
          </Text>
          <View
            className={`flex-row items-center border rounded-xl px-4 py-3 bg-slate-900 ${
              focusedField ? "border-emerald-500" : "border-blue-950"
            }`}
          >
            <Ionicons name="mail-outline" size={18} color={focusedField ? COLORS.primary : "#64748b"} className="mr-3" />
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField(true)}
              onBlur={() => setFocusedField(false)}
              className="flex-1 text-white text-sm"
              style={{ paddingVertical: 2 }}
            />
          </View>
        </View>

        {/* Request Button */}
        <Pressable
          onPress={handleRequestOTP}
          disabled={loading}
          className="py-4 bg-emerald-500 rounded-2xl items-center justify-center active:opacity-85 shadow-lg flex-row gap-2"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text className="text-white text-sm font-black uppercase tracking-widest">
                Request OTP Code
              </Text>
              <Ionicons name="mail-unread" size={18} color="white" />
            </>
          )}
        </Pressable>
      </View>

      {/* Footer System Disclaimer */}
      <View className="items-center">
        <Text className="text-slate-500 text-[10px] text-center max-w-xs leading-relaxed">
          If you have lost access to your primary email address, please contact your regional School Admin or NGO Coordinator to restore credentials.
        </Text>
      </View>

    </LinearGradient>
  );
}
