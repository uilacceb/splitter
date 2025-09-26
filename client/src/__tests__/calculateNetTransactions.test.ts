import {
  calculateMinimalSettlements,
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

  it("should handle multiple user pairs and offset appropriately (case 2)", () => {
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

  it("should handle multiple user pairs and offset appropriately (case 3)", () => {
    const input: Transaction[] = [
      { from: "Z", to: "A", amount: 25 },
      { from: "J", to: "A", amount: 25 },
      { from: "R", to: "Z", amount: 50 },
      { from: "A", to: "Z", amount: 50 },
      { from: "J", to: "Z", amount: 50 },
    ];

    const result = calculateNetTransactions(input);

    expect(
      result.sort(
        (a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)
      )
    ).toEqual(
      [
        { from: "A", to: "Z", amount: 25 },
        { from: "J", to: "A", amount: 25 },
        { from: "J", to: "Z", amount: 50 },
        { from: "R", to: "Z", amount: 50 },
      ].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to))
    );
  });

  it("should handle one payer vs. multiple payers using calculateMinimalSettlements", () => {
    // Andy paid 60, Aileen paid 400.88, Zach paid 221
    // Expected: Andy owes Aileen 167.29, Zach owes Aileen 6.29
    const transactions: Transaction[] = [
      { from: "Andy", to: "Group", amount: 60 },
      { from: "Zach", to: "Group", amount: 221 },
      { from: "Aileen", to: "Group", amount: 400.88 },
    ];

    const result = calculateMinimalSettlements(transactions);
    const sorted = result.sort((a, b) => a.from.localeCompare(b.from));

    expect(sorted).toEqual([
      { from: "Andy", to: "Aileen", amount: 167.29 },
      { from: "Zach", to: "Aileen", amount: 6.29 },
    ]);
  });
  it("should handle one payer vs. multiple payers using calculateMinimalSettlements2", () => {
    const transactions: Transaction[] = [
      { from: "Andy", to: "Group", amount: 60 },
      { from: "Zach", to: "Group", amount: 20 },
      { from: "Aileen", to: "Group", amount: 40 },
    ];

    const result = calculateMinimalSettlements(transactions);

    expect(result).toEqual([
      { from: "Zach", to: "Andy", amount: 20 },
    ]);
  });
});
