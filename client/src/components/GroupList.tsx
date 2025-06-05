import { useNavigate } from "react-router-dom";
import { useRequestCounts } from "../context/RequestContext";

type Group = {
  _id: string;
  title: string;
  icon?: string;
  members?: string[];
};

const GroupList = ({ groups }: { groups: Group[] }) => {
  const navigate = useNavigate();
  const { counts } = useRequestCounts();

  return (
    <div className="pl-10 mt-8">
      <div className="relative w-[80%]">
        <h2 className="md:text-2xl" onClick={() => navigate("/requests")}>
          Groups ({groups.length})
        </h2>
        {counts.group > 0 && (
          <div className="w-[6px] h-[6px] bg-red-500 rounded blur-[0.6px] absolute top-[2px] left-[4.5rem] md:left-[7.8em] md:w-[9px] md:h-[9px]"></div>
        )}
      </div>
      <div className="mt-2 space-y-1 md:mt-6">
        {groups.map((group) => (
          <div
            key={group._id}
            className="text-sm text-gray-700 flex items-center cursor-pointer pb-3 w-[80%]"
            onClick={() => navigate(`/groups/${group._id}`)}
          >
            <img
              src={group.icon || "/default-group-icon.png"}
              alt={group.title}
              className="w-8 h-8 rounded-full mr-2 md:w-10 md:h-10"
            />
            <div>
              <p className="md:text-xl">{group.title}</p>
              {group.members && (
                <p className="text-xs text-gray-500 md:text-xl">
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
