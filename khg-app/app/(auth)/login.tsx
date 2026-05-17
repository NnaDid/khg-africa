import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { COLORS } from "../../constants/colors";
import Toast from "react-native-toast-message";

export default function Login() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Credentials",
        text2: "Please fill in both email and password fields.",
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

    const response = await login(email.trim(), password);

    if (response?.error) {
      Toast.show({
        type: "error",
        text1: "Authentication Failed",
        text2: response.error,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Welcome Back",
        text2: "Signed in successfully to the field dashboard.",
      });
      router.replace("/(tab)");
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.secondary, COLORS.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 justify-between p-6 pb-12"
    >
      {/* Background Visual Grids */}
      <View className="absolute inset-0 flex-row flex-wrap opacity-5">
        {Array.from({ length: 48 }).map((_, i) => (
          <View key={i} className="w-[25%] h-[120px] border border-blue-900/10" />
        ))}
      </View>

      {/* Top Header section */}
      <View className="pt-16 items-center">
        <View className="w-16 h-16 bg-blue-600/15 border border-blue-500/30 rounded-2xl items-center justify-center mb-4">
          <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
        </View>
        <Text className="text-white text-2xl font-black uppercase tracking-widest text-center">
          Field Officer Login
        </Text>
        <Text className="text-slate-400 text-xs text-center mt-1">
          Kid-Health-Guard Early Warning System
        </Text>
      </View>

      {/* Form Panel Container */}
      <View className="bg-slate-950/80 border border-blue-950/60 p-6 rounded-3xl shadow-2xl backdrop-blur-md">
        
        {/* Email input field */}
        <View className="mb-4">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            Email Address
          </Text>
          <View
            className={`flex-row items-center border rounded-xl px-4 py-3 bg-slate-900 ${
              focusedField === "email" ? "border-emerald-500" : "border-blue-950"
            }`}
          >
            <Ionicons name="mail-outline" size={18} color={focusedField === "email" ? COLORS.primary : "#64748b"} className="mr-3" />
            <TextInput
              placeholder="Enter field officer email"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className="flex-1 text-white text-sm"
              style={{ paddingVertical: 2 }}
            />
          </View>
        </View>

        {/* Password input field */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider">
              Security Password
            </Text>
            <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
              <Text className="text-emerald-400 text-xs font-bold">Forgot?</Text>
            </Pressable>
          </View>
          <View
            className={`flex-row items-center border rounded-xl px-4 py-3 bg-slate-900 ${
              focusedField === "password" ? "border-emerald-500" : "border-blue-950"
            }`}
          >
            <Ionicons name="lock-closed-outline" size={18} color={focusedField === "password" ? COLORS.primary : "#64748b"} className="mr-3" />
            <TextInput
              placeholder="Enter security password"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setFocusedField("password")}
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

        {/* Action Trigger Button */}
        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          className="py-4 bg-emerald-500 rounded-2xl items-center justify-center active:opacity-85 shadow-lg flex-row gap-2"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text className="text-white text-sm font-black uppercase tracking-widest">
                Authorize Field Portal
              </Text>
              <Ionicons name="log-in" size={18} color="white" />
            </>
          )}
        </Pressable>
      </View>

      {/* Footer System Disclaimer */}
      <View className="items-center">
        <Text className="text-slate-500 text-[10px] text-center max-w-xs leading-relaxed">
          Operational Field survelience accounts must be provisioned through our governmental portal. No public signups permitted.
        </Text>
      </View>

    </LinearGradient>
  );
}
