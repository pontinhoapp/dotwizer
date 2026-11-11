import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { JOIN_REFUSALS, TABLES_PATH, type TablesResponse } from "@pontinho/protocol";
import { getAccessToken } from "@/shared/api/client";
import { fetchWithTimeout } from "@/shared/api/fetchWithTimeout";
import { endSession } from "@/shared/api/sessionEnd";
import { SERVER_URL } from "@/shared/config/env";
import errors from "@/messages/errors.json";

const REFRESH_MS = 5000;

async function fetchTables(): Promise<TablesResponse> {
  const headers = { Authorization: `Bearer ${await getAccessToken()}` };
  const response = await fetchWithTimeout(`${SERVER_URL}${TABLES_PATH}`, { headers }).catch(() => {
    throw new Error(errors.unreachable);
  });
  if (response.status === JOIN_REFUSALS.invalidToken.code) {
    await endSession("expired");
  }
  if (response.status === JOIN_REFUSALS.accountDisabled.code) {
    await endSession("accountDisabled");
  }
  if (response.status === JOIN_REFUSALS.tooManyRequests.code) {
    throw new Error(errors.tooManyRequests);
  }
  if (!response.ok) {
    throw new Error(errors.generic);
  }
  return response.json();
}

export function useTables() {
  const isFocused = useIsFocused();
  const query = useQuery({ queryKey: ["tables"], queryFn: fetchTables, retry: false, refetchInterval: REFRESH_MS, subscribed: isFocused });

  return { tables: query.data?.tables, error: query.error?.message ?? "" };
}
