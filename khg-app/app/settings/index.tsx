import React from "react";
import { View, Text } from "react-native";

export default function SupportScreen() {
  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold">Support</Text>

      <View className="mt-6 space-y-3">
        <Text>📞 Call support</Text>
        <Text>💬 Live chat</Text>
        <Text>📧 Email support</Text>
        <Text>📄 Help Center</Text>
      </View>
    </View>
  );
}
