import { useEffect, useState } from "react";
import axios from "axios";

type Group = {
  _id: string;
  title: string;
  icon?: string;
  members?: string[]; // optional, to support memberCount fallback
};

const GroupList = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      try {
        const res = await axios.get(`/api/groups?userId=${currentUser._id}`);
        setGroups(res.data);
      } catch (error) {
        console.error("Failed to fetch group list", error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="pl-10">
      <h2>Groups ({groups.length})</h2>
      <div className="mt-2 space-y-1">
        {groups.map((group) => (
          <div
            key={group._id}
            className="text-sm text-gray-700 flex items-center"
          >
            <img
              src={group.icon || "/default-group-icon.png"}
              alt={group.title}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p>{group.title}</p>
              {group.members && (
                <p className="text-xs text-gray-500">
                  {group.members.length} members
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
