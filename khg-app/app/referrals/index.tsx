import React from "react";
import { View, Text } from "react-native";

export default function ReferralsScreen() {
  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold">Referrals</Text>

      <View className="mt-6 space-y-3">
        <Text>Invite friends</Text>
        <Text>Referral code: ZOETOP123</Text>
        <Text>Leaderboard rank: #0</Text>
      </View>
    </View>
  );
}
