import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";
import { PencilLine, Trash2 } from "lucide-react";

type User = {
  _id: string;
  name: string;
  picture: string;
};

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: User;
  splitWith: User[];
  createdAt: string;
};

type Transaction = {
  from: string;
  to: string;
  amount: number;
};

const EventInfoPage = () => {
  const { eventId, groupId } = useParams<{
    eventId: string;
    groupId: string;
  }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await axios.get(`/api/events/${eventId}`);
        setEventTitle(res.data.title);
      } catch (error) {
        console.error("Failed to fetch event title", error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const res = await axios.get(`/api/expenses?eventId=${eventId}`);
        setExpenses(res.data);
        generateTransactions(res.data);
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      }
    };

    fetchEventDetails();
    fetchExpenses();
  }, [eventId]);

  const generateTransactions = (expenses: Expense[]) => {
    const rawTxs: Transaction[] = [];
    const userMapTemp: Record<string, User> = {};

    expenses.forEach((expense) => {
      const payer = expense.paidBy;
      const splitAmount = expense.amount / expense.splitWith.length;

      userMapTemp[payer._id] = payer;

      expense.splitWith.forEach((user) => {
        userMapTemp[user._id] = user;

        if (user._id !== payer._id) {
          rawTxs.push({
            from: user._id,
            to: payer._id,
            amount: splitAmount,
          });
        }
      });
    });

    // Combine transactions with same from-to pair
    const combinedMap: Record<string, Transaction> = {};

    rawTxs.forEach((tx) => {
      const key = `${tx.from}->${tx.to}`;
      if (!combinedMap[key]) {
        combinedMap[key] = { ...tx };
      } else {
        combinedMap[key].amount += tx.amount;
      }
    });

    const combinedTxs = Object.values(combinedMap);

    setUserMap(userMapTemp);
    setTransactions(combinedTxs);
  };

  const getTotalAmount = () =>
    expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2);

  const handleDelete = async (expenseId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/api/expenses/${expenseId}`);
      setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    } catch (error) {
      console.error("Failed to delete expense", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  return (
    <div className="p-4 relative">
      <GoBack />

      <div className="flex justify-end mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#39625C] text-white rounded hover:bg-[#83A99B]"
          onClick={() =>
            navigate(`/groups/${groupId}/events/${eventId}/add-expense`)
          }
        >
          Add Expense
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-3xl font-semibold">{eventTitle}</h2>
        <PencilLine
          className="text-gray-500 cursor-pointer"
          onClick={() => navigate(`/groups/${groupId}/events/${eventId}/edit`)}
        />
      </div>

      <div className="text-xl font-medium mb-4 text-green-700">
        Total Expenses: ${getTotalAmount()}
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Transaction:</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {transactions.map((tx, idx) => (
              <li
                key={idx}
                className="bg-gray-100 p-3 rounded shadow-sm grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={userMap[tx.from]?.picture}
                    alt="from"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold truncate">
                    {userMap[tx.from]?.name.split(" ")[0] || "Unknown"}
                  </span>
                </div>
                <span className="text-md text-center text-red-500 font-semibold">
                  owes
                </span>

                <div className="flex items-center gap-2">
                  <img
                    src={userMap[tx.to]?.picture}
                    alt="to"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className=" font-semibold truncate">
                    {userMap[tx.to]?.name.split(" ")[0] || "Unknown"}
                  </span>
                </div>

                <span className="text-md text-green-800 text-right font-semibold">
                  ${tx.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="text-xl font-medium mb-2">
        Expenses ({expenses.length}):
      </h2>
      {expenses.length === 0 ? (
        <p>No expenses recorded for this event.</p>
      ) : (
        <ul className="space-y-4">
          {expenses.map((expense) => (
            <li
              key={expense._id}
              className="border rounded p-4 bg-gray-50 shadow-sm flex justify-between items-center"
            >
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() =>
                  navigate(
                    `/groups/${groupId}/events/${eventId}/expenses/${expense._id}`
                  )
                }
              >
                <img
                  src={expense.paidBy?.picture}
                  alt="payer"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-lg font-semibold">{expense.description}</p>
                  <p className="text-sm text-gray-600">
                    Paid by {expense.paidBy.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-green-700 text-lg">
                  ${expense.amount.toFixed(2)}
                </span>
                {expense.paidBy._id === currentUser._id && (
                  <div className="flex gap-2">
                    <PencilLine
                      className="text-gray-500 hover:text-blue-600 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/groups/${groupId}/events/${eventId}/edit-expense/${expense._id}`
                        )
                      }
                    />
                    <Trash2
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={() => handleDelete(expense._id)}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventInfoPage;
