import { useEffect, useState } from "react";
import axios from "axios";
import { UserPlus, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRequestCounts } from "../context/RequestContext";

type User = {
  _id: string; // MongoDB usually uses _id
  name: string;
  email: string;
  picture: string;
};

const AddFriendsPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]); // to track requests sent
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { counts, refreshCounts } = useRequestCounts();

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.trim() === "") {
        setResults([]);
        setNotFound(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/search?query=${query}`);
        if (res.data.length > 0) {
          setResults(res.data);
          setNotFound(false);
        } else {
          setResults([]);
          setNotFound(true);
        }
      } catch (error) {
        console.error("Search failed", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle friend request
  const sendFriendRequest = async (userId: string) => {
    setError("");
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/friends/request`, {
        to: userId,
        from: currentUser._id,
      }); // you need this endpoint
      setSentRequests((prev) => [...prev, userId]);
      refreshCounts();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to send friend request";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="flex flex-col p-4">
      <p
        className="text-right cursor-pointer md:text-2xl"
        onClick={() => navigate("/requests")}
      >
        Requests ({counts.total})
      </p>
      <label htmlFor="email" className="md:text-3xl">Enter the email</label>
      <input
        id="email"
        className="border-2 border-gray-400 p-2 mt-1 md:text-2xl"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search user by email"
      />
      {error && <p className="mt-2 text-red-600 font-medium">{error}</p>}
      {loading && <p className="mt-2 text-gray-500">Searching...</p>}

      {!loading && results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((user) => (
            <li
              key={user._id}
              className="flex items-center border p-2 rounded bg-gray-100 md:text-2xl"
            >
              <img
                src={user.picture}
                className="w-10 rounded-md mr-2"
                alt="user profile pic"
              />
              <div>
                <strong>{user.name}</strong> — {user.email}
              </div>

              <div className="ml-auto cursor-pointer">
                {sentRequests.includes(user._id) ? (
                  <Clock className="text-yellow-600 md:w-6 md:h-6" />
                ) : (
                  <UserPlus
                    className="text-[#39625C] hover:text-green-800 md:w-8 md:h-8"
                    onClick={() => sendFriendRequest(user._id)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && notFound && (
        <p className="mt-4 text-red-500 md:text-2xl">No user found.</p>
      )}
    </div>
  );
};

export default AddFriendsPage;
