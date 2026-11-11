import { CHIP_TABLES } from "@pontinho/rules";
import lobby from "@/messages/lobby.json";
import { formatChips } from "./numbers";

export function tableTitle(tableId: number) {
  const table = CHIP_TABLES.find(({ id }) => id === tableId);
  if (!table) {
    return lobby.trainingHint;
  }
  if (table.pointValue === 1) {
    return lobby.pointValueOne;
  }
  return lobby.pointValue.replace("{value}", formatChips(table.pointValue));
}
