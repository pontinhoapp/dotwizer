import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { MAX_PLAYERS, type TableListing } from "@pontinho/protocol";
import type { ChipTable } from "@pontinho/rules";
import { tableTitle } from "@/shared/format/tableTitle";
import { formatChips } from "@/shared/format/numbers";
import { Avatar } from "@/shared/ui/Avatar";
import { Icon } from "@/shared/ui/Icon";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import lobby from "@/messages/lobby.json";

const UNKNOWN = "—";
const AVATAR_SIZE = 40;
const SEATS = Array.from({ length: MAX_PLAYERS }, (_, index) => index);

type Props = {
  tables: ChipTable[];
  listings?: TableListing[];
  balance: number;
  seatingId?: number;
  disabled: boolean;
  onSit: (tableId: number) => void;
};

function countText(listing: TableListing | undefined, seats: number) {
  if (!listing) {
    return UNKNOWN;
  }
  if (listing.players.length === 0) {
    return lobby.emptyTable;
  }
  return lobby.seated.replace("{count}", String(listing.players.length)).replace("{seats}", String(seats));
}

export function TableList({ tables, listings, balance, seatingId, disabled, onSit }: Props) {
  return (
    <View style={styles.list}>
      {tables.map((table) => {
        const locked = balance < table.minimumBalance;
        const seating = table.id === seatingId;
        const listing = listings?.find(({ table: id }) => id === table.id);
        const title = tableTitle(table.id);
        const detail = lobby.minimumBalance.replace("{value}", formatChips(table.minimumBalance));
        const count = countText(listing, MAX_PLAYERS);
        return (
          <Pressable
            key={table.id}
            onPress={() => onSit(table.id)}
            disabled={locked || disabled}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${detail}, ${count}`}
            accessibilityState={{ disabled: locked || disabled, busy: seating }}
            style={({ pressed }) => [styles.row, seating && styles.rowSeating, locked && styles.locked, pressed && styles.pressed]}
          >
            <View style={styles.header}>
              <View style={styles.text}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{title}</Text>
                  {locked && <Icon name="lock" size={13} color={colors.optionText} />}
                </View>
                <Text style={styles.detail}>{detail}</Text>
              </View>
              {seating ? (
                <View style={styles.seating}>
                  <ActivityIndicator size="small" color={colors.onSelected} />
                  <Text style={styles.seatingText}>{lobby.connecting}</Text>
                </View>
              ) : (
                <Text style={styles.count}>{count}</Text>
              )}
            </View>
            <View style={styles.seats}>
              {SEATS.map((seat) => {
                const player = listing?.players[seat];
                if (!player) {
                  return (
                    <View key={seat} style={styles.seat} aria-hidden>
                      <View style={styles.freeSeat} />
                    </View>
                  );
                }
                return (
                  <View key={seat} style={styles.seat}>
                    <Avatar name={player.nickname} size={AVATAR_SIZE} photoUrl={player.photoUrl} />
                    <Text style={styles.nickname} numberOfLines={1}>
                      {player.nickname}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { paddingVertical: 12, paddingHorizontal: 12, gap: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.option },
  rowSeating: { borderWidth: 1.5, borderColor: colors.text, backgroundColor: colors.selected },
  locked: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  text: { flex: 1, minWidth: 0, gap: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { color: colors.optionText, fontSize: 14, fontFamily: fonts.display },
  detail: { color: colors.optionMuted, fontSize: 11.5, fontFamily: fonts.regular, fontVariant: ["tabular-nums"] },
  seating: { flexDirection: "row", alignItems: "center", gap: 6 },
  seatingText: { color: colors.onSelected, fontSize: 12.5, fontFamily: fonts.semibold },
  count: { color: colors.optionText, fontSize: 12.5, fontFamily: fonts.semibold, fontVariant: ["tabular-nums"] },
  seats: { flexDirection: "row", gap: 8 },
  seat: { flex: 1, minWidth: 0, alignItems: "center", gap: 4 },
  freeSeat: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 1, borderStyle: "dashed", borderColor: colors.lineStrong },
  nickname: { maxWidth: "100%", color: colors.optionText, fontSize: 11.5, fontFamily: fonts.medium, textAlign: "center" },
});
