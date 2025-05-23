import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { PencilLine, PlusCircle, Trash2 } from "lucide-react";
import GoBack from "../components/GoBack";

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

type Event = {
  _id: string;
  title: string;
  date: string;
};

const GroupInfoPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  const fetchGroup = async () => {
    try {
      const res = await axios.get(`/api/groups/${groupId}`);
      setGroup(res.data);
    } catch (error) {
      console.error("Failed to fetch group info", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`/api/events?groupId=${groupId}`);
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`/api/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchEvents();
  }, [groupId]);

  if (!group)
    return (
      <div className="flex h-screen justify-center items-center text-3xl">
        Loading group details...
      </div>
    );

  return (
    <div className="p-4 relative">
      <GoBack />
      <div
        className="flex justify-end items-center mb-4 cursor-pointer"
        onClick={() => navigate(`/groups/${group._id}/add-event`)}
      >
        <PlusCircle color="#39625C" />
        <span className="pl-1">Add Event</span>
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

      <h3 className="text-lg font-medium mt-8 mb-2">
        Members ({group.members.length}):
      </h3>
      <ul className="space-y-2">
        {group.members.map((member) => (
          <li
            key={member._id}
            className="flex items-center border p-2 rounded bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/users/${member._id}`)}
          >
            <img
              src={member.picture}
              alt={member.name}
              className="w-5 h-5 rounded-full mr-3"
            />
            <div>
              <h4 className="text-md">{member.name}</h4>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-medium mt-8 mb-2">
        Events ({events.length}):
      </h3>
      {events.length === 0 ? (
        <p className="text-gray-600">No events yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event._id}
              className="border p-3 rounded bg-gray-50 flex justify-between items-center"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() =>
                  navigate(`/groups/${group._id}/events/${event._id}`)
                }
              >
                <div className="flex justify-between items-center">
                  <span>{event.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 ml-4">
                {/* <PencilLine
                  color="#6b7280"
                  className="w-5 h-5 cursor-pointer"
                  onClick={() =>
                    navigate(`/groups/${group._id}/events/${event._id}/edit`)
                  }
                /> */}
                <Trash2
                  color="#ef4444"
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => handleDeleteEvent(event._id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupInfoPage;
