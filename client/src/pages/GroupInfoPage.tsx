import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { PencilLine, PlusCircle } from "lucide-react";

type Group = {
  _id: string;
  title: string;
  icon?: string;
  createdBy: {
    _id: string;
  };
  members: {
    _id: string;
    name: string;
    email: string;
    picture: string;
  }[];
};

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
};

const GroupInfoPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}`);
        setGroup(res.data);
      } catch (error) {
        console.error("Failed to fetch group info", error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const res = await axios.get(`/api/expenses?groupId=${groupId}`);
        setExpenses(res.data);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      }
    };

    fetchGroup();
    fetchExpenses();
  }, [groupId]);

  if (!group)
    return (
      <div className="flex h-screen justify-center items-center text-3xl">
        Loading group details...
      </div>
    );

  return (
    <div className="p-4">
      <div
        className="flex justify-end items-center mb-4"
        onClick={() => navigate(`/groups/${group._id}/add-expense`)}
      >
        <PlusCircle color="#39625C" className="cursor-pointer inline" />
        <span className="pl-1">Add expense</span>
      </div>

      <img
        src={group.icon}
        alt={group.title}
        className="w-16 h-16 rounded-full my-4 mx-auto"
      />
      <h2 className="text-2xl font-semibold text-center">
        {group.title}{" "}
        <PencilLine
          color="#bcc2be"
          className="cursor-pointer inline ml-2"
          onClick={() => navigate(`/groups/${group._id}/edit`)}
        />
      </h2>

      <h3 className="text-lg font-medium mt-8 mb-2">Expenses:</h3>
      {expenses.length === 0 ? (
        <p className="text-gray-600">No expenses yet.</p>
      ) : (
        <ul className="space-y-3">
          {expenses.map((exp) => (
            <li key={exp._id} className="border p-3 rounded bg-gray-50">
              <div className="flex justify-between">
                <span>{exp.description}</span>
                <span className="font-semibold">${exp.amount.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">
                Paid by {exp.paidBy} on{" "}
                {new Date(exp.date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupInfoPage;
