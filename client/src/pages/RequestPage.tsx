import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

type Request = {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
  };
};

const Requests = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `/api/users/friends/requests?userId=${currentUser._id}`
        );
        setRequests(res.data);
      } catch (error) {
        console.error("Failed to fetch friend requests", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
      {requests.length > 0 ? (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li
              key={req._id}
              className="border p-3 rounded flex justify-between items-center bg-gray-100"
            >
              <div>
                <p className="font-medium">{req.from.name}</p>
                <p className="text-sm text-gray-600">{req.from.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="text-[#39625C]" />
                <X className="text-[#e24f3b]" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending friend requests.</p>
      )}
    </div>
  );
};

export default Requests;
