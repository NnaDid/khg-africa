import React from "react";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router";
import ZoeButton from "../../components/ui/Button";
import { SafeArea } from "../../components/ui/layout/SafeArea";

export default function ForgotPassword() {
  return (
    <SafeArea>
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold mb-6 text-dark">
          Forgot Password
        </Text>

        <TextInput
          placeholder="Phone number or email"
          className="border border-gray-200 rounded-xl px-4 py-4 mb-6"
        />

        <ZoeButton
          title="Send Reset Code"
          onPress={() => router.push("/(auth)/reset-password")}
        />
      </View>
    </SafeArea>
  );
}
