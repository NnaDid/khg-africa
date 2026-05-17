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

interface MenuItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  route: string;
}

export default function MoreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const accountMenuItems: MenuItem[] = [
    {
      id: "1",
      title: "Wallet",
      description: "Manage your wallet",
      iconName: "wallet",
      route: "../wallet",
    },
    {
      id: "2",
      title: "Transactions",
      description: "View transaction history",
      iconName: "swap-horizontal",
      route: "../transactions",
    },
    {
      id: "3",
      title: "Referrals",
      description: "Earn rewards from referrals",
      iconName: "people",
      route: "../referrals",
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: "4",
      title: "Profile",
      description: "Update your profile",
      iconName: "person",
      route: "../profile",
    },
    {
      id: "5",
      title: "Settings",
      description: "App preferences",
      iconName: "settings",
      route: "../settings",
    },
    {
      id: "6",
      title: "Security",
      description: "Manage security settings",
      iconName: "lock-closed",
      route: "../security",
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      id: "7",
      title: "Notifications",
      description: "Manage notifications",
      iconName: "notifications",
      route: "../notifications",
    },
    {
      id: "8",
      title: "Support",
      description: "Get help and support",
      iconName: "help-circle",
      route: "../support",
    },
  ];

  const renderMenuItems = (items: MenuItem[]) => (
    <View className="gap-2">
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(item.route as any)}>
          <Card className="p-4 bg-gray-50 border-0">
            <View className="flex-row items-center gap-3">
              <View className="bg-primary/10 rounded-full p-3">
                <Ionicons name={item.iconName} size={20} color="#1BBC9B" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-dark text-sm">
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#1BBC9B" />
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );

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
            Account & Settings
          </Text>
          <Text
            className={`text-white font-bold mt-1 ${isSmallScreen ? "text-2xl" : "text-3xl"}`}
          >
            More
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
            <LinearGradient
              colors={["#F7DD6F", "#1BBC9B"]}
              className="flex-1 px-4 pt-6"
            >   
            {/* <View className="bg-white ">  */}

                {/* Account Section */}
                <Section title="Account & Wallet">
                  {renderMenuItems(accountMenuItems)}
                </Section>

                {/* Settings Section */}
                <Section title="Settings & Security">
                  {renderMenuItems(settingsMenuItems)}
                </Section>

                {/* Support Section */}
                <Section title="Help & Support">
                  {renderMenuItems(supportMenuItems)}
                </Section>

                {/* Version Info */}
                <View className="bg-gray-50 rounded-2xl p-4 mt-6 mb-4 border border-gray-200 items-center">
                  <Text className="text-xs text-gray-600">App Version</Text>
                  <Text className="text-sm font-semibold text-dark mt-1">v1.0.0</Text>
                </View>
              {/* </View> */}
            </LinearGradient>

    </ScrollView>
  );
}
