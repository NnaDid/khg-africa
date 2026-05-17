import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Card from "../../components/ui/Card";
import Section from "../../components/ui/Section";

interface QuickAction {
  id: string;
  title: string;
  iconName: string;
  route: string;
  color: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "Airtime",
      iconName: "phone-portrait",
      route: "../pay",
      color: "bg-gray-50",
    },
    {
      id: "2",
      title: "Data",
      iconName: "push",
      route: "../pay",
      color: "bg-gray-50",
    },
    {
      id: "3",
      title: "Electricity",
      iconName: "flash",
      route: "../pay",
      color: "bg-gray-50",
    },
    {
      id: "4",
      title: "Bills",
      iconName: "document-text",
      route: "../pay",
      color: "bg-gray-50",
    },
  ];

  const recentTransactions = [
    {
      id: "1",
      name: "Airtime Purchase",
      amount: "-₦500",
      time: "Today, 2:30 PM",
    },
    { id: "2", name: "Data Top-up", amount: "-₦1,000", time: "Yesterday" },
    { id: "3", name: "Transfer In", amount: "+₦5,000", time: "2 days ago" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={["#1BBC9B", "#0d9375"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pb-8 pt-4"
      >
        <View className="px-4">
          <Text className="text-white text-sm font-medium opacity-80">
            Welcome back,
          </Text>
          <Text
            className={`text-white font-bold mt-1 ${isSmallScreen ? "text-2xl" : "text-3xl"}`}
          >
            Emeka
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content - White Background */}
      <View className="bg-white px-4">
        {/* Wallet Card - Premium Look with Fund Button */}
        <View className="-mt-6 mb-6">
          <LinearGradient
            colors={["#1BBC9B", "#F7DD6F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl overflow-hidden"
          >
            <View className="p-6">
              {/* Top Row: Balance Info and Visibility Toggle */}
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium opacity-90">
                    Wallet Balance
                  </Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Text
                      className={`text-white font-bold ${isSmallScreen ? "text-2xl" : "text-3xl"}`}
                    >
                      {isBalanceVisible ? "₦0.00" : "••••••"}
                    </Text>
                    <Pressable
                      onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                      className="bg-white/30 rounded-full p-2 active:opacity-70"
                    >
                      <Ionicons
                        name={isBalanceVisible ? "eye" : "eye-off"}
                        size={16}
                        color="white"
                      />
                    </Pressable>
                  </View>
                </View>
                <View className="bg-white/20 rounded-full px-3 py-1 items-center">
                  <Ionicons name="card" size={16} color="white" />
                </View>
              </View>

              {/* Action Buttons - Fund & Transfer */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => router.push("../wallet")}
                  className="flex-1 bg-white/30 rounded-xl py-3 items-center active:opacity-70"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="add-circle" size={18} color="white" />
                    <Text className="text-white text-sm font-semibold">
                      Fund
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => router.push("../wallet")}
                  className="flex-1 bg-white/30 rounded-xl py-3 items-center active:opacity-70"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="send" size={18} color="white" />
                    <Text className="text-white text-sm font-semibold">
                      Send
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Section */}
        <Section title="Quick Actions">
          <View
            className={`flex-row flex-wrap gap-2 ${isSmallScreen ? "justify-center" : "justify-between"}`}
          >
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => router.push(action.route as any)}
                className={`w-[calc(50%-6px)] ${isSmallScreen ? "w-[calc(50%-6px)]" : "w-[calc(25%-12px)]"}`}
              >
                <Card className={`items-center p-6 ${action.color} border-0`}>
                  <Ionicons name={action.iconName} size={28} color="#1BBC9B" />
                  <Text className="text-xs font-semibold text-dark text-center mt-3">
                    {action.title}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* Recent Transactions */}
        <Section title="Recent Transactions">
          <Card className="gap-0">
            {recentTransactions.map((transaction, index) => (
              <Pressable
                key={transaction.id}
                onPress={() => router.push("../transactions")}
                className={`flex-row justify-between items-center py-4 px-0 ${
                  index !== recentTransactions.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-dark">
                    {transaction.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {transaction.time}
                  </Text>
                </View>
                <Text
                  className={`text-sm font-bold ${
                    transaction.amount.startsWith("+")
                      ? "text-primary"
                      : "text-dark"
                  }`}
                >
                  {transaction.amount}
                </Text>
              </Pressable>
            ))}
          </Card>
          <Pressable className="mt-4">
            <Text className="text-primary text-sm font-semibold text-center flex-row items-center justify-center">
              <Ionicons name="chevron-forward" size={16} color="#1BBC9B" />
              View All Transactions
            </Text>
          </Pressable>
        </Section>

        {/* Rewards Banner */}
        <View className="bg-yellow-50 rounded-2xl p-4 mb-4 border border-yellow-200">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4 flex-row items-center gap-2">
              <Ionicons name="gift" size={24} color="#F7DD6F" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-dark">
                  Earn ₦50 Cashback!
                </Text>
                <Text className="text-xs text-gray-600 mt-1">
                  Fund wallet and get rewarded
                </Text>
              </View>
            </View>
            <Pressable className="bg-yellow-300 rounded-full px-4 py-2 active:opacity-70">
              <Text className="text-xs font-bold text-dark">Claim</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
