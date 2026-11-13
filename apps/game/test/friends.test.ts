import assert from "assert";
import { ErrorCode, type Room } from "@colyseus/sdk";
import { FRIENDS_CODE_ALPHABET, JOIN_REFUSALS } from "@pontinho/protocol";
import { editGame, flush, playerOf, setupServer, withHand, withPoints } from "./support/harness.js";

const FRIENDS = { friends: true, seats: 4, lifeJoker: true, table: 3 };

async function drop(client: Room) {
  client.reconnection.enabled = false;
  await client.leave(false);
  await flush();
}

describe("PontinhoRoom with friends", () => {
  const { api, connect, connectWith, createRoom, getTables, joinByCode, joinOrCreate, reconnect } = setupServer();

  async function friendsRoom(names: string[], options: object = FRIENDS) {
    const room = await createRoom(options);
    const clients = [];
    for (const name of names) {
      clients.push(await connect(room, name, { code: room.roomId }));
    }
    return { room, clients };
  }

  it("opens a private room whose id is a 6 character code, with the chosen seats and joker", async () => {
    const { room } = await friendsRoom(["Lucas"]);

    assert.match(room.roomId, new RegExp(`^[${FRIENDS_CODE_ALPHABET}]{6}$`));
    assert.strictEqual(room["_listing"].private, true);
    assert.strictEqual(room.state.friends, true);
    assert.strictEqual(room.state.seats, 4);
    assert.strictEqual(room.state.lifeJoker, true);
    assert.strictEqual(room.state.table, 3);
  });

  it("stays out of the table list and of joinOrCreate", async () => {
    const { room } = await friendsRoom(["Lucas"]);

    const { data } = await getTables(api.addAccount("Ana"));
    const other = await joinOrCreate(api.addAccount("Bruno"), FRIENDS);

    assert.ok(data.tables.every((listing: { players: unknown[] }) => listing.players.length === 0));
    assert.notStrictEqual(other.roomId, room.roomId);
  });

  it("lets anyone with the code in and starts by itself when the seats are full, without touching the wallet", async () => {
    const { room } = await friendsRoom(["Lucas", "Ana", "Bruno", "Carla"]);
    await room.waitForNextPatch();

    assert.strictEqual(room.state.phase, "playing");
    assert.strictEqual(room.state.countdownDuration, 0);
    assert.deepStrictEqual(api.startedMatches, []);
    assert.ok(api.playerEntries.every(({ table }) => table === undefined));
  });

  it("gives everyone the minimum of the chosen table in match chips, at its point value", async () => {
    const { room, clients } = await friendsRoom(["Lucas", "Ana", "Bruno", "Carla"]);
    await flush();

    assert.strictEqual(room.state.pointValue, 10);
    assert.deepStrictEqual(clients.map((client) => playerOf(room, client.sessionId).chipsBalance), [10_000, 10_000, 10_000, 10_000]);
  });

  it("settles the rounds among the players only, and records the result once when the match ends", async () => {
    const { room, clients } = await friendsRoom(["Lucas", "Ana", "Bruno", "Carla"], { ...FRIENDS, lifeJoker: false });
    await flush();
    const current = clients.find((client) => client.sessionId === room.state.currentTurn) ?? clients[0];
    const others = clients.filter((client) => client !== current);
    editGame(room, (game) => {
      const hands = others.reduce((edited, other) => withPoints(withHand(edited, other.sessionId, ["Q-hearts-1"]), other.sessionId, 95), withHand(game, current.sessionId, ["K-spades-1"]));
      return { ...hands, hasDrawn: true };
    });

    current.send("discard", "K-spades-1");
    await room.waitForMessage("discard");
    await flush();

    assert.strictEqual(room.state.phase, "ended");
    assert.deepStrictEqual(api.registeredRounds, []);
    assert.deepStrictEqual(api.finishedMatches, []);
    assert.strictEqual(playerOf(room, current.sessionId).chipsBalance, 10_300);
    assert.strictEqual(api.friendsMatches.length, 1);
    const [recorded] = api.friendsMatches;
    assert.strictEqual(recorded.table, 3);
    assert.strictEqual(recorded.centsPerPoint, null);
    assert.strictEqual(recorded.winnerId, api.userIdOf(playerOf(room, current.sessionId).name));
    assert.deepStrictEqual(
      recorded.players.map(({ result }) => result),
      clients.map((client) => (client === current ? 300 : -100)),
    );

    await room.disconnect();
    await flush();
    assert.strictEqual(api.friendsMatches.length, 1);
  });

  describe("with Pix settlement", () => {
    const PIX_ROOM = { ...FRIENDS, lifeJoker: false, centsPerPoint: 10 };
    const WITH_PIX = { pixSettlement: true, pixKeyRegistered: true };

    async function pixRoom(names: string[]) {
      const room = await createRoom(PIX_ROOM);
      const clients = [];
      for (const name of names) {
        clients.push(await connectWith(room, api.addAccount(name, WITH_PIX), { code: room.roomId }));
      }
      return { room, clients };
    }

    it("records the cents per point and shows who pays whom, with each Pix code", async () => {
      const { room, clients } = await pixRoom(["Lucas", "Ana", "Bruno", "Carla"]);
      await flush();
      const current = clients.find((client) => client.sessionId === room.state.currentTurn) ?? clients[0];
      const others = clients.filter((client) => client !== current);
      editGame(room, (game) => {
        const hands = others.reduce((edited, other) => withPoints(withHand(edited, other.sessionId, ["Q-hearts-1"]), other.sessionId, 95), withHand(game, current.sessionId, ["K-spades-1"]));
        return { ...hands, hasDrawn: true };
      });

      current.send("discard", "K-spades-1");
      await room.waitForMessage("discard");
      await flush();

      assert.strictEqual(room.state.centsPerPoint, 10);
      assert.strictEqual(api.friendsMatches[0].centsPerPoint, 10);
      assert.deepStrictEqual(
        room.state.pixTransfers.map(({ from, to, amountCents }) => ({ from, to, amountCents })),
        others.map((other) => ({ from: other.sessionId, to: current.sessionId, amountCents: 100 })),
      );
    });

    it("drops the Pix when someone without the flag comes in", async () => {
      const { room } = await pixRoom(["Lucas"]);

      await connect(room, "Ana", { code: room.roomId });

      assert.strictEqual(room.state.centsPerPoint, 0);
    });

    it("refuses who has the flag but no Pix key, and keeps the Pix", async () => {
      const { room } = await pixRoom(["Lucas"]);

      await assert.rejects(
        connectWith(room, api.addAccount("Ana", { pixSettlement: true }), { code: room.roomId }),
        (error: { message: string }) => error.message === JOIN_REFUSALS.pixKeyMissing.message,
      );
      assert.strictEqual(room.state.centsPerPoint, 10);
    });

    it("records a room without Pix with no cents per point and no transfers", async () => {
      const { room } = await friendsRoom(["Lucas"]);

      assert.strictEqual(room.state.centsPerPoint, 0);
      assert.strictEqual(room.state.pixTransfers.length, 0);
    });
  });

  it("starts only when the owner asks, with at least 3 seated", async () => {
    const { room, clients } = await friendsRoom(["Lucas", "Ana"]);
    clients[0].send("start");
    await flush();
    assert.strictEqual(room.state.phase, "waiting");

    clients.push(await connect(room, "Bruno", { code: room.roomId }));
    clients[1].send("start");
    await flush();
    assert.strictEqual(room.state.phase, "waiting");
    assert.strictEqual(room.state.countdownDuration, 0);

    clients[0].send("start");
    await flush();
    assert.strictEqual(room.state.phase, "playing");
    assert.strictEqual(room.state.order.length, 3);
  });

  it("passes the owner to the next in line when the owner leaves before the start", async () => {
    const { room, clients } = await friendsRoom(["Lucas", "Ana", "Bruno"]);
    await clients[0].leave();
    await connect(room, "Carla", { code: room.roomId });
    await flush();

    clients[1].send("start");
    await flush();

    assert.strictEqual(room.state.phase, "playing");
  });

  it("keeps the seat of a player who drops and lets him come back", async () => {
    const { room, clients } = await friendsRoom(["Lucas", "Ana", "Bruno", "Carla"]);
    await room.waitForNextPatch();
    const reconnectionToken = clients[1].reconnectionToken;

    await drop(clients[1]);
    assert.strictEqual(playerOf(room, clients[1].sessionId).connection, "reconnecting");

    await reconnect(reconnectionToken);
    await flush();
    assert.strictEqual(playerOf(room, clients[1].sessionId).connection, "connected");
  });

  it("tells apart a code with no room from a match that already started, as the app expects", async () => {
    const { room } = await friendsRoom(["Lucas", "Ana", "Bruno", "Carla"]);
    await room.waitForNextPatch();
    const token = api.addAccount("Edu");

    await assert.rejects(joinByCode(token, room.roomId), (error: { code: number; message: string }) => error.code === ErrorCode.MATCHMAKE_INVALID_ROOM_ID && / is locked$/.test(error.message));
    await assert.rejects(joinByCode(token, "ZZZZZZ"), (error: { code: number; message: string }) => error.code === ErrorCode.MATCHMAKE_INVALID_ROOM_ID && / not found$/.test(error.message));
  });

  it("refuses a code in the wrong format and does not create a room from a code", async () => {
    const { room } = await friendsRoom(["Lucas"]);

    await assert.rejects(connectWith(room, api.addAccount("Ana"), { code: "abc" }), (error: { message: string }) => error.message === JOIN_REFUSALS.invalidOptions.message);
    await assert.rejects(createRoom({ code: "ABCDEF" }));
    await assert.rejects(createRoom({ friends: true, seats: 7, table: 3 }));
    await assert.rejects(createRoom({ friends: true, seats: 3 }));
    await assert.rejects(createRoom({ friends: true, seats: 3, table: 8 }));
  });

  it("keeps the chips tables as strict as before", async () => {
    const room = await createRoom({ bots: false, table: 1, friends: true, seats: 3 });

    assert.strictEqual(room.state.friends, false);
    assert.strictEqual(room.state.table, 1);
    await assert.rejects(createRoom({ bots: false }));
    await assert.rejects(createRoom({ bots: false, table: 9 }));
  });
});
