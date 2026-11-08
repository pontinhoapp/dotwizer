import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { DAILY_BONUS } from "@pontinho/rules";
import { Icon } from "@/shared/ui/Icon";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import wallet from "@/messages/wallet.json";

type Props = { available?: boolean; pending: boolean; onClaim: () => void };

export function DailyBonus({ available, pending, onClaim }: Props) {
  if (available === false) {
    return (
      <View style={[styles.row, styles.claimed]}>
        <Icon name="check" size={16} color={colors.muted} />
        <Text style={styles.claimedText}>{wallet.dailyBonusClaimed}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onClaim}
      disabled={available !== true || pending}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, styles.button, pressed && styles.pressed, available !== true && !pending && styles.disabled]}
    >
      {pending ? <ActivityIndicator size="small" color={colors.action} /> : <Icon name="gift" size={16} color={colors.action} />}
      <Text style={styles.text}>{wallet.claimDailyBonus.replace("{amount}", String(DAILY_BONUS))}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { height: 40, paddingHorizontal: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  button: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  claimed: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.line },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { flex: 1, color: colors.text, fontSize: 14, fontFamily: fonts.semibold },
  claimedText: { flex: 1, color: colors.muted, fontSize: 13, fontFamily: fonts.regular },
});
