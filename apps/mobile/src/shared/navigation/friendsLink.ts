import { useEffect, useEffectEvent } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { friendsCodeSchema } from "@pontinho/protocol";

const FRIENDS_PATH = "amigos";
const PENDING_CODE_KEY = "pontinho.friendsCode";

export function friendsLink(code: string) {
  return Linking.createURL(`${FRIENDS_PATH}/${code}`);
}

function friendsCodeOf(url: string | null) {
  if (!url) {
    return undefined;
  }
  const [path, code] = Linking.parse(url).path?.split("/") ?? [];
  if (path !== FRIENDS_PATH) {
    return undefined;
  }
  const parsed = friendsCodeSchema.safeParse(code?.toUpperCase());
  return parsed.success ? parsed.data : undefined;
}

async function openPendingCode() {
  const code = await AsyncStorage.getItem(PENDING_CODE_KEY).catch(() => null);
  if (!code) {
    return;
  }
  await AsyncStorage.removeItem(PENDING_CODE_KEY).catch(() => undefined);
  router.navigate({ pathname: "/amigos/[codigo]", params: { codigo: code } });
}

export function useFriendsLinkAfterLogin(url: string | null, canPlay: boolean) {
  const keepCodeUntilLogin = useEffectEvent((code: string) => {
    if (!canPlay) {
      AsyncStorage.setItem(PENDING_CODE_KEY, code).catch(() => undefined);
    }
  });

  useEffect(() => {
    const code = friendsCodeOf(url);
    if (code) {
      keepCodeUntilLogin(code);
    }
  }, [url]);

  useEffect(() => {
    if (canPlay) {
      openPendingCode();
    }
  }, [canPlay]);
}
