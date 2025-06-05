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
  const [splitType, setSplitType] = useState<"equal" | "custom" | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const standardizeId = (id: any): string => {
    if (typeof id === "string") return id;
    if (typeof id === "object" && id?._id) return id._id;
    return String(id);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [groupRes, expenseRes] = await Promise.all([
          axios.get(`/api/groups/${groupId}`),
          axios.get(`/api/expenses/${expenseId}`),
        ]);

        const groupMembers = groupRes.data.members;
        const expense = expenseRes.data;

        const normalizedParticipants: Participant[] = groupMembers.map(
          (member: any) => ({
            _id: standardizeId(member._id),
            name: member.name || "Unknown",
            picture: member.picture || "",
          })
        );

        setParticipants(normalizedParticipants);
        setDescription(expense.description || "");
        setAmount(expense.amount?.toString() || "");

        const splitWithIds: string[] = (expense.splitWith || []).map((p: any) =>
          standardizeId(p)
        );

        const isEqualSplit =
          normalizedParticipants.length === splitWithIds.length &&
          normalizedParticipants.every((p) => splitWithIds.includes(p._id));

        setSplitType(isEqualSplit ? "equal" : "custom");
        setSelectedIds(splitWithIds);
      } catch (err) {
        console.error("Failed to load expense or participants", err);
        setError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId, expenseId]);

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

  if (isLoading || splitType === null) {
    return <div className="p-4 md:text-2xl">Loading expense data...</div>;
  }

  return (
    <div className="p-4 relative md:p-8 lg:p-14">
      <GoBack />
      <h2 className="text-2xl font-semibold mb-4 mt-8 md:text-3xl md:mt-12">
        Edit Expense
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

        <div>
          <label className="block font-medium mb-1 md:text-2xl md:pt-4 md:font-semibold">
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
          <div className="mt-3">
            <p className="mb-1 font-medium md:text-2xl md:font-semibold">
              Select Participants:
            </p>
            <ul className="space-y-2 md:space-y-4">
              {participants.map((p) => {
                const isSelected = selectedIds.includes(p._id);
                return (
                  <li
                    key={p._id}
                    className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-100 p-2 rounded md:text-2xl"
                    onClick={() => toggleParticipant(p._id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleParticipant(p._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="md:w-4 md:h-4"
                    />
                    <img
                      src={p.picture}
                      alt={p.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{p.name}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 text-sm md:text-lg">
              Selected: {selectedIds.length} of {participants.length}
            </div>
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-[#2F5A62] text-white p-2 px-4 rounded text-lg md:text-2xl"
        >
          Update Expense
        </button>
      </form>
    </div>
  );
};

export default EditExpensePage;
