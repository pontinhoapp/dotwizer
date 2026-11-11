import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { CARD_STYLES, type CardStyleName } from "./Card";

const STORAGE_KEY = "pontinho.cardStyle";
const QUERY_KEY = ["cardStyle"];
const DEFAULT_CARD_STYLE: CardStyleName = "jumbo";

async function loadCardStyle(): Promise<CardStyleName> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  const known = CARD_STYLES.find((cardStyle) => cardStyle === stored);
  return known ?? DEFAULT_CARD_STYLE;
}

function saveCardStyle(cardStyle: CardStyleName) {
  queryClient.setQueryData(QUERY_KEY, cardStyle);
  AsyncStorage.setItem(STORAGE_KEY, cardStyle).catch(() => undefined);
}

export function useCardStyle() {
  const { data } = useQuery({ queryKey: QUERY_KEY, queryFn: loadCardStyle, staleTime: Infinity });

  return { cardStyle: data ?? DEFAULT_CARD_STYLE, setCardStyle: saveCardStyle };
}
