import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAlertStore } from "../../store/alertStore";
import { COLORS, RISK_LEVELS } from "../../constants/colors";
import Toast from "react-native-toast-message";

// MOCK ALERTS (Fallback for demo mode / initial view)
const INITIAL_ALERTS = [
  {
    id: "alert-1",
    title: "CRITICAL: Flooding Warning",
    body: "Heavy precipitations have caused severe flash floods near Kibera clinic blocks. Stagnant water collection predicted. Urgent attention needed.",
    hazard_type: "flooding",
    risk_level: "critical",
    region: "Nairobi West",
    issued_at: "Today, 10:15 AM",
    acknowledged: false,
    source: "weather_api",
  },
  {
    id: "alert-2",
    title: "HIGH: Extreme Heat Warning",
    body: "Ambient temperatures expected to exceed 38.5°C today. High risk of dehydration and heat stress among school kids. Keep outdoor activities to zero.",
    hazard_type: "heat_stress",
    risk_level: "high",
    region: "Mombasa North",
    issued_at: "Yesterday, 4:30 PM",
    acknowledged: false,
    source: "ai",
  },
  {
    id: "alert-3",
    title: "MODERATE: Malaria breeding advisory",
    body: "Elevated rainfall in past 72 hrs. Vector tracking monitors a significant uptick in Anopheles mosquito counts in central school yards.",
    hazard_type: "malaria",
    risk_level: "moderate",
    region: "Kisumu Central",
    issued_at: "2 days ago",
    acknowledged: true,
    source: "sensor",
  },
  {
    id: "alert-4",
    title: "CRITICAL: Water Contamination",
    body: "Cholera outbreak markers detected in community wells near Block C. Strictly instruct all classrooms to utilize verified boiled drinking supplies.",
    hazard_type: "cholera",
    risk_level: "critical",
    region: "Nairobi East",
    issued_at: "3 days ago",
    acknowledged: false,
    source: "manual",
  },
];

export default function AlertsScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "high" | "moderate">("all");
  const [alertsList, setAlertsList] = useState(INITIAL_ALERTS);

  const handleAcknowledge = (id: string) => {
    setAlertsList(prev =>
      prev.map(item => item.id === id ? { ...item, acknowledged: true } : item)
    );
    Toast.show({
      type: "success",
      text1: "Alert Acknowledged",
      text2: "Your acknowledgement has been logged.",
    });
  };

  const filteredAlerts = alertsList.filter(item => {
    if (activeFilter === "all") return true;
    return item.risk_level === activeFilter;
  });

  const getHazardIcon = (type: string) => {
    switch (type) {
      case "flooding": return "rainy";
      case "heat_stress": return "thermometer";
      case "malaria": return "bug";
      case "cholera": return "water";
      default: return "alert-circle";
    }
  };

  const getHazardColor = (type: string) => {
    switch (type) {
      case "flooding": return "#06b6d4";
      case "heat_stress": return "#eab308";
      case "malaria": return "#ef4444";
      case "cholera": return "#3b82f6";
      default: return COLORS.primary;
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-6 pt-12 pb-4">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Early Warnings
        </Text>
        <Text className="text-white text-2xl font-bold mt-0.5">
          Climate-Health Alerts
        </Text>
        <Text className="text-slate-400 text-xs mt-1">
          Active geographic bulletins and vector-borne advisory directives.
        </Text>
      </View>

      {/* Filter Chips Row */}
      <View className="flex-row px-6 gap-2 mb-4">
        {(["all", "critical", "high", "moderate"] as const).map((filter) => {
          const isActive = activeFilter === filter;
          let activeBg = "bg-slate-800/40 border border-slate-700/50";
          let textColor = "text-slate-400";
          
          if (isActive) {
            textColor = "text-white font-bold";
            if (filter === "all") activeBg = "bg-blue-600 border border-blue-500";
            if (filter === "critical") activeBg = "bg-red-600 border border-red-500";
            if (filter === "high") activeBg = "bg-orange-600 border border-orange-500";
            if (filter === "moderate") activeBg = "bg-amber-600 border border-amber-500";
          }

          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full uppercase text-[10px] tracking-wide active:opacity-75 ${activeBg}`}
            >
              <Text className={textColor}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Alerts Grid */}
      <View className="px-6 gap-4">
        {filteredAlerts.length === 0 ? (
          <View className="items-center py-12 bg-slate-900/40 border border-slate-800/50 rounded-2xl">
            <Ionicons name="shield-checkmark" size={48} color={COLORS.risk.safe} />
            <Text className="text-white font-bold text-base mt-3">No active risks</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 px-6">
              All sensors and community logs indicate a stable climate-health landscape in your filters.
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => {
            const riskColors = RISK_LEVELS[alert.risk_level as keyof typeof RISK_LEVELS];
            const hazardColor = getHazardColor(alert.hazard_type);
            const hazardIcon = getHazardIcon(alert.hazard_type);

            return (
              <View
                key={alert.id}
                className="rounded-2xl border border-blue-900/20 overflow-hidden"
                style={{ backgroundColor: COLORS.surface }}
              >
                {/* Header Strip */}
                <View className="flex-row justify-between items-center px-4 py-3 bg-slate-950/40 border-b border-blue-950/20">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name={hazardIcon} size={18} color={hazardColor} />
                    <Text className="text-white/90 text-xs font-semibold capitalize">
                      {alert.hazard_type.replace("_", " ")} Bulletin
                    </Text>
                  </View>
                  <View
                    className="px-2 py-0.5 rounded border"
                    style={{
                      borderColor: riskColors.color + "30",
                      backgroundColor: riskColors.color + "10",
                    }}
                  >
                    <Text
                      className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color: riskColors.color }}
                    >
                      {alert.risk_level}
                    </Text>
                  </View>
                </View>

                {/* Card Body */}
                <View className="p-4">
                  <Text className="text-white font-bold text-base leading-tight mb-2">
                    {alert.title}
                  </Text>
                  <Text className="text-slate-300 text-xs leading-relaxed mb-4">
                    {alert.body}
                  </Text>

                  {/* Metadata Row */}
                  <View className="flex-row justify-between items-center pt-2 border-t border-blue-900/10">
                    <View>
                      <Text className="text-slate-400 text-[10px]">Geographic Scope</Text>
                      <Text className="text-slate-300 text-xs font-bold mt-0.5">
                        {alert.region}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-slate-400 text-[10px]">Issued Timestamp</Text>
                      <Text className="text-slate-300 text-xs font-medium mt-0.5">
                        {alert.issued_at}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="mt-4 flex-row justify-end">
                    {alert.acknowledged ? (
                      <View className="bg-slate-900/50 px-3 py-2 rounded-xl flex-row items-center gap-1">
                        <Ionicons name="checkmark-done-circle" size={16} color={COLORS.risk.safe} />
                        <Text className="text-emerald-400 text-xs font-semibold">Acknowledged</Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => handleAcknowledge(alert.id)}
                        className="bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-75"
                      >
                        <Ionicons name="eye-outline" size={16} color="#3b82f6" />
                        <Text className="text-blue-400 text-xs font-bold">Acknowledge Alert</Text>
                      </Pressable>
                    )}
                  </View>

                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
