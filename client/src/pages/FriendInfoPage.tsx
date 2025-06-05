import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";
import { useRequestCounts } from "../context/RequestContext";

type Friend = {
  _id: string;
  name: string;
  picture: string;
  email?: string;
};

const FriendInfoPage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { counts, refreshCounts } = useRequestCounts();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id;

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const res = await axios.get(`/api/users/${friendId}`);
        setFriend(res.data);

        const friendRes = await axios.get(
          `/api/users/friends?userId=${currentUserId}`
        );
        const friendList: Friend[] = friendRes.data;
        const isAlreadyFriend = friendList.some((f) => f._id === friendId);
        setIsFriend(isAlreadyFriend);
      } catch (err) {
        console.error("Failed to fetch friend data", err);
      }
    };

    fetchFriendData();
  }, [friendId, currentUserId]);

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
      navigate("/friends");
    } catch (err) {
      console.error("Failed to delete friend", err);
      alert("Failed to delete friend");
    }
  };

  const sendFriendRequest = async () => {
    setError(null);
    try {
      await axios.post(`/api/users/friends/request`, {
        to: friendId,
        from: currentUserId,
      });
      setSentRequests((prev) => [...prev, friendId!]);
      refreshCounts();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to send friend request";
      setError(msg);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!friend) return <p className="p-4 md:text-2xl">Loading...</p>;

  const hasSentRequest = sentRequests.includes(friendId!);

  return (
    <div className="p-4 relative">
      <GoBack />
      <div className="flex flex-col items-center gap-3 mt-4 md:text-3xl md:mt-20">
        <img
          src={friend.picture}
          alt={friend.name}
          className="w-24 h-24 rounded-full"
        />
        <h2 className="text-xl font-semibold md:text-3xl">{friend.name}</h2>
        <p className="text-gray-600">{friend.email}</p>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {friendId !== currentUserId && (
          <>
            {isFriend ? (
              <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Delete Friend
              </button>
            ) : hasSentRequest ? (
              <button
                className="mt-4 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                disabled
              >
                Request Sent
              </button>
            ) : (
              <button
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={sendFriendRequest}
              >
                Add Friend
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendInfoPage;
