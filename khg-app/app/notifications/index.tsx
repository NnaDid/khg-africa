import React from 'react';
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold">Profile</Text>

      <View className="mt-6 space-y-4">
        <Text>👤 Name: User</Text>
        <Text>📞 Phone: +234...</Text>
        <Text>📧 Email: user@mail.com</Text>

        <Pressable onPress={() => router.push("../kyc")}>
          <Text>🛂 KYC Verification</Text>
        </Pressable>

        <Pressable onPress={() => router.push("../security")}>
          <Text>🔐 Security</Text>
        </Pressable>
      </View>
    </View>
  );
}
