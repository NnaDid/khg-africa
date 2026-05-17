import React from "react";
import { View, Text, Pressable } from "react-native";

export default function WalletScreen() {
  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold">Wallet</Text>

      <View className="bg-primary rounded-2xl p-5 mt-6">
        <Text className="text-white text-sm">Available Balance</Text>
        <Text className="text-white text-3xl font-bold mt-2">₦0.00</Text>
      </View>

      <View className="mt-6 space-y-4">
        <Pressable className="p-4 bg-gray-100 rounded-xl">
          <Text>➕ Fund Wallet</Text>
        </Pressable>

        <Pressable className="p-4 bg-gray-100 rounded-xl">
          <Text>⬇ Withdraw</Text>
        </Pressable>

        <Pressable className="p-4 bg-gray-100 rounded-xl">
          <Text>📜 Wallet History</Text>
        </Pressable>
      </View>
    </View>
  );
}
