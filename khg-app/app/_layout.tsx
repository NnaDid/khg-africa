import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import "../global.css";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import { wsClient } from "../websocket/wsClient";
import { LogBox } from "react-native";

// Ignore third-party SafeAreaView deprecation warning in Metro dev console
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const { setAuthenticated, setUserProfile } = useAuthStore();

  useEffect(() => {
    // Restore session from Supabase persisted AsyncStorage token
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile from Supabase
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setUserProfile({
          id: session.user.id,
          email: session.user.email || "",
          full_name: profile?.full_name || "Field Officer",
          role: profile?.role || "community_health_worker",
          region: profile?.region || "Nairobi West",
        });
        setAuthenticated(true);

        // Connect WebSocket for realtime sensor + alert streams
        wsClient.connect();
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setAuthenticated(true);
          // Connect WebSocket on sign in
          wsClient.connect();
        } else if (event === "SIGNED_OUT") {
          setAuthenticated(false);
          setUserProfile(null);
          // Disconnect WebSocket on sign out
          wsClient.disconnect();
          router.replace("/(auth)/login");
        } else if (event === "TOKEN_REFRESHED") {
          // Session silently refreshed — reconnect WS if needed
          if (!wsClient.isConnected) {
            wsClient.connect();
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      wsClient.disconnect();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0a1128" translucent={false} />
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tab)" />
          </Stack>
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
