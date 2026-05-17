import React from "react";
import { View, Text } from "react-native";

export default function KYCScreen() {
  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold">KYC Verification</Text>

      <View className="mt-6 space-y-3">
        <Text>📄 Upload ID</Text>
        <Text>🤳 Face Verification</Text>
        <Text>🏠 Address Verification</Text>
      </View>
    </View>
  );
}
