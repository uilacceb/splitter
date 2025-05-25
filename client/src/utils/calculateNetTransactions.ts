// utils/calculateNetTransactions.ts
export type Transaction = {
  from: string;
  to: string;
  amount: number;
};

export function calculateNetTransactions(
  transactions: Transaction[]
): Transaction[] {
  const combinedMap: Record<string, number> = {};

  // Step 1: Combine transactions by key
  transactions.forEach(({ from, to, amount }) => {
    const key = `${from}->${to}`;
    combinedMap[key] = (combinedMap[key] || 0) + amount;
  });

  // Step 2: Offset mutual transactions
  const result: Transaction[] = [];
  const seen = new Set<string>();

  for (const key in combinedMap) {
    if (seen.has(key)) continue;

    const [from, to] = key.split("->");
    const reverseKey = `${to}->${from}`;
    const forward = combinedMap[key];
    const backward = combinedMap[reverseKey] || 0;

    if (forward > backward) {
      result.push({
        from,
        to,
        amount: parseFloat((forward - backward).toFixed(2)),
      });
    } else if (backward > forward) {
      result.push({
        from: to,
        to: from,
        amount: parseFloat((backward - forward).toFixed(2)),
      });
    }

    seen.add(key);
    seen.add(reverseKey);
  }

  return result;
}
