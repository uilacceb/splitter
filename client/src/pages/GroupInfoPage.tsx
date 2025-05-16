import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { PencilLine } from "lucide-react";

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

const GroupInfoPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}`);
        console.log("Group details fetched:", res.data);
        setGroup(res.data);
      } catch (error) {
        console.error("Failed to fetch group info", error);
      }
    };

    fetchGroup();
  }, [groupId]);

  if (!group) return <p>Loading group details...</p>;

  return (
    <div className="p-4">
      <PencilLine
        color="#bcc2be"
        className="ml-auto cursor-pointer"
        onClick={() => navigate(`/groups/${group._id}/edit`)}
      />

      <img
        src={group.icon}
        alt={group.title}
        className="w-16 h-16 rounded-full my-4  mx-auto"
      />
      <h2 className="text-2xl font-semibold text-center">{group.title}</h2>
      <h3 className="text-lg font-medium mt-4">Members:</h3>
      <ul className="mt-2 space-y-1">
        {group.members.map((member) => (
          <li key={member._id} className="flex items-center space-x-2">
            <img
              src={member.picture}
              alt="user icon"
              width={45}
              className="rounded-full"
            />
            <strong>{member.name}</strong> — {member.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupInfoPage;
