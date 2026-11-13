import { randomUUID } from "node:crypto";
import type { PixTransfer } from "@pontinho/api-contract";
import { CHIP_TABLES, settleRound, type MatchFinance } from "@pontinho/rules";
import type { GameApi } from "../../gameApi/GameApi.js";
import type { ChipsFinance, ChipsSeat, MatchResult, OpenedChipsMatch, RoundResult } from "./ChipsMatch.js";

export type PlayerPixTransfer = Omit<PixTransfer, "fromUserId" | "toUserId"> & { from: string; to: string };

type FriendsChipsInput = { api: GameApi; table: number; seats: ChipsSeat[]; centsPerPoint: number | null; onPixTransfers: (transfers: PlayerPixTransfer[]) => void };

export class FriendsChips {
  private readonly api: GameApi;
  private readonly table: number;
  private readonly pointValue: number;
  private readonly seats: ChipsSeat[];
  private readonly centsPerPoint: number | null;
  private readonly onPixTransfers: (transfers: PlayerPixTransfer[]) => void;
  private finances: MatchFinance[];
  private finishing?: Promise<void>;

  constructor({ api, table, seats, centsPerPoint, onPixTransfers }: FriendsChipsInput) {
    const chipTable = CHIP_TABLES.find(({ id }) => id === table);
    if (!chipTable) {
      throw new Error(`Mesa ${table} não existe`);
    }
    this.api = api;
    this.table = table;
    this.pointValue = chipTable.pointValue;
    this.seats = seats;
    this.centsPerPoint = centsPerPoint;
    this.onPixTransfers = onPixTransfers;
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
    const { pixTransfers } = await this.api.recordFriendsMatch({
      matchId: randomUUID(),
      table: this.table,
      winnerId: winnerId === null ? null : this.userIdOf(winnerId),
      centsPerPoint: this.centsPerPoint,
      players: this.finances.map(({ playerId, result }) => ({ userId: this.userIdOf(playerId), result })),
    });
    this.onPixTransfers(pixTransfers.map(({ fromUserId, toUserId, ...transfer }) => ({ ...transfer, from: this.playerIdOf(fromUserId), to: this.playerIdOf(toUserId) })));
  }

  private chipsFinances(): ChipsFinance[] {
    return this.finances.map(({ playerId, startBalance, result, deficit }) => ({ playerId, result, deficit, balance: startBalance + result }));
  }

  private playerIdOf(userId: string) {
    const seat = this.seats.find((candidate) => candidate.userId === userId);
    if (!seat) {
      throw new Error(`Conta ${userId} fora da partida com amigos`);
    }
    return seat.playerId;
  }

  private userIdOf(playerId: string) {
    const seat = this.seats.find((candidate) => candidate.playerId === playerId);
    if (!seat) {
      throw new Error(`Jogador ${playerId} fora da partida com amigos`);
    }
    return seat.userId;
  }
}
