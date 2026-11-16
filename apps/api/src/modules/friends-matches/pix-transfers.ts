interface PlayerCents {
  userId: string;
  cents: number;
}

export interface Transfer {
  fromUserId: string;
  toUserId: string;
  amountCents: number;
}

function largestFirst(players: PlayerCents[]) {
  return players.toSorted((a, b) => b.cents - a.cents);
}

export function pixTransfers(players: PlayerCents[]): Transfer[] {
  const debtors = largestFirst(players.filter(({ cents }) => cents < 0).map(({ userId, cents }) => ({ userId, cents: -cents })));
  const creditors = largestFirst(players.filter(({ cents }) => cents > 0).map((player) => ({ ...player })));
  const transfers: Transfer[] = [];
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      const amountCents = Math.min(debtor.cents, creditor.cents);
      if (amountCents === 0) {
        continue;
      }
      transfers.push({ fromUserId: debtor.userId, toUserId: creditor.userId, amountCents });
      debtor.cents -= amountCents;
      creditor.cents -= amountCents;
    }
  }
  return transfers;
}
