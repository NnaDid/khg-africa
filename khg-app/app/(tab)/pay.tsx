import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Card from "../../components/ui/Card";
import Section from "../../components/ui/Section";

interface PaymentOption {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  route: string;
}

export default function PayScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const paymentOptions: PaymentOption[] = [
    {
      id: "1",
      title: "Airtime",
      description: "Buy mobile airtime",
      iconName: "phone-portrait",
      color: "bg-gray-50",
      route: "/airtime",
    },
    {
      id: "2",
      title: "Data",
      description: "Purchase data bundles",
      iconName: "push",
      color: "bg-gray-50",
      route: "/data",
    },
    {
      id: "3",
      title: "Electricity",
      description: "Pay power bills",
      iconName: "flash",
      color: "bg-gray-50",
      route: "/electricity",
    },
    {
      id: "4",
      title: "TV Subscription",
      description: "Renew cable subscriptions",
      iconName: "play",
      color: "bg-gray-50",
      route: "/tv",
    },
    {
      id: "5",
      title: "Education Pins",
      description: "Purchase exam pins",
      iconName: "school",
      color: "bg-gray-50",
      route: "/education",
    },
    {
      id: "6",
      title: "Fund Wallet",
      description: "Add money to wallet",
      iconName: "wallet",
      color: "bg-gray-50",
      route: "/wallet",
    },
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
        colors={["#1BBC9B", "#F7DD6F"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pb-8 pt-4"
      >
        <View className="px-4">
          <Text className="text-white text-sm font-medium opacity-80">
            Make Payment
          </Text>
          <Text
            className={`text-white font-bold mt-1 ${isSmallScreen ? "text-2xl" : "text-3xl"}`}
          >
            Payments
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View className="bg-white px-4 pt-6">
        <Section title="Available Services">
          <View
            className={`flex-row flex-wrap gap-3 ${isSmallScreen ? "justify-center" : "justify-between"}`}
          >
            {paymentOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => router.push(option.route as any)}
                className={`${isSmallScreen ? "w-full" : "w-[calc(50%-6px)]"}`}
              >
                <Card className={`p-4 ${option.color} border-0`}>
                  <View className="flex-row items-center gap-3">
                    <View className="bg-white/60 rounded-full p-3">
                      <Ionicons
                        name={option.iconName}
                        size={24}
                        color="#1BBC9B"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-dark text-sm">
                        {option.title}
                      </Text>
                      <Text className="text-xs text-gray-600 mt-1">
                        {option.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#1BBC9B"
                    />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* Help Section */}
        <View className="bg-gray-50 rounded-2xl p-4 mt-6 mb-4 border border-gray-200">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-4 flex-row items-center gap-3">
              <View className="bg-white rounded-full p-3">
                <Ionicons name="help-circle" size={20} color="#1BBC9B" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-dark">Need Help?</Text>
                <Text className="text-xs text-gray-600 mt-1">
                  Contact support for assistance
                </Text>
              </View>
            </View>
            <Pressable className="bg-primary rounded-full px-3 py-1 active:opacity-70">
              <Ionicons name="call" size={16} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
