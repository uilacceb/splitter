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



export function calculateMinimalSettlements(
  transactions: Transaction[]
): Transaction[] {
  if (transactions.length === 0) return [];

  // Detect "payments mode": everyone pays a common sink (e.g., "Group")
  const uniqueTos = new Set(transactions.map((t) => t.to));
  const uniqueFroms = new Set(transactions.map((t) => t.from));
  const isPaymentsMode =
    uniqueTos.size === 1 && !uniqueFroms.has([...uniqueTos][0]); // the sink never appears as "from"

  if (isPaymentsMode) {
    const pot = [...uniqueTos][0]; // e.g., "Group"
    // Build per-person payments
    const payments = new Map<string, number>();
    for (const { from, to, amount } of transactions) {
      if (to !== pot) continue; // ignore odd rows if any
      payments.set(from, (payments.get(from) ?? 0) + amount);
    }
    const people = [...payments.keys()];
    const total = people.reduce((s, p) => s + (payments.get(p) ?? 0), 0);
    const fair = total / Math.max(people.length, 1);

    // Net balances in cents (+ = is owed money; - = owes money)
    const toCents = (x: number) => Math.round(x * 100);
    const creditors: { id: string; amt: number }[] = [];
    const debtors: { id: string; amt: number }[] = [];
    for (const id of people) {
      const net = (payments.get(id) ?? 0) - fair;
      const c = toCents(net);
      if (c > 0) creditors.push({ id, amt: c });
      else if (c < 0) debtors.push({ id, amt: -c });
    }
    if (!creditors.length || !debtors.length) return [];

    creditors.sort((a, b) => b.amt - a.amt);
    debtors.sort((a, b) => b.amt - a.amt);

    const results: Transaction[] = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amt, creditors[j].amt);
      if (pay > 0) {
        results.push({
          from: debtors[i].id,
          to: creditors[j].id,
          amount: +(pay / 100).toFixed(2),
        });
        debtors[i].amt -= pay;
        creditors[j].amt -= pay;
      }
      if (debtors[i].amt === 0) i++;
      if (creditors[j].amt === 0) j++;
    }
    return results;
  }

  // ---------- Original IOU-mode (pairwise) ----------
  const netCents = new Map<string, number>();
  const toCents = (x: number) => Math.round(x * 100);

  for (const { from, to, amount } of transactions) {
    const cents = toCents(amount);
    netCents.set(from, (netCents.get(from) || 0) - cents);
    netCents.set(to, (netCents.get(to) || 0) + cents);
  }

  type Entry = { id: string; amt: number };
  const creditors: Entry[] = [];
  const debtors: Entry[] = [];
  for (const [id, cents] of netCents.entries()) {
    if (cents > 0) creditors.push({ id, amt: cents });
    else if (cents < 0) debtors.push({ id, amt: -cents });
  }
  if (!creditors.length || !debtors.length) return [];

  creditors.sort((a, b) => b.amt - a.amt);
  debtors.sort((a, b) => b.amt - a.amt);

  const results: Transaction[] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > 0) {
      results.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: +(pay / 100).toFixed(2),
      });
      debtors[i].amt -= pay;
      creditors[j].amt -= pay;
    }
    if (debtors[i].amt === 0) i++;
    if (creditors[j].amt === 0) j++;
  }
  return results;
}
