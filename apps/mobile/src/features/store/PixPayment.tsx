import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import type { PurchaseResponse } from "@pontinho/api-contract";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import store from "@/messages/store.json";

const QR_SIZE = 220;

type Props = { pix: NonNullable<PurchaseResponse["pix"]>; onBack: () => void };

export function PixPayment({ pix, onBack }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await Clipboard.setStringAsync(pix.copyPaste);
    setCopied(true);
  }

  return (
    <>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          {store.pixTitle}
        </Text>
        <View style={styles.qr}>
          <Image source={{ uri: pix.qrCode }} style={styles.qrImage} contentFit="contain" accessibilityLabel={store.pixQrCode} />
        </View>
        <View style={styles.waiting}>
          <ActivityIndicator size="small" color={colors.action} />
          <Text style={styles.waitingText}>{store.waitingPayment}</Text>
        </View>
      </View>
      <View style={styles.copyPaste}>
        <Text style={styles.label}>{store.pixCopyPaste}</Text>
        <Text selectable style={styles.code} numberOfLines={3}>
          {pix.copyPaste}
        </Text>
      </View>
      <Button title={copied ? store.copied : store.copyCode} onPress={copy} variant="secondary" />
      <View style={styles.notice}>
        <Icon name="info" size={16} color={colors.textSoft} />
        <Text style={styles.noticeText}>{store.testNotice}</Text>
      </View>
      <View style={styles.footer}>
        <Button title={store.back} onPress={onBack} variant="plain" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 22, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: "center", gap: 16 },
  title: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  qr: { padding: 12, borderRadius: 16, backgroundColor: colors.onSelected },
  qrImage: { width: QR_SIZE, height: QR_SIZE },
  waiting: { flexDirection: "row", alignItems: "center", gap: 10 },
  waitingText: { color: colors.text, fontSize: 15, fontFamily: fonts.semibold },
  copyPaste: { gap: 6, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.plate },
  label: { color: colors.muted, fontSize: 13, fontFamily: fonts.semibold },
  code: { color: colors.optionText, fontSize: 13, fontFamily: fonts.regular },
  notice: { flexDirection: "row", alignItems: "center", gap: 8 },
  noticeText: { flex: 1, color: colors.textSoft, fontSize: 13, fontFamily: fonts.regular },
  footer: { marginTop: "auto" },
});
