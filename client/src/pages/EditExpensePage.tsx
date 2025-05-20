import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";

type Participant = {
  _id: string;
  name: string;
  picture: string;
};

const EditExpensePage = () => {
  const { groupId, eventId, expenseId } = useParams();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, expenseRes] = await Promise.all([
          axios.get(`/api/events/${eventId}`),
          axios.get(`/api/expenses/${expenseId}`),
        ]);

        setParticipants(eventRes.data.participants);

        // Set these values here after verifying the keys exist
        const expense = expenseRes.data;
        setDescription(expense.description || "");
        setAmount(expense.amount?.toString() || "");

        if (expense.splitWith?.length === eventRes.data.participants.length) {
          setSplitType("equal");
        } else {
          setSplitType("custom");
          setSelectedIds(expense.splitWith?.map((p: any) => p._id) || []);
        }
      } catch (err) {
        console.error("Failed to load expense or participants", err);
      }
    };
    fetchData();
  }, [eventId, expenseId]);

  const toggleParticipant = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!description || !amount) {
      return setError("Description and amount are required.");
    }

    const participantIds =
      splitType === "equal"
        ? participants.map((p) => p._id)
        : selectedIds.length
        ? selectedIds
        : [];

    if (participantIds.length === 0) {
      return setError("Please select participants.");
    }

    try {
      await axios.put(`/api/expenses/${expenseId}`, {
        description,
        amount: parseFloat(amount),
        splitWith: participantIds,
      });

      navigate(`/groups/${groupId}/events/${eventId}`);
    } catch (err) {
      console.error("Failed to update expense", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 relative">
      <GoBack />
      <h2 className="text-2xl font-semibold mb-4 mt-8">Edit Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full border p-2 rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div>
          <label className="block font-medium mb-1">Split Type:</label>
          <div className="flex items-center gap-4">
            <label>
              <input
                type="radio"
                name="split"
                value="equal"
                checked={splitType === "equal"}
                onChange={() => setSplitType("equal")}
              />
              <span className="ml-1">Split equally</span>
            </label>
            <label>
              <input
                type="radio"
                name="split"
                value="custom"
                checked={splitType === "custom"}
                onChange={() => setSplitType("custom")}
              />
              <span className="ml-1">Split with selected</span>
            </label>
          </div>
        </div>

        {splitType === "custom" && (
          <div className="mt-3">
            <p className="mb-1 font-medium">Select Participants:</p>
            <ul className="space-y-2">
              {participants.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleParticipant(p._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onClick={(e) => e.stopPropagation()} // prevent double toggle
                    onChange={() => toggleParticipant(p._id)} // still handles keyboard use
                  />
                  <img
                    src={p.picture}
                    alt={p.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-[#2F5A62] text-white p-2 px-4 rounded text-lg"
        >
          Update Expense
        </button>
      </form>
    </div>
  );
};

export default EditExpensePage;
