import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";

type Participant = {
  _id: string;
  name: string;
  picture: string;
};

const AddExpensePage = () => {
  const { groupId, eventId } = useParams();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}`);
        setParticipants(res.data.members);
      } catch (err) {
        console.error("Failed to load group members", err);
      }
    };

    fetchGroupMembers();
  }, [groupId]);

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
      await axios.post("/api/expenses", {
        eventId,
        paidBy: currentUser._id,
        description,
        amount: parseFloat(amount),
        splitWith: participantIds,
      });

      navigate(`/groups/${groupId}/events/${eventId}`);
    } catch (err) {
      console.error("Failed to add expense", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 relative">
      <GoBack />
      <h2 className="text-2xl font-semibold mb-4 mt-8 md:text-3xl md:mt-10">
        Add Expense
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Description"
          className="w-full border p-2 rounded md:text-2xl"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full border p-2 rounded md:text-2xl"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="md:pb-4">
          <label className="block font-semibold mb-1 md:text-2xl md:mt-8 md:mb-4">
            Split Type:
          </label>
          <div className="flex items-center gap-4">
            <label>
              <input
                type="radio"
                name="split"
                value="equal"
                checked={splitType === "equal"}
                onChange={() => setSplitType("equal")}
                className="md:w-4 md:h-4"
              />
              <span className="ml-1 md:text-2xl">Split equally</span>
            </label>
            <label>
              <input
                type="radio"
                name="split"
                value="custom"
                checked={splitType === "custom"}
                onChange={() => setSplitType("custom")}
                className="md:w-4 md:h-4"
              />
              <span className="ml-1 md:text-2xl">Split with selected</span>
            </label>
          </div>
        </div>

        {splitType === "custom" && (
          <div className="mt-3 md:pb-4">
            <p className="mb-1 font-semibold md:text-2xl md:pb-3">
              Select Participants:
            </p>
            <ul className="space-y-2 md:space-y-4">
              {participants.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded md:text-2xl"
                  onClick={() => toggleParticipant(p._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleParticipant(p._id)}
                    className="md:w-4 md:h-4"
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
          className="bg-[#2F5A62] text-white p-2 px-4 rounded text-lg md:text-2xl"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpensePage;
