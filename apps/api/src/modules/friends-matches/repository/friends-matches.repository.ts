import type { DatabaseClient } from "../../../common/database/database-client.ts";

interface CreateInput {
  id: string;
  tableId: number;
  pointValue: number;
  winnerId: string | null;
  finishedAt: Date;
  players: { userId: string; result: number }[];
}

export class FriendsMatchesRepository {
  private readonly client: DatabaseClient;

  constructor({ client }: { client: DatabaseClient }) {
    this.client = client;
  }

  async create({ players, ...match }: CreateInput): Promise<void> {
    await this.client.friendsMatch.create({ data: { ...match, players: { create: players } }, select: { id: true } });
  }
}
