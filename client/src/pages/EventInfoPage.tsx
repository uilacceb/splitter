import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: string;
  createdAt: string;
};

const EventInfoPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get(`/api/expenses?eventId=${eventId}`);
        setExpenses(res.data);
        if (res.data.length > 0 && res.data[0].eventId?.title) {
          setEventTitle(res.data[0].eventId.title);
        }
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      }
    };

    fetchExpenses();
  }, [eventId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Event: {eventTitle}</h2>

      {expenses.length === 0 ? (
        <p>No expenses recorded for this event.</p>
      ) : (
        <ul className="space-y-3">
          {expenses.map((expense) => (
            <li
              key={expense._id}
              className="border rounded p-3 bg-gray-100 flex justify-between"
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-gray-600">
                  Paid by: {expense.paidBy}
                </p>
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
