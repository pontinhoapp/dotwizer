import QRCode from "qrcode";
import type { PixTransfer, RecordFriendsMatchBody, RecordFriendsMatchResponse } from "@pontinho/api-contract";
import { ApiError } from "../../common/errors/api-error.ts";
import { isUniqueConstraintViolation } from "../../common/errors/error-handler.ts";
import { findChipTable } from "../matches/find-chip-table.ts";
import type { UserRecord, UsersRepository } from "../users/repository/users.repository.ts";
import { pixCopyPaste } from "./pix-copy-paste.ts";
import { pixTransfers } from "./pix-transfers.ts";
import type { FriendsMatchesRepository } from "./repository/friends-matches.repository.ts";

const CITY_WITHOUT_ADDRESS = "BRASIL";

interface FriendsMatchesServiceInput {
  friendsMatchesRepository: FriendsMatchesRepository;
  usersRepository: UsersRepository;
  now: () => Date;
}

interface RecordInput extends RecordFriendsMatchBody {
  matchId: string;
}

interface SettleInput {
  players: RecordFriendsMatchBody["players"];
  users: UserRecord[];
  pointValue: number;
  centsPerPoint: number;
}

export class FriendsMatchesService {
  private readonly friendsMatchesRepository: FriendsMatchesRepository;
  private readonly usersRepository: UsersRepository;
  private readonly now: () => Date;

  constructor({ friendsMatchesRepository, usersRepository, now }: FriendsMatchesServiceInput) {
    this.friendsMatchesRepository = friendsMatchesRepository;
    this.usersRepository = usersRepository;
    this.now = now;
  }

  async record({ matchId, table, winnerId, centsPerPoint, players }: RecordInput): Promise<RecordFriendsMatchResponse> {
    const chipTable = findChipTable({ table });
    const users = await this.usersRepository.findByIds({ ids: players.map(({ userId }) => userId) });
    if (users.length !== players.length) {
      throw new ApiError({ code: "playerNotFound" });
    }
    try {
      await this.friendsMatchesRepository.create({ id: matchId, tableId: chipTable.id, pointValue: chipTable.pointValue, centsPerPoint, winnerId, finishedAt: this.now(), players });
    } catch (error) {
      if (!isUniqueConstraintViolation(error)) {
        throw error;
      }
    }
    if (centsPerPoint === null) {
      return { matchId, pixTransfers: [] };
    }
    return { matchId, pixTransfers: await this.settle({ players, users, pointValue: chipTable.pointValue, centsPerPoint }) };
  }

  private async settle({ players, users, pointValue, centsPerPoint }: SettleInput): Promise<PixTransfer[]> {
    const cents = players.map(({ userId, result }) => ({ userId, cents: Math.round((result / pointValue) * centsPerPoint) }));
    return Promise.all(
      pixTransfers(cents).map(async (transfer) => {
        const receiver = users.find(({ id }) => id === transfer.toUserId);
        if (!receiver?.cpf || !receiver.fullName) {
          throw new ApiError({ code: "playerNotFound" });
        }
        const code = pixCopyPaste({ key: receiver.cpf, name: receiver.fullName, city: receiver.address?.city ?? CITY_WITHOUT_ADDRESS, amountCents: transfer.amountCents });
        return { ...transfer, pixCopyPaste: code, qrCode: await QRCode.toDataURL(code) };
      }),
    );
  }
}
