import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 4 : 10;
  const barHeight = 64 + (insets.bottom > 0 ? insets.bottom : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#081020",
          borderTopColor: "#111f38",
          borderTopWidth: 1.5,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          height: barHeight,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
          marginTop: 2,
        },
      }}
    >
      {/* Home / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps-outline" size={size - 2} color={color} />
          ),
        }}
      />

      {/* Climate-Health Alerts */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size - 2} color={color} />
          ),
        }}
      />

      {/* Crowdsourced Reporter */}
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone-outline" size={size - 2} color={color} />
          ),
        }}
      />

      {/* Risk Map */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size - 2} color={color} />
          ),
        }}
      />

      {/* Settings & Sync */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
