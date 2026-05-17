import React from "react";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router";
import ZoeButton from "../../components/ui/Button";
import { SafeArea } from "../../components/ui/layout/SafeArea"; 

export default function Login() {
  return (
    <SafeArea>
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold mb-6 text-dark">Login</Text>

        <TextInput
          placeholder="Phone number"
          className="border border-gray-200 rounded-xl px-4 py-4 mb-4"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          className="border border-gray-200 rounded-xl px-4 py-4 mb-6"
        />

        <ZoeButton title="Login" onPress={() => {}} />

        <Text
          className="text-center text-primary mt-4"
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          Forgot Password?
        </Text>
      </View>
    </SafeArea>
  );
}
