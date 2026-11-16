import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { CHIP_TABLES } from "@pontinho/rules";
import { profileQueryOptions } from "@/shared/api/profile";
import { formatChips } from "@/shared/format/numbers";
import { tableTitle } from "@/shared/format/tableTitle";
import { Button } from "@/shared/ui/Button";
import { ErrorLine } from "@/shared/ui/Notice";
import { Option, optionTextColor } from "@/shared/ui/Option";
import { Sheet } from "@/shared/ui/Sheet";
import { TextField } from "@/shared/ui/TextField";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import lobby from "@/messages/lobby.json";

const CENTS_PER_REAL = 100;

type Props = { visible: boolean; connecting: boolean; error: string; onClose: () => void; onCreate: (table: number, centsPerPoint?: number) => void };

function centsOf(reais: string) {
  return Math.round(Number(reais.trim().replace(",", ".")) * CENTS_PER_REAL);
}

export function FriendsTableSheet({ visible, connecting, error, onClose, onCreate }: Props) {
  const [table, setTable] = useState(CHIP_TABLES[0].id);
  const [reaisPerPoint, setReaisPerPoint] = useState("");
  const { data: profile } = useQuery(profileQueryOptions());
  const centsPerPoint = reaisPerPoint.trim() === "" ? undefined : centsOf(reaisPerPoint);
  const invalidPix = centsPerPoint !== undefined && !(centsPerPoint > 0);

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text accessibilityRole="header" style={styles.title}>
        {lobby.chooseTable}
      </Text>
      <Text style={styles.message}>{lobby.friendsChips}</Text>
      <View style={styles.list}>
        {CHIP_TABLES.map(({ id, minimumBalance }) => {
          const selected = id === table;
          return (
            <Option key={id} selected={selected} onPress={() => setTable(id)} label={tableTitle(id)} style={styles.row}>
              <Text style={[styles.rowTitle, { color: optionTextColor(selected) }]}>{tableTitle(id)}</Text>
              <Text style={[styles.rowDetail, selected && styles.rowDetailSelected]}>{lobby.minimumBalance.replace("{value}", formatChips(minimumBalance))}</Text>
            </Option>
          );
        })}
      </View>
      {profile?.pixSettlement && (
        <View style={styles.pix}>
          <TextField label={lobby.pixPerPointLabel} value={reaisPerPoint} onChangeText={setReaisPerPoint} keyboardType="decimal-pad" placeholder="0,10" error={invalidPix ? lobby.pixPerPointInvalid : ""} />
          <Text style={styles.pixHint}>{lobby.pixPerPointHint}</Text>
        </View>
      )}
      <ErrorLine text={error} />
      <Button title={connecting ? lobby.connecting : lobby.createRoom} onPress={() => onCreate(table, centsPerPoint)} loading={connecting} disabled={invalidPix} />
      <Button title={lobby.cancel} onPress={onClose} variant="secondary" disabled={connecting} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  message: { color: colors.textSoft, fontSize: 15, lineHeight: 22, fontFamily: fonts.regular },
  list: { gap: 6 },
  row: { minHeight: 44, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between" },
  rowTitle: { fontSize: 14, fontFamily: fonts.display },
  rowDetail: { color: colors.optionMuted, fontSize: 11.5, fontFamily: fonts.regular, fontVariant: ["tabular-nums"] },
  rowDetailSelected: { color: colors.optionText },
  pix: { gap: 6 },
  pixHint: { color: colors.textSoft, fontSize: 13, fontFamily: fonts.regular },
});
