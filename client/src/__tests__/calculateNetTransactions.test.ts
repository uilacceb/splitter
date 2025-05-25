// __tests__/calculateNetTransactions.test.ts
import {
  calculateNetTransactions,
  Transaction,
} from "../utils/calculateNetTransactions";

describe("calculateNetTransactions", () => {
  it("should offset mutual debts and return empty if equal", () => {
    const input: Transaction[] = [
      { from: "A", to: "B", amount: 10 },
      { from: "B", to: "A", amount: 10 },
    ];

    const result = calculateNetTransactions(input);
    expect(result).toEqual([]);
  });

  it("should reduce larger amount if one owes more", () => {
    const input: Transaction[] = [
      { from: "A", to: "B", amount: 15 },
      { from: "B", to: "A", amount: 5 },
    ];

    const result = calculateNetTransactions(input);
    expect(result).toEqual([{ from: "A", to: "B", amount: 10 }]);
  });

  it("should combine multiple same-direction transactions", () => {
    const input: Transaction[] = [
      { from: "A", to: "B", amount: 5 },
      { from: "A", to: "B", amount: 7 },
    ];

    const result = calculateNetTransactions(input);
    expect(result).toEqual([{ from: "A", to: "B", amount: 12 }]);
  });

  it("should handle multiple user pairs and offset appropriately", () => {
    const input: Transaction[] = [
      { from: "A", to: "B", amount: 30 },
      { from: "B", to: "A", amount: 10 },
      { from: "C", to: "A", amount: 25 },
      { from: "A", to: "C", amount: 10 },
    ];

    const result = calculateNetTransactions(input);
    expect(result).toEqual([
      { from: "A", to: "B", amount: 20 },
      { from: "C", to: "A", amount: 15 },
    ]);
  });

  it("should handle multiple user pairs and offset appropriately 2", () => {
    const input: Transaction[] = [
      { from: "R", to: "A", amount: 83.33 },
      { from: "S", to: "A", amount: 83.33 },
      { from: "L", to: "S", amount: 11 },
      { from: "A", to: "S", amount: 11 },
      { from: "S", to: "A", amount: 26.27 },
      { from: "R", to: "A", amount: 26.27 },
      { from: "S", to: "L", amount: 11 },
    ];

    const result = calculateNetTransactions(input);
    expect(result).toEqual([
      { from: "R", to: "A", amount: 109.6 },
      { from: "S", to: "A", amount: 98.6 },
    ]);
  });
});
