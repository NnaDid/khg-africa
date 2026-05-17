import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "../services/supabase";

// Set default notifications behavior when the app is active
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldConfigureBadge: true,
  }),
});

/**
 * Registers device for push notifications and uploads the Expo push token
 * to the Supabase public.profiles table under the current user's profile.
 */
export async function registerForPushNotificationsAsync(userId: string): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1BBC9B",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;

    // Upload the push token to Supabase profiles to enable target push broadcasts
    await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", userId);

  } catch {
    // Graceful fallback if push registers fail in developer simulator modes
  }

  return token;
}
