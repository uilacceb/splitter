import { useNavigate } from "react-router-dom";

type Group = {
  _id: string;
  title: string;
  icon?: string;
  members?: string[];
};

const GroupList = ({ groups }: { groups: Group[] }) => {
  const navigate = useNavigate();

  return (
    <div className="pl-10 mt-8">
      <h2>Groups ({groups.length})</h2>
      <div className="mt-2 space-y-1">
        {groups.map((group) => (
          <div
            key={group._id}
            className="text-sm text-gray-700 flex items-center cursor-pointer"
            onClick={() => navigate(`/groups/${group._id}`)}
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
