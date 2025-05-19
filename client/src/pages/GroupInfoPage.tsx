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

  useEffect(() => {
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
    <div className="p-4">
      <div
        className="flex justify-end items-center mb-4"
        onClick={() => navigate(`/groups/${group._id}/add-event`)}
      >
        <PlusCircle color="#39625C" className="cursor-pointer inline" />
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

      <h3 className="text-lg font-medium mt-8 mb-2">Events:</h3>
      {events.length === 0 ? (
        <p className="text-gray-600">No events yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event._id}
              className="border p-3 rounded bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/events/${event._id}`)}
            >
              <div className="flex justify-between">
                <span>{event.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupInfoPage;
