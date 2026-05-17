import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import ZoeButton from "../components/ui/Button";
import Card from "../components/ui/Card";
import Header from "../components/ui/Header";
import { SafeArea } from "../components/ui/layout/SafeArea";
import Section from "../components/ui/Section";

export default function Index() {
  return (
    <SafeArea>
      <LinearGradient
        colors={["#F7DD6F", "#1BBC9B"]}
        className="flex-1 justify-between p-6"
      >
        <Header title="ZOETOP" subtitle="Fast payments, smart life" />

        <View className="px-5">
          <Section title="Get Started">
            <Card>
              <ZoeButton
                title="Login"
                onPress={() => router.push("../(tab)")}
              />
              <ZoeButton
                title="Register"
                variant="secondary"
                className="mt-3"
                onPress={() => router.push("../(auth)/register")}
              />
            </Card>
          </Section>
        </View>
      </LinearGradient>
    </SafeArea>
  );
}
