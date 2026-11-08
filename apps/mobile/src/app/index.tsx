import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useMatch } from "@/features/match/MatchProvider";
import { ChipBalance } from "@/features/wallet/BalanceCard";
import { DailyBonus } from "@/features/wallet/DailyBonus";
import { useDailyBonus } from "@/features/wallet/useDailyBonus";
import { useWallet } from "@/features/wallet/useWallet";
import { profileQueryOptions } from "@/shared/api/profile";
import { Avatar } from "@/shared/ui/Avatar";
import { CardTrio } from "@/shared/ui/CardTrio";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { Logo } from "@/shared/ui/Logo";
import { Notice } from "@/shared/ui/Notice";
import { Screen } from "@/shared/ui/Screen";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import home from "@/messages/home.json";

export default function Menu() {
  const { room, error: matchError } = useMatch();
  const wallet = useWallet();
  const { data: profile } = useQuery(profileQueryOptions());
  const dailyBonus = useDailyBonus();
  const error = matchError || dailyBonus.error;

  if (room) {
    return <Redirect href="/match" />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Logo size={22} />
          <Text style={styles.officialName}>{home.officialName}</Text>
        </View>
        <View style={styles.player}>
          <Avatar name={profile?.nickname ?? ""} size={36} photoUrl={profile?.photoUrl} />
          <ChipBalance balance={wallet.balance} />
        </View>
      </View>
      {wallet.error !== "" && <Notice text={wallet.error} tone="danger" onRetry={wallet.retry} />}
      {error !== "" && <Notice text={error} tone="danger" />}
      <DailyBonus available={wallet.dailyBonusAvailable} pending={dailyBonus.pending} onClaim={dailyBonus.claim} />
      <Pressable onPress={() => router.push("/lobby")} accessibilityRole="button" style={({ pressed }) => [styles.online, pressed && styles.pressed]}>
        <View style={styles.onlineCards}>
          <CardTrio width={56} />
        </View>
        <Text style={styles.onlineTitle}>{home.play}</Text>
        <View style={styles.onlineRow}>
          <Text style={styles.onlineHint}>{home.playOnlineHint}</Text>
          <View style={styles.onlineArrow}>
            <Icon name="forward" size={22} color={colors.onAction} />
          </View>
        </View>
      </Pressable>
      <Pressable onPress={() => router.push("/training")} accessibilityRole="button" style={({ pressed }) => [styles.practice, pressed && styles.pressed]}>
        <View style={styles.practiceIcon}>
          <Icon name="bot" size={24} color={colors.text} />
        </View>
        <View style={styles.practiceText}>
          <Text style={styles.practiceTitle}>{home.train}</Text>
          <Text style={styles.hint}>{home.trainHint}</Text>
        </View>
        <Icon name="chevron" size={18} color={colors.faint} />
      </Pressable>
      <View accessibilityRole="menu" style={styles.list}>
        <Pressable onPress={() => router.push("/payments")} accessibilityRole="button" style={({ pressed }) => [styles.listRow, styles.paymentsRow, pressed && styles.pressed]}>
          <Icon name="payments" size={22} color={colors.text} />
          <View style={styles.listText}>
            <Text style={styles.listTitle}>{home.payments}</Text>
            <Text style={styles.hint}>{home.paymentsHint}</Text>
          </View>
          <Icon name="chevron" size={18} color={colors.faint} />
        </Pressable>
        <MenuRow icon="person" title={home.profile} onPress={() => router.push("/profile")} />
        <MenuRow icon="settings" title={home.settings} onPress={() => router.push("/settings")} />
        <MenuRow icon="stats" title={home.stats} onPress={() => router.push("/stats")} last />
      </View>
      <View style={styles.smallButtons}>
        <SmallButton icon="book" title={home.manual} onPress={() => router.push("/manual")} />
        <SmallButton icon="help" title={home.help} onPress={() => router.push("/help")} />
      </View>
    </Screen>
  );
}

function MenuRow({ icon, title, onPress, last = false }: { icon: IconName; title: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.listRow, last && styles.lastRow, pressed && styles.pressed]}>
      <Icon name={icon} size={22} color={colors.text} />
      <Text style={[styles.listTitle, styles.listText]}>{title}</Text>
      <Icon name="chevron" size={18} color={colors.faint} />
    </Pressable>
  );
}

function SmallButton({ icon, title, onPress }: { icon: IconName; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}>
      <Icon name={icon} size={18} color={colors.text} />
      <Text style={styles.smallTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  officialName: { color: colors.muted, fontSize: 11, fontFamily: fonts.medium },
  player: { flexDirection: "row", alignItems: "center", gap: 10 },
  pressed: { opacity: 0.85 },
  online: { height: 210, padding: 20, gap: 4, borderRadius: 24, overflow: "hidden", backgroundColor: colors.feltNight, backgroundImage: colors.feltCard, justifyContent: "flex-end" },
  onlineCards: { position: "absolute", right: 36, top: 24 },
  onlineTitle: { color: colors.onSelected, fontSize: 26, fontFamily: fonts.display },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  onlineHint: { flex: 1, color: colors.feltText, fontSize: 14, fontFamily: fonts.regular },
  onlineArrow: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.action, alignItems: "center", justifyContent: "center" },
  practice: { height: 80, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 14 },
  practiceIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.option, alignItems: "center", justifyContent: "center" },
  practiceText: { flex: 1, gap: 3 },
  practiceTitle: { color: colors.text, fontSize: 17, fontFamily: fonts.display },
  hint: { color: colors.muted, fontSize: 13, fontFamily: fonts.regular },
  list: { borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  listRow: { height: 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  paymentsRow: { height: 66 },
  lastRow: { borderBottomWidth: 0 },
  listText: { flex: 1, gap: 2 },
  listTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.semibold },
  smallButtons: { flexDirection: "row", gap: 12 },
  smallButton: { flex: 1, height: 48, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 8 },
  smallTitle: { flexShrink: 1, color: colors.text, fontSize: 14, fontFamily: fonts.semibold },
});
