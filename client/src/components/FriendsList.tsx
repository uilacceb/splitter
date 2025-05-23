import { useEffect, useState } from "react";
import axios from "axios";
import { useRequestCounts } from "../context/RequestContext";
import { useNavigate } from "react-router-dom";

type Friend = {
  _id: string;
  name: string;
  picture: string;
  email?: string;
};

const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { counts } = useRequestCounts();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      try {
        const res = await axios.get(
          `/api/users/friends?userId=${currentUser._id}`
        );
        setFriends(res.data);
      } catch (error) {
        console.error("Failed to fetch friend list", error);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="pl-10">
      <div className="relative w-[80%] ">
        <h2 onClick={() => navigate("/requests")} className="cursor-pointer">
          Friends ({friends.length})
        </h2>
        {counts.friend > 0 && (
          <div className="w-[6px] h-[6px] bg-red-500 rounded blur-[0.6px] absolute top-[2px] left-[4.5rem]"></div>
        )}
      </div>

      <div className="mt-2 space-y-1">
        {friends.map((friend) => (
          <div
            key={friend._id}
            className="text-sm text-gray-700 pb-2 pt-1 cursor-pointer hover:bg-gray-100 rounded px-2"
            onClick={() => navigate(`/friends/${friend._id}`)}
          >
            <img
              src={friend.picture}
              alt={friend.name}
              className="w-8 h-8 rounded-full inline-block mr-2"
            />
            {friend.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
