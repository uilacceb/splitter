import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";

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

  const navigate = useNavigate();
  return (
    <div className="p-4 relative">
      <GoBack />
      <div className="flex justify-end">
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
      <h2 className="text-2xl font-semibold mb-4 mt-6">{eventTitle}</h2>

      {expenses.length === 0 ? (
        <p>No expenses recorded for this event.</p>
      ) : (
        <ul className="space-y-3">
          {expenses.map((expense) => (
            <li
              key={expense._id}
              className="border rounded p-3 bg-gray-100 flex justify-between"
            >
              <div className="flex items-center">
                <img
                  src={expense.paidBy?.picture}
                  alt={expense.paidBy?.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
                <div className="ml-3">
                  <p className="font-semibold">{expense.description}</p>

                  <p className="text-sm text-gray-600">
                    Paid by: {expense.paidBy?.name || "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-blue-600 text-sm"
                  onClick={() =>
                    navigate(
                      `/groups/${groupId}/events/${eventId}/edit-expense/${expense._id}`
                    )
                  }
                >
                  Edit
                </button>
                <button
                  className="text-red-600 text-sm"
                  onClick={() => handleDelete(expense._id)}
                >
                  Delete
                </button>
              </div>
              <span className="text-right font-bold">
                ${expense.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventInfoPage;
