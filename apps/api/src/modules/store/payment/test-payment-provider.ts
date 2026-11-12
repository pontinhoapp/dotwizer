import type { PurchaseStatus } from "../../../generated/prisma/enums.ts";
import type { ChargeInput, ChargeResult, PaymentProvider, StatusInput } from "./payment-provider.ts";

export const TEST_PAYMENT_DELAY_MS = 5000;

export class TestPaymentProvider implements PaymentProvider {
  readonly name = "TEST";

  async charge({ purchaseId }: ChargeInput): Promise<ChargeResult> {
    return { providerTransactionId: `test:${purchaseId}`, status: "PENDING", pixCopyPaste: `DOTWIZER-PIX-TESTE-${purchaseId}` };
  }

  async status({ createdAt, now }: StatusInput): Promise<PurchaseStatus> {
    if (now.getTime() - createdAt.getTime() < TEST_PAYMENT_DELAY_MS) {
      return "PENDING";
    }
    return "PAID";
  }
}
