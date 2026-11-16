import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { formatReais } from "@/shared/format/numbers";
import { Button } from "@/shared/ui/Button";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import match from "@/messages/match.json";
import type { GameState } from "./state";

const QR_SIZE = 180;

type Transfer = GameState["pixTransfers"][number];

type Props = { state: GameState; sessionId: string };

function PayableTransfer({ transfer }: { transfer: Transfer }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await Clipboard.setStringAsync(transfer.pixCopyPaste);
    setCopied(true);
  }

  return (
    <>
      <View style={styles.qr}>
        <Image source={{ uri: transfer.qrCode }} style={styles.qrImage} contentFit="contain" accessibilityLabel={match.pixQrCode} />
      </View>
      <Button title={copied ? match.pixCopied : match.pixCopy} onPress={copy} variant="secondary" />
    </>
  );
}

export function PixSettlement({ state, sessionId }: Props) {
  const nameOf = (playerId: string) => state.players[playerId]?.name ?? "";

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        {match.pixTitle}
      </Text>
      {state.pixTransfers.map((transfer) => (
        <View key={transfer.pixCopyPaste} style={styles.transfer}>
          <Text style={styles.text}>{match.pixPays.replace("{from}", nameOf(transfer.from)).replace("{value}", formatReais(transfer.amountCents)).replace("{to}", nameOf(transfer.to))}</Text>
          {transfer.from === sessionId && <PayableTransfer transfer={transfer} />}
        </View>
      ))}
      <Text style={styles.notice}>{match.pixNotice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 12, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: "rgba(10, 13, 12, 0.92)" },
  title: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  transfer: { padding: 12, gap: 10, borderRadius: 14, borderWidth: 1, borderColor: "#1F2623", backgroundColor: colors.plate },
  text: { color: colors.text, fontSize: 15, fontFamily: fonts.semibold },
  qr: { alignSelf: "center", padding: 10, borderRadius: 14, backgroundColor: colors.onSelected },
  qrImage: { width: QR_SIZE, height: QR_SIZE },
  notice: { color: colors.textSoft, fontSize: 13, lineHeight: 18, fontFamily: fonts.regular },
});
