import { SafeAreaView } from "react-native-safe-area-context";
import { ReactNode } from "react";
import React from "react";

export function SafeArea({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {children}
    </SafeAreaView>
  );
}