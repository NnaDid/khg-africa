import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import ZoeButton from "../../components/ui/Button";
import { SafeArea } from "../../components/ui/layout/SafeArea";

export default function Onboarding() {
  return (
    <SafeArea>
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-dark mb-3">
          Welcome to Zoetopy
        </Text>
        <Text className="text-gray-500 mb-10">
          Pay bills, buy airtime, data and manage your wallet in one app.
        </Text>

        <ZoeButton
          title="Create Account"
          onPress={() => router.push("/(auth)/register")}
        />
        <View className="h-4" />
        <ZoeButton title="Login" onPress={() => router.push("/(auth)/login")} />
      </View>
    </SafeArea>
  );
}
