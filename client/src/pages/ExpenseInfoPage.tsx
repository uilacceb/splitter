import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";
import { User, DollarSign, Calendar, Users, Notebook } from "lucide-react";

type Participant = {
  _id: string;
  name: string;
  picture: string;
};

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: {
    _id: string;
    name: string;
    picture: string;
  };
  splitWith: Participant[];
  createdAt: string;
};

const ExpenseInfoPage = () => {
  const { expenseId, groupId, eventId } = useParams<{
    expenseId: string;
    groupId: string;
    eventId: string;
  }>();

  const [expense, setExpense] = useState<Expense | null>(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = expense?.paidBy?._id === currentUser._id;

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await axios.get(`/api/expenses/${expenseId}`);
        setExpense(res.data);
      } catch (err) {
        console.error("Failed to fetch expense", err);
      }
    };
    fetchExpense();
  }, [expenseId]);

  if (!expense)
    return (
      <div className="flex h-screen justify-center items-center text-xl">
        Loading expense details...
      </div>
    );

  return (
    <div className="p-6 relative">
      <GoBack />
      <h1 className="text-3xl font-semibold text-center mb-8 mt-8 md:text-4xl">
        Expense Details
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6 border max-w-2xl mx-auto">
        {/* Title */}
        <div className="flex items-center gap-3 pb-4">
          <Notebook className="text-slate-600" />
          <div>
            <p className="text-lg text-gray-600 md:text-2xl">Description</p>
            <p className="text-xl font-bold md:text-2xl">{expense.description}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-3 pb-4">
          <DollarSign className="text-slate-600" />
          <div>
            <p className="text-lg text-gray-600 md:text-2xl">Amount</p>
            <p className="text-2xl font-bold text-green-700">
              ${expense.amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Paid By */}
        <div className="flex items-center gap-3 pb-4">
          <User className="text-slate-600" />
          <div className="flex items-center gap-2">
            <img
              src={expense.paidBy.picture}
              alt={expense.paidBy.name}
              className="w-8 h-8 rounded-full md:w-10 md:h-10"
            />
            <div>
              <p className="text-sm text-gray-600 md:text-2xl">Paid by</p>
              <p className="font-medium md:text-2xl">{expense.paidBy.name}</p>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-slate-600" />
            <p className="text-lg text-gray-700 font-semibold md:text-2xl">
              Participants ({expense.splitWith.length})
            </p>
          </div>
          <ul className="space-y-2 md:space-y-4">
            {expense.splitWith.map((p) => (
              <li key={p._id} className="flex items-center gap-3 pb-3 md:text-xl">
                <img
                  src={p.picture}
                  alt={p.name}
                  className="w-7 h-7 rounded-full"
                />
                <p className="text-gray-700">{p.name}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-3 text-sm text-gray-500 pt-4 border-t md:text-2xl">
          <Calendar />
          Created on:{" "}
          {new Date(expense.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          className={`px-6 py-2 rounded md:text-2xl ${
            isOwner
              ? "bg-[#39625C] text-white hover:bg-[#4c7e71]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={() =>
            isOwner &&
            navigate(
              `/groups/${groupId}/events/${eventId}/edit-expense/${expense._id}`
            )
          }
          disabled={!isOwner}
        >
          Edit Expense
        </button>
      </div>
    </div>
  );
};

export default ExpenseInfoPage;
