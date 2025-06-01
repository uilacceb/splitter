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

type Settlement = {
  _id: string;
  from: User;
  to: User;
  amount: number;
  settled: boolean;
};

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: User;
  splitWith: User[];
  createdAt: string;
};

const EventInfoPage = () => {
  const { eventId, groupId } = useParams<{
    eventId: string;
    groupId: string;
  }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch event info
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await axios.get(`/api/events/${eventId}`);
        setEventTitle(res.data.title);
      } catch (error) {
        console.error("Failed to fetch event title", error);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  // Fetch expenses (for listing)
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get(`/api/expenses?eventId=${eventId}`);
        setExpenses(res.data);
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      }
    };
    fetchExpenses();
  }, [eventId]);

  // Fetch settlements (transactions)
  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const res = await axios.get(`/api/settlements?eventId=${eventId}`);
        setSettlements(res.data);
      } catch (error) {
        console.error("Failed to fetch settlements", error);
      }
    };
    fetchSettlements();
  }, [eventId]);

  // Settle a transaction
  const handleSettle = async (id: string) => {
    try {
      await axios.put(`/api/settlements/${id}/settle`, { settled: true });
      setSettlements((prev) =>
        prev.map((s) => (s._id === id ? { ...s, settled: true } : s))
      );
      // Refetch to avoid any desync
      const res = await axios.get(`/api/settlements?eventId=${eventId}`);
      setSettlements(res.data);
    } catch (error) {
      alert("Failed to settle transaction");
    }
  };

  // Unsettle a transaction
  const handleUnsettle = async (id: string) => {
    try {
      await axios.put(`/api/settlements/${id}/settle`, { settled: false });
      setSettlements((prev) =>
        prev.map((s) => (s._id === id ? { ...s, settled: false } : s))
      );
      // Refetch to avoid any desync
      const res = await axios.get(`/api/settlements?eventId=${eventId}`);
      setSettlements(res.data);
    } catch (error) {
      alert("Failed to unsettle transaction");
    }
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
      // Re-fetch settlements (since transactions may have changed)
      const res = await axios.get(`/api/settlements?eventId=${eventId}`);
      setSettlements(res.data);
    } catch (error) {
      alert("Failed to delete expense. Please try again.");
    }
  };

  const unsettled = settlements.filter((s) => !s.settled);
  const settled = settlements.filter((s) => s.settled);

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

      {/* Unsettled Transactions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Unsettled Transactions:</h3>
        {unsettled.length === 0 ? (
          <p>No unsettled transactions.</p>
        ) : (
          <ul className="space-y-3">
            {unsettled.map((tx) => (
              <li
                key={tx._id}
                className="bg-gray-100 p-3 rounded shadow-sm grid grid-cols-[1fr_auto] items-center gap-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <img
                    src={tx.from.picture}
                    alt="from"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold truncate">
                    {tx.from.name.split(" ")[0] || "Unknown"}
                  </span>
                  <span className="text-red-500 mx-2">owes</span>
                  <img
                    src={tx.to.picture}
                    alt="to"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold truncate">
                    {tx.to.name.split(" ")[0] || "Unknown"}
                  </span>
                  <span className="text-green-800 ml-2">
                    ${tx.amount.toFixed(2)}
                  </span>
                </div>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleSettle(tx._id)}
                  disabled={tx.settled}
                >
                  Settle
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Settled Transactions */}
        <h3 className="text-lg font-semibold mt-8 mb-2">
          Settled Transactions:
        </h3>
        {settled.length === 0 ? (
          <p>No settled transactions.</p>
        ) : (
          <ul className="space-y-3">
            {settled.map((tx) => (
              <li
                key={tx._id}
                className="bg-gray-200 p-3 rounded shadow-sm grid grid-cols-[1fr_auto] items-center gap-2 opacity-60"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <img
                    src={tx.from.picture}
                    alt="from"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold truncate">
                    {tx.from.name.split(" ")[0] || "Unknown"}
                  </span>
                  <span className="text-red-500 mx-2">owes</span>
                  <img
                    src={tx.to.picture}
                    alt="to"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold truncate">
                    {tx.to.name.split(" ")[0] || "Unknown"}
                  </span>
                  <span className="text-green-800 ml-2">
                    ${tx.amount.toFixed(2)}
                  </span>
                </div>
                <button
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-600"
                  onClick={() => handleUnsettle(tx._id)}
                  disabled={!tx.settled}
                >
                  Unsettle
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Expenses Section */}
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
