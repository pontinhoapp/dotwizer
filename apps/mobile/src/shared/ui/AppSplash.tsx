import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { cubicBezier, useReducedMotion } from "react-native-reanimated";
import { Card } from "@/shared/cards/Card";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import home from "@/messages/home.json";
import { AnimatedLogo, Logo } from "./Logo";

const LOGO_SIZE = 40;
const CARD_WIDTH = 92;
const CARDS_START_MS = 1200;
const CARD_STEP_MS = 500;
const CARD_THROW_MS = 750;
const CARD_SHADE_MS = 400;
const SEQUENCE_MS = CARDS_START_MS + 2 * CARD_STEP_MS + CARD_THROW_MS + 100;
const SPLASH_CARDS = [
  { id: "Q-hearts-1", rank: "Q", suit: "hearts", x: -64, y: 0, rotate: -14 },
  { id: "K-spades-1", rank: "K", suit: "spades", x: 0, y: -14, rotate: 0 },
  { id: "J-diamonds-1", rank: "J", suit: "diamonds", x: 64, y: 0, rotate: 14 },
];
const FADE_OUT_MS = 220;

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
    const timer = setTimeout(() => setLogoShown(true), reduceMotion ? 0 : SEQUENCE_MS);
    return () => clearTimeout(timer);
  }, [fontsReady, reduceMotion]);

  useEffect(() => {
    if (!fontsReady) {
      return;
    }
    const timer = setTimeout(() => setSlow(true), SEQUENCE_MS);
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
          <SplashCards animated={!reduceMotion} />
          {logo}
          {slow && !appReady && <Text style={styles.loading}>{home.loadingData}</Text>}
        </View>
      )}
    </Animated.View>
  );
}

function SplashCards({ animated }: { animated: boolean }) {
  return (
    <View style={styles.cards}>
      {SPLASH_CARDS.map((card, index) => {
        const place = [{ translateX: card.x }, { translateY: card.y }, { rotate: `${card.rotate}deg` }, { scale: 1 }];
        const throwStart = CARDS_START_MS + index * CARD_STEP_MS;
        const thrown = {
          animationName: {
            from: { opacity: 0, transform: [{ translateX: card.x * 0.4 }, { translateY: 360 }, { rotate: `${card.rotate - 20}deg` }, { scale: 0.92 }] },
            "25%": { opacity: 1 },
            to: { opacity: 1, transform: place },
          },
          animationDuration: `${CARD_THROW_MS}ms`,
          animationDelay: `${throwStart}ms`,
          animationFillMode: "backwards",
          animationTimingFunction: cubicBezier(0.16, 1, 0.3, 1),
        } as const;
        const dim = {
          animationName: { from: { opacity: 0 }, to: { opacity: 0.4 } },
          animationDuration: `${CARD_SHADE_MS}ms`,
          animationDelay: `${throwStart + CARD_THROW_MS * 0.6}ms`,
          animationFillMode: "both",
          animationTimingFunction: "ease-in-out",
        } as const;
        return (
          <Animated.View key={card.id} style={[styles.card, { transform: place }, animated && thrown]}>
            <Card card={card} width={CARD_WIDTH} />
            <Animated.View style={[styles.cardShade, animated ? dim : styles.cardShadeOn]} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: colors.feltNight, backgroundImage: colors.feltRoom },
  cards: { position: "absolute", left: "50%", bottom: LOGO_SIZE * 0.6 },
  card: { position: "absolute", bottom: 0, left: -CARD_WIDTH / 2, boxShadow: "0 6px 10px rgba(0, 0, 0, 0.55)" },
  cardShade: { ...StyleSheet.absoluteFill, borderRadius: CARD_WIDTH * 0.06, backgroundColor: colors.night, opacity: 0 },
  cardShadeOn: { opacity: 0.4 },
  loading: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 16, color: colors.feltText, fontSize: 14, fontFamily: fonts.regular, textAlign: "center" },
});
