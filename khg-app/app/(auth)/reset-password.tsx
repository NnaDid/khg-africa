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

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"pass" | "confirm" | null>(null);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Fields Required",
        text2: "Please fill in all security fields.",
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Security passwords must be at least 8 characters long.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mismatch Error",
        text2: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Password Restored",
        text2: "Your credentials have been securely updated.",
      });
      // Redirect to main portal since the session is already established
      router.replace("/(tab)");
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Restoration Failed",
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
      {/* Background Grids */}
      <View className="absolute inset-0 flex-row flex-wrap opacity-5">
        {Array.from({ length: 48 }).map((_, i) => (
          <View key={i} className="w-[25%] h-[120px] border border-blue-900/10" />
        ))}
      </View>

      {/* Top Header */}
      <View className="pt-16 items-center">
        <View className="w-16 h-16 bg-blue-600/15 border border-blue-500/30 rounded-2xl items-center justify-center mb-4 mt-6">
          <Ionicons name="shield" size={32} color={COLORS.primary} />
        </View>
        <Text className="text-white text-2xl font-black uppercase tracking-widest text-center">
          New Credentials
        </Text>
        <Text className="text-slate-400 text-xs text-center mt-1">
          Set secondary access password
        </Text>
      </View>

      {/* Form Card */}
      <View className="bg-slate-950/80 border border-blue-950/60 p-6 rounded-3xl shadow-2xl backdrop-blur-md">
        <Text className="text-slate-300 text-xs leading-relaxed mb-6">
          Authorized token approved. Enter a new high-security password below. Avoid using common phrases.
        </Text>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            New Password
          </Text>
          <View
            className={`flex-row items-center border rounded-xl px-4 py-3 bg-slate-900 ${
              focusedField === "pass" ? "border-emerald-500" : "border-blue-950"
            }`}
          >
            <Ionicons name="lock-closed-outline" size={18} color={focusedField === "pass" ? COLORS.primary : "#64748b"} className="mr-3" />
            <TextInput
              placeholder="Min 8 characters"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setFocusedField("pass")}
              onBlur={() => setFocusedField(null)}
              className="flex-1 text-white text-sm"
              style={{ paddingVertical: 2 }}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} className="pl-2">
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#64748b"
              />
            </Pressable>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            Confirm Password
          </Text>
          <View
            className={`flex-row items-center border rounded-xl px-4 py-3 bg-slate-900 ${
              focusedField === "confirm" ? "border-emerald-500" : "border-blue-950"
            }`}
          >
            <Ionicons name="lock-closed-outline" size={18} color={focusedField === "confirm" ? COLORS.primary : "#64748b"} className="mr-3" />
            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor="#475569"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              className="flex-1 text-white text-sm"
              style={{ paddingVertical: 2 }}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleResetPassword}
          disabled={loading}
          className="py-4 bg-emerald-500 rounded-2xl items-center justify-center active:opacity-85 shadow-lg flex-row gap-2"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text className="text-white text-sm font-black uppercase tracking-widest">
                Save & Continue
              </Text>
              <Ionicons name="save" size={18} color="white" />
            </>
          )}
        </Pressable>
      </View>

      {/* Resend Footer Info */}
      <View className="items-center">
        <Text className="text-slate-500 text-[10px] text-center max-w-xs leading-relaxed">
          Operational field encryption keys are generated locally. Never share your password credentials with third parties.
        </Text>
      </View>

    </LinearGradient>
  );
}
