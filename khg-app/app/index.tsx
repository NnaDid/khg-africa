import React, { useEffect } from "react";
import { View, Text, Pressable, useWindowDimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { COLORS } from "../src/constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function IndexSplash() {
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.replace("/(tab)");
    } else {
      router.replace("/login");
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.secondary, COLORS.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 justify-between p-6 pb-12"
    >
      {/* Absolute background visual grids */}
      <View className="absolute inset-0 flex-row flex-wrap opacity-10">
        {Array.from({ length: 48 }).map((_, i) => (
          <View key={i} className="w-[25%] h-[120px] border border-blue-900/10" />
        ))}
      </View>

      {/* Top Header Panel */}
      <View className="pt-16 px-4 items-center">
        <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex-row items-center gap-1.5 mb-6">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            KHG Africa Mobile V2.4
          </Text>
        </View>

        <View className="w-20 h-20 bg-blue-600/15 border border-blue-500/30 rounded-3xl items-center justify-center mb-6 shadow-2xl">
          <Ionicons name="shield-checkmark-sharp" size={44} color={COLORS.primary} />
        </View>

        <Text className="text-white text-3xl font-black text-center uppercase tracking-widest leading-none">
          Kid-Health-Guard
        </Text>
        <Text className="text-emerald-400 text-[11px] font-bold tracking-widest uppercase mt-2.5">
          Climate-Health Early Warning
        </Text>
      </View>

      {/* Center Image / Visual Widget */}
      <View className="items-center px-6">
        <View className="w-full bg-slate-950/80 border border-blue-950/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="pulse" size={20} color={COLORS.risk.critical} />
              <Text className="text-white text-xs font-bold uppercase tracking-wider">Outbreak Prediction</Text>
            </View>
            <View className="bg-red-500/10 px-2 py-0.5 rounded">
              <Text className="text-red-400 text-[9px] font-bold">ACTIVE BULLETIN</Text>
            </View>
          </View>

          <Text className="text-slate-300 text-xs leading-relaxed mb-4">
            "Stagnant water reports and sudden humidity increase predict vector surges in the school playground. Distribute mosquito netting immediately."
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-slate-900 border border-blue-900/10 rounded-xl p-3 items-center">
              <Text className="text-white text-lg font-extrabold">74%</Text>
              <Text className="text-slate-500 text-[8px] uppercase font-bold mt-0.5">Malaria Prob</Text>
            </View>
            <View className="flex-1 bg-slate-900 border border-blue-900/10 rounded-xl p-3 items-center">
              <Text className="text-white text-lg font-extrabold">32.8°C</Text>
              <Text className="text-slate-500 text-[8px] uppercase font-bold mt-0.5">Temp Feed</Text>
            </View>
            <View className="flex-1 bg-slate-900 border border-blue-900/10 rounded-xl p-3 items-center">
              <Text className="text-white text-lg font-extrabold">79%</Text>
              <Text className="text-slate-500 text-[8px] uppercase font-bold mt-0.5">Humidity</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Section */}
      <View className="px-4 gap-4">
        
        <Pressable
          onPress={handleGetStarted}
          className="py-4 bg-emerald-500 rounded-2xl items-center justify-center active:opacity-85 shadow-lg flex-row gap-2"
        >
          <Text className="text-white text-base font-black uppercase tracking-widest">
            Enter Field Portal
          </Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </Pressable>

        <Text className="text-slate-500 text-[10px] text-center leading-relaxed px-4">
          By continuing, you authenticate as an authorized Field Officer, Teacher, or Health Administrator under the Kid-Health-Guard environmental surveillance treaty.
        </Text>
      </View>

    </LinearGradient>
  );
}
