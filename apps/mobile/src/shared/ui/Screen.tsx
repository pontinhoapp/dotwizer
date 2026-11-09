import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/shared/theme/colors";

const KEYBOARD_BEHAVIOR = process.env.EXPO_OS === "ios" ? "padding" : undefined;
const WEB_ENTRANCE = {
  animationName: { from: { opacity: 0, transform: [{ translateX: 25 }] }, to: { opacity: 1, transform: [{ translateX: 0 }] } },
  animationDuration: "200ms",
  animationTimingFunction: "ease-out",
} as const;

type Props = { children: ReactNode; glow?: boolean };

export function Screen({ children, glow = false }: Props) {
  const reduceMotion = useReducedMotion();
  const animated = process.env.EXPO_OS === "web" && !reduceMotion;

  return (
    <Animated.View style={[styles.screen, glow && styles.glow, animated && WEB_ENTRANCE]}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={styles.fill}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  glow: { backgroundImage: colors.nightGlow },
  fill: { flex: 1 },
  content: { flexGrow: 1, width: "100%", maxWidth: 480, alignSelf: "center", gap: 14, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
});
