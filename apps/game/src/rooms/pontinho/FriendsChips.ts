import { randomUUID } from "node:crypto";
import { CHIP_TABLES, settleRound, type MatchFinance } from "@pontinho/rules";
import type { GameApi } from "../../gameApi/GameApi.js";
import type { ChipsFinance, ChipsSeat, MatchResult, OpenedChipsMatch, RoundResult } from "./ChipsMatch.js";

type FriendsChipsInput = { api: GameApi; table: number; seats: ChipsSeat[] };

export class FriendsChips {
  private readonly api: GameApi;
  private readonly table: number;
  private readonly pointValue: number;
  private readonly seats: ChipsSeat[];
  private finances: MatchFinance[];
  private finishing?: Promise<void>;

  constructor({ api, table, seats }: FriendsChipsInput) {
    const chipTable = CHIP_TABLES.find(({ id }) => id === table);
    if (!chipTable) {
      throw new Error(`Mesa ${table} não existe`);
    }
    this.api = api;
    this.table = table;
    this.pointValue = chipTable.pointValue;
    this.seats = seats;
    this.finances = seats.map(({ playerId }) => ({ playerId, startBalance: chipTable.minimumBalance, result: 0, deficit: 0 }));
  }

  async open(): Promise<OpenedChipsMatch> {
    return { matchId: "", pointValue: this.pointValue, finances: this.chipsFinances() };
  }

  async settleRound({ winnerId, losers }: RoundResult): Promise<ChipsFinance[]> {
    const handPoints = Object.fromEntries(losers.map(({ playerId, handPoints: points }) => [playerId, points]));
    this.finances = settleRound({ finances: this.finances, handPoints, winnerId, pointValue: this.pointValue }).finances;
    return this.chipsFinances();
  }

  finish({ winnerId }: MatchResult): Promise<void> {
    this.finishing ??= this.record(winnerId);
    return this.finishing;
  }

  async eliminate() {}

  private async record(winnerId: string | null) {
    await this.api.recordFriendsMatch({
      matchId: randomUUID(),
      table: this.table,
      winnerId: winnerId === null ? null : this.userIdOf(winnerId),
      players: this.finances.map(({ playerId, result }) => ({ userId: this.userIdOf(playerId), result })),
    });
  }

  private chipsFinances(): ChipsFinance[] {
    return this.finances.map(({ playerId, startBalance, result, deficit }) => ({ playerId, result, deficit, balance: startBalance + result }));
  }

  private userIdOf(playerId: string) {
    const seat = this.seats.find((candidate) => candidate.playerId === playerId);
    if (!seat) {
      throw new Error(`Jogador ${playerId} fora da partida com amigos`);
    }
    return seat.userId;
  }
}
