import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import GoBack from "../components/GoBack";

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
    <div className="p-6 relative">
      <GoBack />
      <h2 className="text-2xl font-semibold mb-4 mt-4 md:text-3xl md:mt-8">
        Create an Event
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <input
          type="text"
          placeholder="Event Title"
          className="w-full border p-2 rounded md:text-2xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-2 rounded md:text-2xl"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="pt-6 ">
          <div className="flex items-center justify-between mb-2 ">
            <p className="font-medium mb-1 md:text-2xl">Select Participants</p>
            <label className="flex items-center mb-2 cursor-pointer md:text-2xl">
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
                className="mr-2 md:w-5 md:h-5"
              />
              <span>Select All</span>
            </label>
          </div>

          <ul className="space-y-2 md:space-y-4">
            {members.map((member) => (
              <li
                key={member._id}
                className={`flex items-center p-2 border rounded cursor-pointer md:text-2xl ${
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
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-[#2F5A62] text-white p-2 px-4 rounded text-lg md:text-2xl"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
