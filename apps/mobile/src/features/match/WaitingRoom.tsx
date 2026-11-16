import { useEffect, useState } from "react";
import { ActivityIndicator, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MIN_PLAYERS } from "@pontinho/protocol";
import { formatReais } from "@/shared/format/numbers";
import { friendsLink } from "@/shared/navigation/friendsLink";
import { Avatar } from "@/shared/ui/Avatar";
import { Button } from "@/shared/ui/Button";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import match from "@/messages/match.json";
import { tableTitle } from "@/shared/format/tableTitle";
import { useMatch } from "./MatchProvider";
import { sendAction } from "./messaging";
import { hasChips, isOffline, type GameState } from "./state";
import { TurnTimer } from "./TurnTimer";

const EXIT_LOCK_SECONDS = 30;

type Props = { state: GameState; onExit: () => void };

export function WaitingRoom({ state, onExit }: Props) {
  const [exitLockSeconds, setExitLockSeconds] = useState(hasChips(state) && !state.friends ? EXIT_LOCK_SECONDS : 0);
  const status = match.waiting.replace("{count}", String(state.order.length)).replace("{seats}", String(state.seats));
  const freeSeats = Array.from({ length: Math.max(state.seats - state.order.length, 0) }, (_, index) => index);
  const exitTitle = exitLockSeconds > 0 ? match.exitIn.replace("{seconds}", String(exitLockSeconds)) : match.exit;
  const { room } = useMatch();
  const [linkCopied, setLinkCopied] = useState(false);
  const code = room?.roomId ?? "";
  const isOwner = room !== undefined && state.order[0] === room.sessionId;

  async function shareLink() {
    const link = friendsLink(code);
    try {
      await Share.share({ message: match.shareMessage.replace("{link}", link) });
    } catch {
      if (!navigator.clipboard) {
        return;
      }
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
    }
  }

  useEffect(() => {
    if (exitLockSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => setExitLockSeconds(exitLockSeconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [exitLockSeconds]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.table}>{tableTitle(state.table)}</Text>
        {state.friends && (
          <View style={styles.invite}>
            <Text style={styles.code} selectable>
              {match.friendsCode.replace("{code}", code)}
            </Text>
            <Button title={linkCopied ? match.linkCopied : match.shareLink} onPress={shareLink} variant="secondary" />
            {state.centsPerPoint > 0 && <Text style={styles.pix}>{match.pixPerPoint.replace("{value}", formatReais(state.centsPerPoint))}</Text>}
          </View>
        )}
        <View style={styles.status}>
          <ActivityIndicator size="small" color={colors.action} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
        {state.countdownDuration > 0 && (
          <View style={styles.countdown}>
            <TurnTimer duration={state.countdownDuration} turnNumber={state.countdownNumber} />
          </View>
        )}
        <View style={styles.seats}>
          {state.order.map((sessionId) => {
            const player = state.players[sessionId];
            return (
              <View key={sessionId} style={styles.seat}>
                <Avatar name={player?.name ?? ""} size={32} photoUrl={player?.photoUrl} />
                <View style={styles.seatText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {player?.name ?? ""}
                  </Text>
                  {isOffline(player) && <Text style={styles.offline}>{match.offline}</Text>}
                </View>
              </View>
            );
          })}
          {freeSeats.map((index) => (
            <View key={index} style={[styles.seat, styles.freeSeat]} aria-hidden />
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        {state.friends && isOwner && <Button title={match.start} onPress={() => room && sendAction(room, "start")} disabled={state.order.length < MIN_PLAYERS} />}
        {state.friends && !isOwner && <Text style={styles.waitingOwner}>{match.waitingOwner}</Text>}
        <Button title={exitTitle} onPress={onExit} variant="secondary" disabled={exitLockSeconds > 0} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", paddingHorizontal: 20, paddingBottom: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 28 },
  table: { color: colors.feltText, fontSize: 13, fontFamily: fonts.semibold },
  status: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusText: { color: colors.text, fontSize: 18, fontFamily: fonts.semibold },
  countdown: { width: 220 },
  invite: { alignSelf: "stretch", alignItems: "center", gap: 12 },
  code: { color: colors.text, fontSize: 22, fontFamily: fonts.display, letterSpacing: 2 },
  pix: { color: colors.feltText, fontSize: 14, fontFamily: fonts.semibold, textAlign: "center" },
  footer: { gap: 10 },
  waitingOwner: { color: colors.textSoft, fontSize: 14, fontFamily: fonts.semibold, textAlign: "center" },
  seats: { alignSelf: "stretch", flexDirection: "row", flexWrap: "wrap", gap: 10 },
  seat: { width: "48.5%", height: 60, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.plate, flexDirection: "row", alignItems: "center", gap: 10 },
  freeSeat: { borderStyle: "dashed", borderColor: colors.lineStrong, backgroundColor: "transparent" },
  seatText: { flex: 1 },
  name: { color: colors.text, fontSize: 14, fontFamily: fonts.semibold },
  offline: { color: colors.errorText, fontSize: 11, fontFamily: fonts.semibold },
});
