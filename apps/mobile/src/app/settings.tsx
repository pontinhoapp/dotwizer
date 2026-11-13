import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { goBackOrHome } from "@/shared/navigation/goBackOrHome";
import { useNotifications } from "@/shared/notifications/useNotifications";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import { Icon } from "@/shared/ui/Icon";
import { Notice } from "@/shared/ui/Notice";
import { Screen } from "@/shared/ui/Screen";
import { ScreenHeader } from "@/shared/ui/ScreenHeader";
import home from "@/messages/home.json";
import lobby from "@/messages/lobby.json";
import settings from "@/messages/settings.json";

export default function Settings() {
  const { notificationsEnabled, setNotifications } = useNotifications();
  const [denied, setDenied] = useState(false);

  async function toggleNotifications() {
    const granted = await setNotifications(!notificationsEnabled);
    setDenied(!granted);
  }

  return (
    <Screen>
      <ScreenHeader title={home.settings} backLabel={lobby.back} onBack={goBackOrHome} />
      <View style={styles.list}>
        <Pressable onPress={() => router.push("/appearance")} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <Icon name="palette" size={22} color={colors.text} />
          <Text style={styles.title}>{settings.appearance}</Text>
          <Icon name="chevron" size={18} color={colors.faint} />
        </Pressable>
        <Pressable
          onPress={toggleNotifications}
          accessibilityRole="switch"
          accessibilityLabel={settings.notifications}
          aria-checked={notificationsEnabled}
          style={({ pressed }) => [styles.row, styles.lastRow, pressed && styles.pressed]}
        >
          <Icon name="bell" size={22} color={colors.text} />
          <Text style={styles.title}>{settings.notifications}</Text>
          <View aria-hidden style={[styles.track, notificationsEnabled && styles.trackOn]}>
            <View style={[styles.thumb, notificationsEnabled && styles.thumbOn]} />
          </View>
        </Pressable>
      </View>
      {denied && <Notice text={settings.notificationsDenied} tone="neutral" />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  row: { height: 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  lastRow: { borderBottomWidth: 0 },
  pressed: { opacity: 0.85 },
  title: { flex: 1, color: colors.text, fontSize: 16, fontFamily: fonts.semibold },
  track: { width: 51, height: 31, borderRadius: 16, padding: 2, backgroundColor: colors.lineStrong },
  trackOn: { alignItems: "flex-end", backgroundColor: colors.action },
  thumb: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.text },
  thumbOn: { backgroundColor: colors.night },
});
