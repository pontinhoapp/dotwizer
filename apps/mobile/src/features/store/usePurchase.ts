import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { ApiError } from "@/shared/api/client";
import { buyChips, getPurchase } from "@/shared/api/store";
import { walletQueryOptions } from "@/shared/api/wallet";
import errors from "@/messages/errors.json";

const PAYMENT_CHECK_MS = 2000;

type Attempt = { quantity: number; idempotencyKey: string };

function purchaseError(error: Error | null) {
  if (!error) {
    return "";
  }
  if (error instanceof ApiError && error.kind === "timeout") {
    return errors.purchaseUnconfirmed;
  }
  return error.message;
}

export function usePurchase() {
  const queryClient = useQueryClient();
  const attempt = useRef<Attempt>(undefined);

  function keyFor(quantity: number) {
    if (attempt.current?.quantity !== quantity) {
      attempt.current = { quantity, idempotencyKey: randomUUID() };
    }
    return attempt.current.idempotencyKey;
  }

  const mutation = useMutation({
    mutationFn: (quantity: number) => buyChips({ quantity, idempotencyKey: keyFor(quantity) }),
    onSuccess: () => {
      attempt.current = undefined;
    },
    onSettled: () => queryClient.invalidateQueries(walletQueryOptions()),
  });
  const pendingId = mutation.data?.status === "PENDING" ? mutation.data.id : undefined;
  const payment = useQuery({
    queryKey: ["store", "purchase", pendingId],
    queryFn: async () => {
      const purchase = await getPurchase(pendingId ?? "");
      if (purchase.status === "PAID") {
        queryClient.invalidateQueries(walletQueryOptions());
      }
      return purchase;
    },
    enabled: pendingId !== undefined,
    refetchInterval: (query) => (query.state.data?.status === "PAID" ? false : PAYMENT_CHECK_MS),
  });
  const current = payment.data ?? mutation.data;

  return {
    buy: (quantity: number) => mutation.mutate(quantity),
    pending: mutation.isPending,
    pix: current?.status === "PENDING" ? current.pix : null,
    purchasedQuantity: current?.status === "PAID" ? current.quantity : undefined,
    clear: () => mutation.reset(),
    error: purchaseError(mutation.error),
  };
}

export type Purchase = ReturnType<typeof usePurchase>;
