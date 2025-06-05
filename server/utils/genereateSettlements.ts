import { Types } from "mongoose";
import Settlement from "../models/Settlement";
import Expense from "../models/Expense";

export async function generateSettlements(eventId: Types.ObjectId) {
  // Get all expenses for this event
  const expenses = await Expense.find({ eventId })
    .populate("paidBy", "_id")
    .populate("splitWith", "_id");

  // Build raw transactions (who owes who)
  const rawTxs: Record<string, number> = {};
  expenses.forEach((expense: any) => {
    const payer = expense.paidBy._id.toString();
    const splitAmount = expense.amount / expense.splitWith.length;
    (expense.splitWith as { _id: Types.ObjectId }[]).forEach((user) => {
      if (user._id.toString() !== payer) {
        const key = `${user._id}->${payer}`;
        rawTxs[key] = (rawTxs[key] || 0) + splitAmount;
      }
    });
  });

  // Combine mutual debts
  const netBalances: Record<string, number> = {};
  for (const [key, amount] of Object.entries(rawTxs)) {
    const [from, to] = key.split("->");
    const reverseKey = `${to}->${from}`;
    const net = (amount || 0) - (rawTxs[reverseKey] || 0);
    if (net > 0) netBalances[key] = net;
  }

  // Subtract all settled amounts
  const settledRecords = await Settlement.find({ eventId, settled: true });
  for (const rec of settledRecords) {
    const key = `${rec.from}->${rec.to}`;
    if (netBalances[key]) {
      netBalances[key] -= rec.amount;
      if (netBalances[key] <= 0) delete netBalances[key];
    }
  }

  // Remove all existing unsettled settlements for this event
  await Settlement.deleteMany({ eventId, settled: false });

  // Create new unsettled settlements
  for (const [key, amount] of Object.entries(netBalances)) {
    const [from, to] = key.split("->");
    await Settlement.create({
      eventId,
      from,
      to,
      amount,
      settled: false,
    });
  }
}
