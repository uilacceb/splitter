import { useEffect, useState } from "react";
import axios from "axios";

type Group = {
  _id: string;
  name: string;
  picture?: string; // optional, fallback handled in rendering
  memberCount?: number;
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
              src={group.picture || "/default-group-icon.png"}
              alt={group.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p>{group.name}</p>
              {group.memberCount !== undefined && (
                <p className="text-xs text-gray-500">
                  {group.memberCount} members
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
