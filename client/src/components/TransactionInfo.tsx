import React from "react";

type Transaction = {
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
  const type = transactions[0]?.type;

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4">
        {type === "owe" ? (
          <>
            You owe <span className="text-red-600 font-bold">${total}</span> in
            total
          </>
        ) : (
          <>
            You are expecting{" "}
            <span className="text-blue-600 font-bold">${total}</span> in total
            from
          </>
        )}
      </h2>

      <ul className="space-y-4">
        {transactions.map((tx, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border-b pb-2"
          >
            <div className="flex items-center gap-4">
              <img
                src={tx.picture || "/placeholder.jpg"}
                alt={tx.name}
                className="w-10 h-10 rounded-full bg-gray-200"
              />
              <p className="text-lg font-medium">{tx.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {type === "owe" ? "you owe" : "owes you"}
              </p>
              <p
                className={`font-semibold ${
                  type === "owe" ? "text-red-600" : "text-blue-600"
                }`}
              >
                ${tx.amount.toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionInfo;
