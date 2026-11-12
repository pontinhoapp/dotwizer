import assert from "node:assert";
import { TEST_PAYMENT_DELAY_MS, TestPaymentProvider } from "./test-payment-provider.ts";

describe("TestPaymentProvider", () => {
  const provider = new TestPaymentProvider();
  const createdAt = new Date("2026-11-12T15:00:00Z");

  it("leaves the purchase pending, without charging, with a test pix derived from the purchase", async () => {
    const result = await provider.charge({ purchaseId: "p-1", userId: "u-1", quantity: 1_000, amountCents: 100_000 });

    assert.deepStrictEqual(result, { providerTransactionId: "test:p-1", status: "PENDING", pixCopyPaste: "DOTWIZER-PIX-TESTE-p-1" });
    assert.strictEqual(provider.name, "TEST");
  });

  it("approves the purchase once the test delay has passed", async () => {
    const before = await provider.status({ providerTransactionId: "test:p-1", createdAt, now: new Date(createdAt.getTime() + TEST_PAYMENT_DELAY_MS - 1) });
    const after = await provider.status({ providerTransactionId: "test:p-1", createdAt, now: new Date(createdAt.getTime() + TEST_PAYMENT_DELAY_MS) });

    assert.strictEqual(before, "PENDING");
    assert.strictEqual(after, "PAID");
  });
});
