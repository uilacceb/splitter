import { useEffect, useState } from "react";
import axios from "axios";
import { UserPlus, Clock } from "lucide-react";

type User = {
  _id: string; // MongoDB usually uses _id
  name: string;
  email: string;
};

const AddFriendsPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]); // to track requests sent

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.trim() === "") {
        setResults([]);
        setNotFound(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`/api/users/search?query=${query}`);
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
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.post(`/api/users/friends/request`, {
        to: userId,
        from: currentUser._id,
      }); // you need this endpoint
      setSentRequests((prev) => [...prev, userId]);
    } catch (error) {
      console.error("Failed to send friend request", error);
    }
  };

  return (
    <div className="flex flex-col p-4">
      <label htmlFor="email">Enter the email</label>
      <input
        id="email"
        className="border-2 border-gray-400 p-2 mt-1"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search user by email"
      />

      {loading && <p className="mt-2 text-gray-500">Searching...</p>}

      {!loading && results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((user) => (
            <li
              key={user._id}
              className="flex items-center border p-2 rounded bg-gray-100"
            >
              <div>
                <strong>{user.name}</strong> — {user.email}
              </div>

              <div className="ml-auto cursor-pointer">
                {sentRequests.includes(user._id) ? (
                  <Clock className="text-yellow-600" />
                ) : (
                  <UserPlus
                    className="text-[#39625C] hover:text-green-800"
                    onClick={() => sendFriendRequest(user._id)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && notFound && (
        <p className="mt-4 text-red-500">No user found.</p>
      )}
    </div>
  );
};

export default AddFriendsPage;
