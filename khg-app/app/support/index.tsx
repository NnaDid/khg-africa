import React from "react";
import { View, Text } from "react-native";

export default function SecurityScreen() {
  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold">Security</Text>

      <View className="mt-6 space-y-3">
        <Text>🔑 Change PIN</Text>
        <Text>📱 Device Management</Text>
        <Text>🧠 Login History</Text>
        <Text>🚨 Fraud Protection</Text>
      </View>
    </View>
  );
}
