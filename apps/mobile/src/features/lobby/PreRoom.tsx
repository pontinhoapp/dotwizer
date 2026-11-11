import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MAX_PLAYERS, type CreateOptions } from "@pontinho/protocol";
import { CHIP_TABLES } from "@pontinho/rules";
import { tableTitle } from "@/shared/format/tableTitle";
import type { CardStyleName } from "@/shared/cards/Card";
import { useCardStyle } from "@/shared/cards/useCardStyle";
import { Button } from "@/shared/ui/Button";
import { ErrorLine } from "@/shared/ui/Notice";
import { Sheet } from "@/shared/ui/Sheet";
import { colors } from "@/shared/theme/colors";
import { fonts } from "@/shared/theme/fonts";
import lobby from "@/messages/lobby.json";
import { TableList } from "./TableList";
import { useTables } from "./useTables";

export type LobbyChoice = CreateOptions & { cardStyle: CardStyleName };

type Props = { balance: number; connecting: boolean; error: string; onConfirm: (choice: LobbyChoice) => void };

export function PreRoom({ balance, connecting, error, onConfirm }: Props) {
  const [chosenTableId, setChosenTableId] = useState<number>();
  const [confirmingTableId, setConfirmingTableId] = useState<number>();
  const { cardStyle } = useCardStyle();
  const tables = useTables();

  function enter() {
    if (confirmingTableId === undefined) {
      return;
    }
    setChosenTableId(confirmingTableId);
    setConfirmingTableId(undefined);
    onConfirm({ bots: false, table: confirmingTableId, cardStyle });
  }

  return (
    <>
      <View style={styles.group}>
        <Text style={styles.label}>{lobby.tablesWithSeats.replace("{seats}", String(MAX_PLAYERS))}</Text>
        <Text style={styles.hint}>{lobby.tapToSit}</Text>
        <ErrorLine text={tables.error} />
        <TableList
          tables={CHIP_TABLES}
          listings={tables.tables}
          balance={balance}
          seatingId={connecting ? chosenTableId : undefined}
          disabled={connecting}
          onSit={setConfirmingTableId}
        />
      </View>
      <ErrorLine text={error} />
      <Sheet visible={confirmingTableId !== undefined} onClose={() => setConfirmingTableId(undefined)}>
        <Text accessibilityRole="header" style={styles.sheetTitle}>
          {lobby.enterTitle.replace("{table}", tableTitle(confirmingTableId ?? 0))}
        </Text>
        <Text style={styles.sheetMessage}>{lobby.enterMessage}</Text>
        <Button title={lobby.enter} onPress={enter} />
        <Button title={lobby.cancel} onPress={() => setConfirmingTableId(undefined)} variant="secondary" />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { color: colors.muted, fontSize: 13, fontFamily: fonts.semibold },
  hint: { color: colors.muted, fontSize: 13, fontFamily: fonts.medium },
  sheetTitle: { color: colors.text, fontSize: 19, fontFamily: fonts.display },
  sheetMessage: { color: colors.textSoft, fontSize: 15, lineHeight: 22, fontFamily: fonts.regular },
});
