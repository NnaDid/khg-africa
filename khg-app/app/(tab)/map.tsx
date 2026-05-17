import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RISK_LEVELS } from "../../constants/colors";
import Toast from "react-native-toast-message";

// Simulated Geospatial Map Markers
const MAP_MARKERS = [
  {
    id: "m-1",
    name: "Kibera Zone School",
    type: "school",
    latitude: -1.2941,
    longitude: 36.8119,
    safety_score: 82,
    risk_level: "safe",
    details: "1,400 pupils. Clean rainwater catchment active.",
  },
  {
    id: "m-2",
    name: "Nairobi Central Clinic",
    type: "clinic",
    latitude: -1.2891,
    longitude: 36.8249,
    safety_score: 55,
    risk_level: "high",
    details: "Surge alert! Significant surge in pediatric fever cases.",
  },
  {
    id: "m-3",
    name: "Vector breeding hotspot",
    type: "hazard",
    latitude: -1.3011,
    longitude: 36.8189,
    safety_score: 24,
    risk_level: "critical",
    details: "Stagnant water swamp near residential blocks. High mosquito count.",
  },
  {
    id: "m-4",
    name: "Dandora School Center",
    type: "school",
    latitude: -1.2751,
    longitude: 36.8399,
    safety_score: 72,
    risk_level: "moderate",
    details: "980 students. Ambient air sensors detect mild PM2.5 rise.",
  },
];

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const [selectedMarker, setSelectedMarker] = useState<typeof MAP_MARKERS[number] | null>(MAP_MARKERS[0]);
  const [visibleType, setVisibleType] = useState<"all" | "school" | "clinic" | "hazard">("all");

  const filteredMarkers = MAP_MARKERS.filter(m => {
    if (visibleType === "all") return true;
    return m.type === visibleType;
  });

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "school": return "school";
      case "clinic": return "medkit";
      case "hazard": return "warning";
      default: return "pin";
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "school": return COLORS.primary;
      case "clinic": return "#3b82f6";
      case "hazard": return COLORS.risk.critical;
      default: return "#ffffff";
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      
      {/* Absolute top dashboard overlay */}
      <View className="absolute top-12 left-6 right-6 z-10 gap-3">
        {/* Title panel */}
        <View className="bg-slate-950/80 border border-blue-950/60 p-4 rounded-2xl flex-row justify-between items-center shadow-2xl backdrop-blur-md">
          <View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Geo-Intelligence
            </Text>
            <Text className="text-white text-lg font-bold">
              Neon Risk Map
            </Text>
          </View>
          <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <Text className="text-emerald-400 text-[10px] font-bold uppercase">GPS Resolved</Text>
          </View>
        </View>

        {/* Toggle selectors */}
        <View className="flex-row gap-2">
          {(["all", "school", "clinic", "hazard"] as const).map((type) => {
            const isActive = visibleType === type;
            let activeBg = isActive ? "bg-blue-600 border-blue-500" : "bg-slate-950/80 border-blue-950/60";
            let textColor = isActive ? "text-white font-bold" : "text-slate-400";
            
            return (
              <Pressable
                key={type}
                onPress={() => setVisibleType(type)}
                className={`px-3 py-1.5 rounded-full border uppercase text-[9px] tracking-wide active:opacity-75 ${activeBg}`}
              >
                <Text className={textColor}>{type}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 🗺️ Stunning Cyber-Sleek Simulated Grid Canvas Map */}
      <View className="flex-1 justify-center items-center relative overflow-hidden bg-slate-950">
        
        {/* Map grid lines simulation */}
        <View className="absolute inset-0 flex-row flex-wrap opacity-25">
          {Array.from({ length: 120 }).map((_, i) => (
            <View key={i} className="w-[12%] h-[60px] border border-blue-900/10" />
          ))}
        </View>

        {/* Topography concentric radar simulation circles */}
        <View className="absolute w-[360px] h-[360px] rounded-full border border-blue-900/5 opacity-40" />
        <View className="absolute w-[500px] h-[500px] rounded-full border border-blue-900/5 opacity-20" />
        <View className="absolute w-[700px] h-[700px] rounded-full border border-blue-900/5 opacity-10" />

        {/* Dynamic Interactive Rendered Pins */}
        {filteredMarkers.map((marker) => {
          const isSelected = selectedMarker?.id === marker.id;
          const pinColor = getMarkerColor(marker.type);
          const pinIcon = getMarkerIcon(marker.type);

          // Calculate mockup relative positions based on coordinate mappings
          const topOffset = 300 + (marker.latitude - (-1.2881)) * 4000;
          const leftOffset = 180 + (marker.longitude - 36.8219) * 4000;

          return (
            <Pressable
              key={marker.id}
              onPress={() => setSelectedMarker(marker)}
              className="absolute items-center justify-center"
              style={{
                top: topOffset,
                left: leftOffset,
              }}
            >
              {/* Outer pulsing ring */}
              <View
                className="w-10 h-10 rounded-full absolute opacity-20 items-center justify-center"
                style={{
                  backgroundColor: pinColor,
                  transform: [{ scale: isSelected ? 1.5 : 1 }],
                }}
              />
              {/* Main Pin Container */}
              <View
                className={`w-7 h-7 rounded-full border items-center justify-center shadow-lg ${
                  isSelected ? "scale-125 border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: pinColor }}
              >
                <Ionicons name={pinIcon as any} size={14} color="white" />
              </View>
            </Pressable>
          );
        })}

        {/* Active GPS Current User Radar Pin */}
        <View className="absolute top-[280px] left-[170px] items-center justify-center">
          <View className="w-12 h-12 bg-sky-500/20 rounded-full absolute border border-sky-400/30" />
          <View className="w-3 h-3 bg-sky-400 rounded-full border border-white" />
        </View>

        {/* Compass indicator */}
        <View className="absolute right-6 bottom-44 bg-slate-950/80 border border-blue-950/60 p-2.5 rounded-full shadow-lg">
          <Ionicons name="compass" size={24} color={COLORS.primary} />
        </View>

      </View>

      {/* 🪟 Interactive Overlay Info Drawer at bottom */}
      {selectedMarker && (
        <View className="absolute bottom-28 left-6 right-6 bg-slate-950/90 border border-blue-950/60 p-5 rounded-2xl shadow-2xl backdrop-blur-md">
          
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                {selectedMarker.type.replace("_", " ")} Location
              </Text>
              <Text className="text-white text-lg font-bold mt-0.5">
                {selectedMarker.name}
              </Text>
            </View>
            
            <View className="bg-slate-900 border border-blue-900/40 px-3 py-1.5 rounded-xl items-center">
              <Text className="text-white text-base font-extrabold" style={{ color: RISK_LEVELS[selectedMarker.risk_level as keyof typeof RISK_LEVELS].color }}>
                {selectedMarker.safety_score}
              </Text>
              <Text className="text-slate-500 text-[7px] uppercase font-bold mt-0.5">Index</Text>
            </View>
          </View>

          <Text className="text-slate-300 text-xs leading-relaxed mb-4">
            {selectedMarker.details}
          </Text>

          {/* Coordinate specifics */}
          <View className="flex-row justify-between items-center pt-3 border-t border-slate-900">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="location-outline" size={14} color="#94a3b8" />
              <Text className="text-slate-400 text-[10px] font-mono">
                {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}
              </Text>
            </View>
            
            <Pressable
              onPress={() => {
                Toast.show({
                  type: "success",
                  text1: "Intervention Dispatched",
                  text2: `Emergency response unit triggered to ${selectedMarker.name}.`,
                });
              }}
              className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-75"
            >
              <Ionicons name="navigate" size={12} color="white" />
              <Text className="text-white text-xs font-bold uppercase">Dispatch</Text>
            </Pressable>
          </View>

        </View>
      )}

    </View>
  );
}
