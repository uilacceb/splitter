import React from "react";

export type Transaction = {
  name: string;
  amount: number;
  type: "owe" | "expect";
  picture?: string;
};

type Props = {
  transactions: Transaction[];
};

const TransactionInfo = ({ transactions }: Props) => {
  const total = transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2);

  return (
    <div className="p-5 bg-white rounded-md pb-8 md:pb-16">
      <h2 className="text-lg font-semibold mb-4 md:text-3xl md:pb-4">
        Transactions Summary:
      </h2>
      <ul className="space-y-4">
        {transactions.map((tx, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border-b pb-2"
          >
            <div className="flex items-center gap-4 ">
              <img
                src={tx.picture || "/placeholder.jpg"}
                alt={tx.name}
                className="w-10 h-10 rounded-full bg-gray-200"
              />
              <p className="text-lg font-medium md:text-2xl">{tx.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 md:text-2xl">
                {tx.amount < 0 ? "you owe" : "owes you"}
              </p>
              <p
                className={`font-semibold md:text-2xl ${
                  tx.amount < 0 ? "text-red-600" : "text-blue-600"
                }`}
              >
                ${Math.abs(tx.amount).toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionInfo;
