import type { RecordFriendsMatchBody, RecordFriendsMatchResponse } from "@pontinho/api-contract";
import { ApiError } from "../../common/errors/api-error.ts";
import { isUniqueConstraintViolation } from "../../common/errors/error-handler.ts";
import { findChipTable } from "../matches/find-chip-table.ts";
import type { UsersRepository } from "../users/repository/users.repository.ts";
import type { FriendsMatchesRepository } from "./repository/friends-matches.repository.ts";

interface FriendsMatchesServiceInput {
  friendsMatchesRepository: FriendsMatchesRepository;
  usersRepository: UsersRepository;
  now: () => Date;
}

interface RecordInput extends RecordFriendsMatchBody {
  matchId: string;
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

  async record({ matchId, table, winnerId, players }: RecordInput): Promise<RecordFriendsMatchResponse> {
    const chipTable = findChipTable({ table });
    const users = await this.usersRepository.findByIds({ ids: players.map(({ userId }) => userId) });
    if (users.length !== players.length) {
      throw new ApiError({ code: "playerNotFound" });
    }
    try {
      await this.friendsMatchesRepository.create({ id: matchId, tableId: chipTable.id, pointValue: chipTable.pointValue, winnerId, finishedAt: this.now(), players });
    } catch (error) {
      if (!isUniqueConstraintViolation(error)) {
        throw error;
      }
    }
    return { matchId };
  }
}
