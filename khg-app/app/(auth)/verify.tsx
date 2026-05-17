import React from 'react';
import ZoeButton from "../../components/ui/Button";
import { SafeArea } from "../../components/ui/layout/SafeArea";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router"; 

export default function Verify() {
  return (
    <SafeArea>
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold mb-3 text-dark">Verify Account</Text>
        <Text className="text-gray-500 mb-6">
          Enter the OTP sent to your phone number
        </Text>

        <TextInput
          placeholder="Enter OTP"
          keyboardType="number-pad"
          className="border border-gray-200 rounded-xl px-4 py-4 mb-6 text-center text-lg tracking-widest"
        />

        <ZoeButton
          title="Verify"
          onPress={() => router.replace("/(tab)/home")}
        />
      </View>
    </SafeArea>
  );
}
