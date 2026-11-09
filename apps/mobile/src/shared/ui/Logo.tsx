import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import home from "@/messages/home.json";

const DOTLESS_I = "ı";
const LETTER_STEP_MS = 55;
const LETTER_DURATION_MS = 220;

function logoStyles(size: number) {
  const dot = size * 0.24;
  return {
    text: { color: colors.text, fontSize: size, lineHeight: size * 1.2, fontFamily: fonts.display, letterSpacing: -0.02 * size },
    dot: { width: dot, height: dot, borderRadius: dot / 2, top: size * 0.12, marginLeft: -dot / 2 },
  };
}

export function Logo({ size }: { size: number }) {
  const dotIndex = home.title.indexOf("i");
  const { text, dot } = logoStyles(size);

  return (
    <View accessibilityRole="header" accessibilityLabel={home.title} style={styles.row}>
      <Text style={text}>{home.title.slice(0, dotIndex)}</Text>
      <View>
        <Text style={text}>{DOTLESS_I}</Text>
        <View style={[styles.dot, dot]} />
      </View>
      <Text style={text}>{home.title.slice(dotIndex + 1)}</Text>
    </View>
  );
}

export function AnimatedLogo({ size }: { size: number }) {
  const letters = [...home.title];
  const { text, dot } = logoStyles(size);
  const center = (letters.length - 1) / 2;
  const dotDelay = letters.length * LETTER_STEP_MS + 60;

  function letterEntrance(index: number) {
    return {
      animationName: {
        from: { opacity: 0, transform: [{ translateX: (index - center) * size * 0.35 }, { translateY: size * 0.3 }] },
        to: { opacity: 1, transform: [{ translateX: 0 }, { translateY: 0 }] },
      },
      animationDuration: `${LETTER_DURATION_MS}ms`,
      animationDelay: `${index * LETTER_STEP_MS}ms`,
      animationFillMode: "backwards",
      animationTimingFunction: "ease-out",
    } as const;
  }

  const dotFall = {
    animationName: {
      "0%": { opacity: 0, transform: [{ translateY: -size * 2.2 }] },
      "15%": { opacity: 1 },
      "65%": { transform: [{ translateY: 0 }] },
      "82%": { transform: [{ translateY: -size * 0.28 }] },
      "100%": { opacity: 1, transform: [{ translateY: 0 }] },
    },
    animationDuration: "420ms",
    animationDelay: `${dotDelay}ms`,
    animationFillMode: "backwards",
  } as const;

  const dotPulse = {
    animationName: { from: { transform: [{ scale: 1 }] }, to: { transform: [{ scale: 1.3 }] } },
    animationDuration: "650ms",
    animationDelay: `${dotDelay + 520}ms`,
    animationDirection: "alternate",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  } as const;

  return (
    <View accessibilityRole="header" accessibilityLabel={home.title} style={styles.row}>
      {letters.map((letter, index) => {
        if (letter !== "i") {
          return (
            <Animated.Text key={index} style={[text, letterEntrance(index)]}>
              {letter}
            </Animated.Text>
          );
        }
        return (
          <View key={index}>
            <Animated.Text style={[text, letterEntrance(index)]}>{DOTLESS_I}</Animated.Text>
            <Animated.View style={[styles.dot, dot, dotFall]}>
              <Animated.View style={[styles.dotFill, dotPulse]} />
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  dot: { position: "absolute", left: "50%", backgroundColor: colors.brandDot },
  dotFill: { flex: 1, borderRadius: 999, backgroundColor: colors.brandDot },
});
