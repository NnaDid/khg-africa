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

interface RewardProgram {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  badge?: string;
  route: string;
}

export default function RewardsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const rewardPrograms: RewardProgram[] = [
    {
      id: "1",
      title: "Daily Spin",
      description: "Spin daily and win rewards",
      iconName: "gift",
      color: "bg-gray-50",
      badge: "Free Spin Today",
      route: "/rewards/spin",
    },
    {
      id: "2",
      title: "Cashback Lottery",
      description: "Get cashback on every transaction",
      iconName: "cash",
      color: "bg-gray-50",
      route: "/rewards/cashback",
    },
    {
      id: "3",
      title: "Referral Program",
      description: "Earn ₦500 for each referral",
      iconName: "people",
      color: "bg-gray-50",
      badge: "Earn Extra",
      route: "/rewards/referral",
    },
    {
      id: "4",
      title: "Monthly Mega Awards",
      description: "Win prizes every month",
      iconName: "star",
      color: "bg-gray-50",
      route: "/rewards/mega-awards",
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
            Exclusive Rewards
          </Text>
          <Text
            className={`text-white font-bold mt-1 ${isSmallScreen ? "text-2xl" : "text-3xl"}`}
          >
            Rewards
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View className="bg-white px-4 pt-4">
        {/* Points Card */}
        <View className="-mt-2 mb-6">
          <LinearGradient
            colors={[ "#F7DD6F", "#1BBC9B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl overflow-hidden"
          >
            <View className="p-6">
              <Text className="text-white text-sm font-medium opacity-90">
                Reward Points
              </Text>
              <View className="flex-row justify-between items-end mt-3">
                <View>
                  <Text
                    className={`text-white font-bold ${isSmallScreen ? "text-2xl" : "text-3xl"}`}
                  >
                    2,450
                  </Text>
                  <Text className="text-white/70 text-xs mt-2">
                    Next reward at 3,000 points
                  </Text>
                </View>
                <View className="bg-white/20 px-3 py-2 rounded-full">
                  <Text className="text-white text-xs font-semibold">81%</Text>
                </View>
              </View>
              <View className="bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
                <View className="bg-white h-full w-4/5" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Reward Programs Section */}
        <Section title="Reward Programs">
          <View className="gap-3">
            {rewardPrograms.map((program) => (
              <Pressable
                key={program.id}
                onPress={() => router.push(program.route as any)}
              >
                <Card className={`p-4 ${program.color} border-0`}>
                  <View className="flex-row items-center gap-3">
                    <View className="bg-white/60 rounded-full p-3">
                      <Ionicons
                        name={program.iconName}
                        size={24}
                        color="#1BBC9B"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-semibold text-dark text-sm">
                          {program.title}
                        </Text>
                        {program.badge && (
                          <View className="bg-yellow-100 rounded-full px-2 py-1">
                            <Text className="text-yellow-700 text-xs font-bold">
                              {program.badge}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-600 mt-1">
                        {program.description}
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

        {/* Leaderboard Section */}
        <Section title="Leaderboard">
          <Card className="gap-0">
            {[
              { position: 1, name: "Ahmed K.", points: "8,900", icon: "medal" },
              {
                position: 2,
                name: "Chioma O.",
                points: "7,450",
                icon: "medal",
              },
              { position: 3, name: "David M.", points: "6,200", icon: "medal" },
            ].map((leader, index) => (
              <View
                key={leader.position}
                className={`flex-row justify-between items-center py-4 px-0 ${
                  index !== 2 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="bg-primary rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name={leader.icon} size={16} color="white" />
                  </View>
                  <Text className="text-sm font-semibold text-dark">
                    {leader.name}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-primary">
                  {leader.points}
                </Text>
              </View>
            ))}
          </Card>
        </Section>

        {/* Info Banner */}
        <View className="bg-gray-50 rounded-2xl p-4 mt-6 mb-4 border border-gray-200">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={20} color="#1BBC9B" />
            <View className="flex-1">
              <Text className="text-sm font-bold text-dark">
                Points Never Expire
              </Text>
              <Text className="text-xs text-gray-600 mt-1">
                Keep your rewards points and redeem them anytime
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
