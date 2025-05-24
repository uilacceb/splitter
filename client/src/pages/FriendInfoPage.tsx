import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";

type Friend = {
  _id: string;
  name: string;
  picture: string;
  email?: string;
};

const FriendInfoPage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [friend, setFriend] = useState<Friend | null>(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id;

  useEffect(() => {
    const fetchFriend = async () => {
      try {
        const res = await axios.get(`/api/users/${friendId}`);
        setFriend(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchFriend();
  }, [friendId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this friend?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(
        `/api/users/friends/${friendId}?userId=${currentUserId}`
      );
      alert("Friend deleted");
      navigate("/friends"); // Adjust route if needed
    } catch (err) {
      console.error("Failed to delete friend", err);
      alert("Failed to delete friend");
    }
  };

  if (!friend) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 relative">
      <GoBack />
      <div className="flex flex-col items-center gap-3 mt-4">
        <img
          src={friend.picture}
          alt={friend.name}
          className="w-24 h-24 rounded-full"
        />
        <h2 className="text-xl font-semibold">{friend.name}</h2>
        <p className="text-gray-600">{friend.email}</p>
        {friendId !== currentUserId && (
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleDelete}
          >
            Delete Friend
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendInfoPage;
