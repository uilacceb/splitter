import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";

type Member = {
  _id: string;
  name: string;
  email: string;
  picture: string;
};

const EditEventPage = () => {
  const { groupId, eventId } = useParams<{ groupId: string; eventId: string }>();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventAndMembers = async () => {
      try {
        const groupRes = await axios.get(`/api/groups/${groupId}`);
        setMembers(groupRes.data.members);

        const eventRes = await axios.get(`/api/events/${eventId}`);
        const event = eventRes.data;
        setTitle(event.title);
        setDate(event.date.split("T")[0]); // format date
        setSelectedParticipants(event.participants.map((p: Member) => p._id));
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchEventAndMembers();
  }, [groupId, eventId]);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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
      await axios.put(`/api/events/${eventId}`, {
        title,
        date,
        participants: selectedParticipants,
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error("Failed to update event", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-6 relative">
      <GoBack />
      <h2 className="text-2xl font-semibold mb-4 mt-4">Edit Event</h2>
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

        <div className="pt-6">
          <p className="font-medium mb-2">Select Participants</p>
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

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-[#2F5A62] text-white p-2 px-4 rounded text-lg"
          >
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
