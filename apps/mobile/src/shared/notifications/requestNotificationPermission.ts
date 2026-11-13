import { AndroidImportance, requestPermissionsAsync, setNotificationChannelAsync } from "expo-notifications";
import settings from "@/messages/settings.json";

export async function requestNotificationPermission() {
  if (process.env.EXPO_OS === "android") {
    await setNotificationChannelAsync("default", { name: settings.notificationChannel, importance: AndroidImportance.DEFAULT });
  }
  const { granted } = await requestPermissionsAsync();
  return granted;
}
