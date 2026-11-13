import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { allBalances, seedUser } from "../../../test/support/seed.ts";
import { createTestApp } from "../../../test/support/test-app.ts";
import type { TestApp } from "../../../test/support/test-app.ts";
import { testPrisma } from "../../../test/support/test-database.ts";

describe("friends matches routes", () => {
  let testApp: TestApp;

  before(async () => {
    testApp = await createTestApp();
  });
  after(async () => testApp.app.close());
  beforeEach(async () => testApp.reset());

  function record(matchId: string, payload: unknown, headers = testApp.serviceHeaders) {
    return testApp.app.inject({ method: "PUT", url: `/internal/friends-matches/${matchId}`, headers, payload: payload as object });
  }

  async function seedPlayers() {
    return [await seedUser({ balance: 500 }), await seedUser({ balance: 500 }), await seedUser({ balance: 500 })];
  }

  function recorded(matchId: string) {
    return testPrisma.friendsMatch.findUnique({
      where: { id: matchId },
      select: { tableId: true, pointValue: true, winnerId: true, players: { select: { userId: true, result: true }, orderBy: { result: "desc" } } },
    });
  }

  it("records the table, the winner and the chips each player won or lost, without touching the wallet", async () => {
    const [winner, second, third] = await seedPlayers();
    const balances = await allBalances();
    const matchId = randomUUID();

    const response = await record(matchId, {
      table: 3,
      winnerId: winner,
      centsPerPoint: null,
      players: [
        { userId: winner, result: 300 },
        { userId: second, result: -100 },
        { userId: third, result: -200 },
      ],
    });

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), { matchId, pixTransfers: [] });
    assert.deepStrictEqual(await recorded(matchId), {
      tableId: 3,
      pointValue: 10,
      winnerId: winner,
      players: [
        { userId: winner, result: 300 },
        { userId: second, result: -100 },
        { userId: third, result: -200 },
      ],
    });
    assert.deepStrictEqual(await allBalances(), balances);
  });

  it("settles a Pix match with one static Pix per transfer, paid to the CPF of who receives", async () => {
    const [winner, second, third] = await seedPlayers();
    await testPrisma.user.update({ where: { id: winner }, data: { fullName: "Ana Souza", cpf: "11144477735", address: { postalCode: "01001000", street: "Praça da Sé", number: "1", complement: "", district: "Sé", city: "São Paulo", state: "SP" } } });
    const matchId = randomUUID();

    const response = await record(matchId, {
      table: 3,
      winnerId: winner,
      centsPerPoint: 10,
      players: [
        { userId: winner, result: 300 },
        { userId: second, result: -100 },
        { userId: third, result: -200 },
      ],
    });

    const transfers = response.json().pixTransfers;
    assert.deepStrictEqual(
      transfers.map(({ fromUserId, toUserId, amountCents }: { fromUserId: string; toUserId: string; amountCents: number }) => ({ fromUserId, toUserId, amountCents })),
      [
        { fromUserId: third, toUserId: winner, amountCents: 200 },
        { fromUserId: second, toUserId: winner, amountCents: 100 },
      ],
    );
    assert.ok(transfers[0].pixCopyPaste.includes("011111144477735"));
    assert.ok(transfers[0].pixCopyPaste.includes("54042.005802BR5909Ana Souza6009Sao Paulo"));
    assert.ok(transfers[0].qrCode.startsWith("data:image/png;base64,"));
    assert.strictEqual((await testPrisma.friendsMatch.findUnique({ where: { id: matchId } }))?.centsPerPoint, 10);
  });

  it("records a match that ended without a winner", async () => {
    const players = await seedPlayers();
    const matchId = randomUUID();

    const response = await record(matchId, { table: 1, winnerId: null, centsPerPoint: null, players: players.map((userId) => ({ userId, result: 0 })) });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual((await recorded(matchId))?.winnerId, null);
  });

  it("records only once when the game server repeats the call", async () => {
    const players = await seedPlayers();
    const matchId = randomUUID();
    const body = { table: 1, winnerId: players[0], centsPerPoint: null, players: players.map((userId, seat) => ({ userId, result: seat === 0 ? 2 : -1 })) };

    await record(matchId, body);
    const repeated = await record(matchId, body);

    assert.strictEqual(repeated.statusCode, 200);
    assert.strictEqual(await testPrisma.friendsMatchPlayer.count(), 3);
  });

  it("refuses a player who has no account, a table that does not exist and a winner who did not play", async () => {
    const players = await seedPlayers();
    const results = players.map((userId) => ({ userId, result: 0 }));

    const unknownPlayer = await record(randomUUID(), { table: 1, winnerId: null, centsPerPoint: null, players: [...results.slice(1), { userId: randomUUID(), result: 0 }] });
    const unknownTable = await record(randomUUID(), { table: 9, winnerId: null, centsPerPoint: null, players: results });
    const outsideWinner = await record(randomUUID(), { table: 1, winnerId: randomUUID(), centsPerPoint: null, players: results });

    assert.deepStrictEqual([unknownPlayer.statusCode, unknownPlayer.json().code], [404, "playerNotFound"]);
    assert.deepStrictEqual([unknownTable.statusCode, unknownTable.json().code], [422, "tableNotFound"]);
    assert.deepStrictEqual([outsideWinner.statusCode, outsideWinner.json().code], [400, "validationFailed"]);
    assert.strictEqual(await testPrisma.friendsMatch.count(), 0);
  });

  it("asks for the service token", async () => {
    const players = await seedPlayers();

    const response = await record(randomUUID(), { table: 1, winnerId: null, centsPerPoint: null, players: players.map((userId) => ({ userId, result: 0 })) }, {});

    assert.strictEqual(response.statusCode, 401);
  });
});
