import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";
import { PencilLine, Trash2 } from "lucide-react";

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: {
    _id: string;
    name: string;
    picture: string;
  };
  createdAt: string;
};

const EventInfoPage = () => {
  const { eventId, groupId } = useParams<{
    eventId: string;
    groupId: string;
  }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventRes = await axios.get(`/api/events/${eventId}`);
        setEventTitle(eventRes.data.title);
      } catch (error) {
        console.error("Failed to fetch event title", error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const res = await axios.get(`/api/expenses?eventId=${eventId}`);
        setExpenses(res.data);
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      }
    };

    fetchEventDetails();
    fetchExpenses();
  }, [eventId]);

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
          className="flex items-center gap-2 px-4 py-2 bg-[#39625C] text-white rounded hover:bg-[#83A99B] transition duration-300"
          type="button"
          onClick={() =>
            navigate(`/groups/${groupId}/events/${eventId}/add-expense`)
          }
        >
          Add Expense
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-6">{eventTitle}</h2>

      {expenses.length === 0 ? (
        <p>No expenses recorded for this event.</p>
      ) : (
        <ul className="space-y-4">
          {expenses.map((expense) => (
            <li
              key={expense._id}
              className="border rounded p-4 bg-gray-100 flex items-center justify-between shadow-sm"
            >
              {/* Clickable area */}
              <div
                className="flex items-center cursor-pointer flex-1"
                onClick={() =>
                  navigate(
                    `/groups/${groupId}/events/${eventId}/expenses/${expense._id}`
                  )
                }
              >
                <img
                  src={expense.paidBy?.picture}
                  alt={expense.paidBy?.name || "User"}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold text-lg">{expense.description}</p>
                  <p className="text-sm text-gray-600">
                    Paid by: {expense.paidBy?.name || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 ml-4">
                <span className="text-right font-bold text-lg text-green-700">
                  ${expense.amount.toFixed(2)}
                </span>

                {expense.paidBy._id === currentUser._id && (
                  <div className="flex items-center gap-3">
                    <PencilLine
                      className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/groups/${groupId}/events/${eventId}/edit-expense/${expense._id}`
                        )
                      }
                    />
                    <Trash2
                      className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
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
