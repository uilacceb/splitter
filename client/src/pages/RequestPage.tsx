import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { useRequestCounts } from "../context/RequestContext"; // adjust path as needed

type Request = {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
  };
};

type GroupRequest = {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
  };
  groupId: {
    _id: string;
    title: string;
  };
};

const Requests = () => {
  const [friendRequests, setFriendRequests] = useState<Request[]>([]);
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
  const { refreshCounts } = useRequestCounts();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [friendRes, groupRes] = await Promise.all([
          axios.get(`/api/users/friends/requests?userId=${currentUser._id}`),
          axios.get(`/api/groups/requests?userId=${currentUser._id}`),
        ]);

        setFriendRequests(friendRes.data);
        setGroupRequests(groupRes.data);

        localStorage.setItem("friendRequests", JSON.stringify(friendRes.data));
        localStorage.setItem("groupRequests", JSON.stringify(groupRes.data));

        refreshCounts();
      } catch (error) {
        console.error("Failed to fetch requests", error);
      }
    };

    fetchRequests();
  }, []);

  const acceptFriend = async (id: string) => {
    try {
      await axios.put(`/api/users/friends/requests/${id}/accept`);
      setFriendRequests((prev) => prev.filter((req) => req._id !== id));
      refreshCounts();
    } catch (error) {
      console.error("Failed to accept friend request", error);
    }
  };

  const ignoreFriend = async (id: string) => {
    try {
      await axios.delete(`/api/users/friends/requests/${id}`);
      setFriendRequests((prev) => prev.filter((req) => req._id !== id));
      refreshCounts();
    } catch (error) {
      console.error("Failed to ignore friend request", error);
    }
  };

  const acceptGroup = async (id: string) => {
    try {
      await axios.put(`/api/groups/requests/${id}/accept`);
      setGroupRequests((prev) => prev.filter((req) => req._id !== id));
      refreshCounts();
    } catch (error) {
      console.error("Failed to accept group request", error);
    }
  };

  const ignoreGroup = async (id: string) => {
    try {
      await axios.delete(`/api/groups/requests/${id}`);
      setGroupRequests((prev) => prev.filter((req) => req._id !== id));
      refreshCounts();
    } catch (error) {
      console.error("Failed to ignore group request", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
      {friendRequests.length > 0 ? (
        <ul className="space-y-2">
          {friendRequests.map((req) => (
            <li
              key={req._id}
              className="border p-3 rounded flex justify-between items-center bg-gray-100"
            >
              <div>
                <p className="font-medium">{req.from.name}</p>
                <p className="text-sm text-gray-600">{req.from.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Check
                  className="text-[#39625C]"
                  onClick={() => acceptFriend(req._id)}
                />
                <X
                  className="text-[#e24f3b]"
                  onClick={() => ignoreFriend(req._id)}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending friend requests.</p>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-4">Group Requests</h2>
      {groupRequests.length > 0 ? (
        <ul className="space-y-2">
          {groupRequests.map((req) => (
            <li
              key={req._id}
              className="border p-3 rounded flex justify-between items-center bg-gray-100"
            >
              <div>
                <p className="font-medium">{req.from.name}</p>
                <p className="text-sm text-gray-600">
                  invited you to join <strong>{req.groupId?.title}</strong>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Check
                  className="text-[#39625C]"
                  onClick={() => acceptGroup(req._id)}
                />
                <X
                  className="text-[#e24f3b]"
                  onClick={() => ignoreGroup(req._id)}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending group requests.</p>
      )}
    </div>
  );
};

export default Requests;
