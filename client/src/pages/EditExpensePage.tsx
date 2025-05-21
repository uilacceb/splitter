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
    if (id === null || id === undefined) return "";
    if (typeof id === "string") return id;
    if (typeof id === "number") return String(id);
    if (typeof id === "object") {
      if (id._id) return String(id._id);
      if (id.id) return String(id.id);
      if (id.toString) return String(id);
    }
    return String(id);
  };

  const logExpenseStructure = (data: any) => {
    console.log("===== EXPENSE STRUCTURE ANALYSIS =====");
    console.log("Full expense object:", data);
    console.log("Expense object type:", typeof data);
    console.log("Keys:", Object.keys(data));

    console.log("splitWith exists?", data.hasOwnProperty("splitWith"));
    console.log("splitWith type:", typeof data.splitWith);
    console.log("splitWith value:", data.splitWith);

    if (Array.isArray(data.splitWith)) {
      console.log("splitWith length:", data.splitWith.length);

      if (data.splitWith.length > 0) {
        const sample = data.splitWith.slice(
          0,
          Math.min(3, data.splitWith.length)
        );
        console.log("Sample elements:");
        sample.forEach((item: any, i: number) => {
          console.log(`Element ${i} type:`, typeof item);
          console.log(`Element ${i} value:`, item);
          if (typeof item === "object") {
            console.log(`Element ${i} keys:`, Object.keys(item));
          }
        });
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log(
          `Fetching data for eventId: ${eventId}, expenseId: ${expenseId}`
        );

        const [eventRes, expenseRes] = await Promise.all([
          axios.get(`/api/events/${eventId}`),
          axios.get(`/api/expenses/${expenseId}`),
        ]);

        const eventData = eventRes.data;
        const expenseData = expenseRes.data;

        console.log("Raw event data:", eventData);
        console.log("Raw expense data:", expenseData);

        logExpenseStructure(expenseData);

        const normalizedParticipants: Participant[] = (
          eventData.participants || []
        ).map((p: any) => ({
          _id: standardizeId(p._id),
          name: p.name || "Unknown",
          picture: p.picture || "",
        }));

        setParticipants(normalizedParticipants);
        setDescription(expenseData.description || "");
        setAmount(expenseData.amount?.toString() || "");

        let splitWithIds: string[] = [];

        if (Array.isArray(expenseData.splitWith)) {
          console.log("Found splitWith array in expense data");
          splitWithIds = expenseData.splitWith
            .map((item: any) => standardizeId(item))
            .filter(Boolean);
        } else if (Array.isArray(expenseData.split_with)) {
          console.log("Found split_with array in expense data (snake_case)");
          splitWithIds = expenseData.split_with
            .map((item: any) => standardizeId(item))
            .filter(Boolean);
        } else if (Array.isArray(expenseData.participants)) {
          console.log("Using participants array from expense data as fallback");
          splitWithIds = expenseData.participants
            .map((item: any) => standardizeId(item))
            .filter(Boolean);
        } else {
          console.log(
            "Looking for alternative participant ID fields in expense data"
          );
          for (const key of Object.keys(expenseData)) {
            if (
              Array.isArray(expenseData[key]) &&
              expenseData[key].length > 0 &&
              (key.toLowerCase().includes("participant") ||
                key.toLowerCase().includes("user") ||
                key.toLowerCase().includes("split"))
            ) {
              console.log(`Found potential participant array in field: ${key}`);
              splitWithIds = expenseData[key]
                .map((item: any) => standardizeId(item))
                .filter(Boolean);
              break;
            }
          }
        }

        if (splitWithIds.length === 0) {
          console.log(
            "No splitWith IDs found, using all participants by default"
          );
          splitWithIds = normalizedParticipants.map((p) => p._id);
        }

        console.log("Final splitWith IDs:", splitWithIds);

        const isEqualSplit =
          normalizedParticipants.length > 0 &&
          splitWithIds.length === normalizedParticipants.length &&
          normalizedParticipants.every((p) => splitWithIds.includes(p._id));

        if (isEqualSplit) {
          console.log("Auto-selecting equal split type");
          setSplitType("equal");
        } else {
          console.log("Auto-selecting custom split type");
          setSplitType("custom");
        }

        console.log("Setting selectedIds to:", splitWithIds);
        setSelectedIds(splitWithIds);

        normalizedParticipants.forEach((p) => {
          const isSelected = splitWithIds.includes(p._id);
          console.log(
            `Participant ${p.name} (${p._id}): ${
              isSelected ? "should be selected" : "should not be selected"
            }`
          );
        });
      } catch (err) {
        console.error("Failed to load expense or participants", err);
        setError("Failed to load expense data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, expenseId]);

  const toggleParticipant = (id: string) => {
    console.log(`Toggling participant: ${id}`);
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((existingId) => existingId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!description || !amount) {
      return setError("Description and amount are required.");
    }

    const participantIds =
      splitType === "equal" ? participants.map((p) => p._id) : selectedIds;

    if (participantIds.length === 0) {
      return setError("Please select participants.");
    }

    console.log("Submitting expense with participantIds:", participantIds);

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
    return <div className="p-4">Loading expense data...</div>;
  }

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
                disabled={splitType === null}
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
                disabled={splitType === null}
              />
              <span className="ml-1">Split with selected</span>
            </label>
          </div>
        </div>

        {splitType === "custom" && (
          <div className="mt-3">
            <p className="mb-1 font-medium">Select Participants:</p>
            <ul className="space-y-2">
              {participants.map((p) => {
                const isSelected = selectedIds.includes(p._id);
                return (
                  <li
                    key={p._id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => toggleParticipant(p._id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleParticipant(p._id)}
                      onClick={(e) => e.stopPropagation()}
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
            <div className="mt-2 text-sm">
              Selected: {selectedIds.length} of {participants.length}{" "}
              participants
            </div>
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
