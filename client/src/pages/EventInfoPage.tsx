// src/pages/EventInfoPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";
import { PencilLine, Trash2 } from "lucide-react";
import TransactionInfo, { Transaction } from "../components/TransactionInfo";
import { calculateMinimalSettlements } from "../utils/calculateNetTransactions";

// ⬇️ Import your minimal-settlement util (keep your existing pairwise util as-is)

// If you still want the pairwise-offset util for other screens, keep it separate:
// import { calculateNetTransactions } from "../utils/calculateNetTransactions";

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

// Util input type for the minimal-settlement algorithm
type UtilTxn = { from: string; to: string; amount: number };

const EventInfoPage = () => {
  const { eventId, groupId } = useParams<{
    eventId: string;
    groupId: string;
  }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<Transaction[]>(
    []
  );
  const [useMinimal, setUseMinimal] = useState<boolean>(false);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}") as User;

  // ------- helpers -------
  function settlementsToTransactions(
    rows: Settlement[],
    currentUserId: string
  ): Transaction[] {
    const transactions: Transaction[] = [];
    rows.forEach((s) => {
      if (s.from._id === currentUserId) {
        transactions.push({
          name: s.to.name,
          amount: -s.amount,
          type: "owe",
          picture: s.to.picture,
        });
      } else if (s.to._id === currentUserId) {
        transactions.push({
          name: s.from.name,
          amount: s.amount,
          type: "expect",
          picture: s.from.picture,
        });
      }
    });
    return transactions;
  }

  // ------- data fetchers -------
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/events/${eventId}`
        );
        setEventTitle(res.data.title);
      } catch (error) {
        console.error("Failed to fetch event title", error);
      }
    };
    if (eventId) fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/expenses?eventId=${eventId}`
        );
        setExpenses(res.data);
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      }
    };
    if (eventId) fetchExpenses();
  }, [eventId]);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/settlements?eventId=${eventId}`
        );
        setSettlements(res.data);
      } catch (error) {
        console.error("Failed to fetch settlements", error);
      }
    };
    if (eventId) fetchSettlements();
  }, [eventId]);

  // Summary bar (your TransactionInfo widget)
  useEffect(() => {
    setTransactionSummary(
      settlementsToTransactions(
        settlements.filter((s) => !s.settled),
        currentUser?._id || ""
      )
    );
  }, [settlements, currentUser?._id]);

  // ------- actions -------
  const handleSettle = async (id: string) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/settlements/${id}/settle`,
        { settled: true, userId: currentUser._id }
      );

      if (res.data && res.data.success === false && res.data.error) {
        alert(res.data.error);
        return;
      }

      const updated = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/settlements?eventId=${eventId}`
      );
      setSettlements(updated.data);
      window.dispatchEvent(new Event("settlementsChanged"));
    } catch {
      alert("Failed to settle transaction");
    }
  };

  const handleUnsettle = async (id: string) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/settlements/${id}/settle`,
        { settled: false, userId: currentUser._id }
      );

      if (res.data && res.data.success === false && res.data.error) {
        alert(res.data.error);
        return;
      }

      const updated = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/settlements?eventId=${eventId}`
      );
      setSettlements(updated.data);
      window.dispatchEvent(new Event("settlementsChanged"));
    } catch {
      alert("Failed to unsettle transaction");
    }
  };

  const handleDelete = async (expenseId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/expenses/${expenseId}`
      );
      setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/settlements?eventId=${eventId}`
      );
      setSettlements(res.data);
      window.dispatchEvent(new Event("settlementsChanged"));
    } catch {
      alert("Failed to delete expense. Please try again.");
    }
  };

  const getTotalAmount = () =>
    expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2);

  // ------- minimal preview computation -------
  const unsettled = useMemo(
    () => settlements.filter((s) => !s.settled),
    [settlements]
  );
  const settledRows = useMemo(
    () => settlements.filter((s) => s.settled),
    [settlements]
  );

  // Build a participant map for avatars/names in minimal mode
  const participantMap = useMemo(() => {
    const map = new Map<string, User>();
    unsettled.forEach((s) => {
      map.set(s.from._id, s.from);
      map.set(s.to._id, s.to);
    });
    return map;
  }, [unsettled]);

  // Convert unsettled DB rows into util input
  const unsettledUtilTxns: UtilTxn[] = useMemo(
    () =>
      unsettled.map((s) => ({
        from: s.from._id,
        to: s.to._id,
        amount: s.amount,
      })),
    [unsettled]
  );

  // Compute minimal view (client-only)
  const minimalView = useMemo(() => {
    if (!useMinimal) return [];
    return calculateMinimalSettlements(unsettledUtilTxns);
  }, [useMinimal, unsettledUtilTxns]);

  return (
    <div className="p-4 relative lg:p-12">
      <GoBack />

      <div className="flex justify-end mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#39625C] text-white rounded hover:bg-[#83A99B] md:text-2xl"
          onClick={() =>
            navigate(`/groups/${groupId}/events/${eventId}/add-expense`)
          }
        >
          Add Expense
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-3xl font-semibold md:text-4xl">{eventTitle}</h2>
        <PencilLine
          className="text-gray-500 cursor-pointer"
          onClick={() => navigate(`/groups/${groupId}/events/${eventId}/edit`)}
        />
      </div>

      <div className="text-xl font-medium mb-4 text-green-700 md:text-2xl">
        Total Expenses: ${getTotalAmount()}
      </div>

      {/* --- TransactionInfo summary (your widget) --- */}
      <div className="mb-8">
        <TransactionInfo transactions={transactionSummary} />
      </div>

      {/* -------- Unsettled Transactions -------- */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-3">
          <h3 className="text-lg font-semibold md:text-2xl">
            Unsettled Transactions:
          </h3>
          <label className="flex items-center space-x-1 pl-3">
            <input
              type="checkbox"
              className="w-6 h-6"
              checked={useMinimal}
              onChange={(e) => setUseMinimal(e.target.checked)}
            />
            <span className="text-xl">Minimal transactions</span>
          </label>
        </div>

        {/* Minimal preview mode (view-only) */}
        {useMinimal ? (
          minimalView.length > 0 ? (
            <>
              <div className="text-sm text-gray-600 mb-2 md:text-lg">
                Previewing minimal settlements (view-only). Toggle off to settle
                items individually.
              </div>
              <ul className="space-y-3 md:space-y-5">
                {minimalView.map((t: any, idx: any) => {
                  const from = participantMap.get(t.from);
                  const to = participantMap.get(t.to);
                  return (
                    <li
                      key={idx}
                      className="bg-gray-100 p-3 rounded shadow-sm grid grid-cols-[1fr_auto] items-center gap-2 md:text-2xl"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <img
                          src={from?.picture || ""}
                          alt="from"
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-semibold truncate">
                          {from?.name.split(" ")[0] || "Unknown"}
                        </span>
                        <span className="text-red-500 mx-2">owes</span>
                        <img
                          src={to?.picture || ""}
                          alt="to"
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-semibold truncate">
                          {to?.name.split(" ")[0] || "Unknown"}
                        </span>
                        <span className="text-green-800 ml-2">
                          ${t.amount.toFixed(2)}
                        </span>
                      </div>
                      {/* No "Settle" button in preview mode */}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="md:text-2xl">No unsettled transactions.</p>
          )
        ) : // Normal mode: show actual unsettled with Settle buttons
        unsettled.length === 0 ? (
          <p className="md:text-2xl">No unsettled transactions.</p>
        ) : (
          <ul className="space-y-3 md:space-y-5">
            {unsettled.map((tx) => (
              <li
                key={tx._id}
                className="bg-gray-100 p-3 rounded shadow-sm grid grid-cols-[1fr_auto] items-center gap-2 md:text-2xl"
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
                <div>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleSettle(tx._id)}
                    disabled={tx.settled}
                  >
                    Settle
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* -------- Settled Transactions -------- */}
      <h3 className="text-lg font-semibold mt-8 mb-2 md:text-2xl">
        Settled Transactions:
      </h3>
      {settledRows.length === 0 ? (
        <p className="md:text-2xl">No settled transactions.</p>
      ) : (
        <ul className="space-y-3 md:space-y-5">
          {settledRows.map((tx) => (
            <li
              key={tx._id}
              className="bg-gray-200 p-3 rounded shadow-sm grid grid-cols-[1fr_auto] items-center gap-2 opacity-60 md:text-2xl"
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
              <div>
                <button
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-600"
                  onClick={() => handleUnsettle(tx._id)}
                  disabled={!tx.settled}
                >
                  Unsettle
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* -------- Expenses Section -------- */}
      <h2 className="text-xl font-medium mb-2 md:text-2xl">
        Expenses ({expenses.length}):
      </h2>
      {expenses.length === 0 ? (
        <p className="md:text-2xl">No expenses recorded for this event.</p>
      ) : (
        <ul className="space-y-4">
          {expenses.map((expense) => (
            <li
              key={expense._id}
              className="border rounded p-4 bg-gray-50 shadow-sm flex justify-between items-center md:text-2xl"
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
                  <p className="text-lg font-semibold md:text-2xl">
                    {expense.description}
                  </p>
                  <p className="text-sm text-gray-600 md:text-lg">
                    Paid by {expense.paidBy.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-green-700 text-lg md:text-2xl">
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
