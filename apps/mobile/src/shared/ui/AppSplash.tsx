import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import home from "@/messages/home.json";
import { AnimatedLogo, Logo } from "./Logo";

const LOGO_SIZE = 40;
const LOGO_ANIMATION_MS = 1000;
const FADE_OUT_MS = 220;
const SLOW_LOADING_MS = 3000;

const FADE_OUT = {
  animationName: { from: { opacity: 1 }, to: { opacity: 0 } },
  animationDuration: `${FADE_OUT_MS}ms`,
  animationFillMode: "forwards",
} as const;

type Props = { fontsReady: boolean; appReady: boolean; onFinished: () => void };

export function AppSplash({ fontsReady, appReady, onFinished }: Props) {
  const reduceMotion = useReducedMotion();
  const [logoShown, setLogoShown] = useState(false);
  const [slow, setSlow] = useState(false);
  const leaving = appReady && logoShown;

  useEffect(() => {
    if (!fontsReady) {
      return;
    }
    const timer = setTimeout(() => setLogoShown(true), reduceMotion ? 0 : LOGO_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [fontsReady, reduceMotion]);

  useEffect(() => {
    if (!fontsReady) {
      return;
    }
    const timer = setTimeout(() => setSlow(true), SLOW_LOADING_MS);
    return () => clearTimeout(timer);
  }, [fontsReady]);

  useEffect(() => {
    if (!leaving) {
      return;
    }
    const timer = setTimeout(onFinished, FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [leaving, onFinished]);

  const logo = reduceMotion ? <Logo size={LOGO_SIZE} /> : <AnimatedLogo size={LOGO_SIZE} />;

  return (
    <Animated.View pointerEvents="none" style={[styles.splash, leaving && FADE_OUT]}>
      {fontsReady && (
        <View>
          {logo}
          {slow && !appReady && <Text style={styles.loading}>{home.loadingData}</Text>}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: colors.feltNight, backgroundImage: colors.feltRoom },
  loading: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 16, color: colors.feltText, fontSize: 14, fontFamily: fonts.regular, textAlign: "center" },
});
