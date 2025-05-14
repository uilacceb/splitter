import { useEffect, useState } from "react";
import axios from "axios";

type Friend = {
  _id: string;
  name: string;
  picture: string;
  email?: string;
};

const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);

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
      <h2>Friends ({friends.length})</h2>
      <div className="mt-2 space-y-1">
        {friends?.map((friend) => (
          <div key={friend._id} className="text-sm text-gray-700">
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
