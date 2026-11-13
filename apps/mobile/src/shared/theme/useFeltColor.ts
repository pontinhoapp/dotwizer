import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { felts, type FeltName } from "./colors";

const STORAGE_KEY = "pontinho.feltColor";
const QUERY_KEY = ["feltColor"];
const DEFAULT_FELT: FeltName = "green";

async function loadFeltColor(): Promise<FeltName> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  const known = (Object.keys(felts) as FeltName[]).find((felt) => felt === stored);
  return known ?? DEFAULT_FELT;
}

function saveFeltColor(felt: FeltName) {
  queryClient.setQueryData(QUERY_KEY, felt);
  AsyncStorage.setItem(STORAGE_KEY, felt).catch(() => undefined);
}

export function useFeltColor() {
  const { data } = useQuery({ queryKey: QUERY_KEY, queryFn: loadFeltColor, staleTime: Infinity });

  return { felt: data ?? DEFAULT_FELT, setFelt: saveFeltColor };
}
