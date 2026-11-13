import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { requestNotificationPermission } from "./requestNotificationPermission";

const STORAGE_KEY = "pontinho.notifications";
const QUERY_KEY = ["notifications"];

async function loadNotifications() {
  const stored = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  return stored === "on";
}

function saveNotifications(enabled: boolean) {
  queryClient.setQueryData(QUERY_KEY, enabled);
  AsyncStorage.setItem(STORAGE_KEY, enabled ? "on" : "off").catch(() => undefined);
}

async function setNotifications(enabled: boolean) {
  if (!enabled) {
    saveNotifications(false);
    return true;
  }
  const granted = await requestNotificationPermission().catch(() => false);
  saveNotifications(granted);
  return granted;
}

export function useNotifications() {
  const { data } = useQuery({ queryKey: QUERY_KEY, queryFn: loadNotifications, staleTime: Infinity });

  return { notificationsEnabled: data ?? false, setNotifications };
}
