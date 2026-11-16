import assert from "node:assert";
import { pixTransfers } from "./pix-transfers.ts";

describe("pixTransfers", () => {
  it("pays the only winner from each loser", () => {
    const transfers = pixTransfers([
      { userId: "ana", cents: 900 },
      { userId: "bia", cents: -500 },
      { userId: "caio", cents: -400 },
    ]);

    assert.deepStrictEqual(transfers, [
      { fromUserId: "bia", toUserId: "ana", amountCents: 500 },
      { fromUserId: "caio", toUserId: "ana", amountCents: 400 },
    ]);
  });

  it("matches the largest debt with the largest credit, splitting when needed", () => {
    const transfers = pixTransfers([
      { userId: "ana", cents: 600 },
      { userId: "bia", cents: 300 },
      { userId: "caio", cents: -700 },
      { userId: "davi", cents: -200 },
    ]);

    assert.deepStrictEqual(transfers, [
      { fromUserId: "caio", toUserId: "ana", amountCents: 600 },
      { fromUserId: "caio", toUserId: "bia", amountCents: 100 },
      { fromUserId: "davi", toUserId: "bia", amountCents: 200 },
    ]);
  });

  it("returns no transfer when nobody won or lost", () => {
    assert.deepStrictEqual(pixTransfers([{ userId: "ana", cents: 0 }, { userId: "bia", cents: 0 }]), []);
  });
});
