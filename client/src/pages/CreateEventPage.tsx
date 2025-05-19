import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

type Member = {
  _id: string;
  name: string;
  email: string;
  picture: string;
};

const CreateEventPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}`);
        setMembers(res.data.members);
      } catch (err) {
        console.error("Failed to fetch group members", err);
      }
    };
    fetchGroup();
  }, [groupId]);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !date || selectedParticipants.length === 0) {
      setError("All fields are required.");
      return;
    }

    try {
      await axios.post("/api/events", {
        title,
        date,
        participants: selectedParticipants,
        createdBy: currentUser._id,
        groupId,
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error("Failed to create event", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Add Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium mb-1">Select Participants</p>
            <label className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedParticipants.length === members.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedParticipants(members.map((m) => m._id));
                  } else {
                    setSelectedParticipants([]);
                  }
                }}
                className="mr-2"
              />
              <span>Select All</span>
            </label>
          </div>

          <ul className="space-y-2">
            {members.map((member) => (
              <li
                key={member._id}
                className={`flex items-center p-2 border rounded cursor-pointer ${
                  selectedParticipants.includes(member._id)
                    ? "bg-green-100 border-green-400"
                    : "bg-white"
                }`}
                onClick={() => toggleParticipant(member._id)}
              >
                <img
                  src={member.picture}
                  alt={member.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span>{member.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-[#2F5A62] text-white p-2 px-4 rounded text-lg"
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage;
