import React, { useEffect, useState } from "react";
import { groupIcons } from "../icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRequestCounts } from "../context/RequestContext";
import { RefreshCcw } from "lucide-react";
import GoBack from "../components/GoBack";

type Friend = {
  _id: string;
  name: string;
  picture: string;
  email?: string;
};

const CreateGroupPage = () => {
  const [randomIcon, setRandomIcon] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { counts } = useRequestCounts();

  useEffect(() => {
    const index = Math.floor(Math.random() * groupIcons.length);
    setRandomIcon(groupIcons[index]);
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/users/friends?userId=${currentUser._id}`
        );
        setFriends(res.data);
      } catch (error) {
        console.error("Failed to fetch friend list", error);
      }
    };
    fetchFriends();
  }, []);

  const filteredResults = query
    ? friends.filter(
        (f) =>
          f.name?.toLowerCase().includes(query.toLowerCase()) ||
          f.email?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const addFriendToGroup = (friend: Friend) => {
    if (!selectedFriends.find((f) => f._id === friend._id)) {
      setSelectedFriends((prev) => [...prev, friend]);
    }
    setQuery(""); // clear search field
  };

  const removeFriendFromGroup = (friend: Friend) => {
    setSelectedFriends((prev) => prev.filter((f) => f._id !== friend._id));
  };

  const createGroup = async (e: any) => {
    e.preventDefault();
    setError("");
    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    if (!randomIcon) {
      setError("Group icon is missing.");
      return;
    }

    if (selectedFriends.length === 0) {
      setError("Please select at least one participant.");
      return;
    }

    setError(null); // Clear error if all is valid

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const payload = {
      title: groupName,
      icon: randomIcon,
      members: selectedFriends.map((f) => f._id),
      fromUserId: currentUser._id,
    };

    console.log("Payload being sent:", payload);
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/groups`, payload);
      alert("Group created successfully!");
      navigate(`/groups`);
      setGroupName("");
      setSelectedFriends([]);
      setQuery("");
      const index = Math.floor(Math.random() * groupIcons.length);
      setRandomIcon(groupIcons[index]);
    } catch (err) {
      console.error("Failed to create group", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const refreshIcon = () => {
    const index = Math.floor(Math.random() * groupIcons.length);
    setRandomIcon(groupIcons[index]);
  };

  return (
    <>
      <div className=" pr-4 pt-4 relative">
        <GoBack />
        <p
          className="text-right cursor-pointer md:text-2xl"
          onClick={() => navigate("/requests")}
        >
          Requests ({counts.total})
        </p>
      </div>
      <form
        className="m-4 h-screen flex flex-col space-y-4 p-4 gap-8"
        onSubmit={createGroup}
      >
        <div className="flex flex-col">
          <label className="text-2xl font-semibold pb-2 md:text-3xl">
            Group Title
          </label>
          <input
            type="text"
            className="border-2 border-gray-300 p-2 w-[70%] md:text-2xl"
            onChange={(e) => setGroupName(e.target.value)}
            value={groupName}
            placeholder="Enter group name"
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold pb-4 md:text-3xl">
            Group Icon
          </h1>
          <div className="flex items-center space-x-2">
            {randomIcon && (
              <img
                src={randomIcon}
                alt="Group Icon"
                width={70}
                height={70}
                className="mr-6 md:w-24 md:h-24"
              />
            )}
            <RefreshCcw color="#a9b0ab" onClick={refreshIcon} />
          </div>
          <a
            href="https://www.flaticon.com/free-icons/bee"
            title="icons reference"
            className="text-sm pt-4 text-gray-500 block w-[70px] md:text-lg md:w-[80px]"
          >
            (by Freepik - Flaticon)
          </a>
        </div>

        <div>
          <h1 className="text-2xl font-semibold pb-2 md:text-3xl">
            Add Participants
          </h1>
          <label htmlFor="email" className="md:text-xl">Enter email or name</label>
          <input
            id="email"
            className="border-2 border-gray-400 p-2 mt-1 block w-[70%] md:text-2xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user by email or name"
          />

          {filteredResults.length > 0 && (
            <ul className="mt-2 space-y-2">
              {filteredResults.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center justify-between border p-2 rounded bg-gray-100 cursor-pointer md:text-2xl"
                  onClick={() => addFriendToGroup(user)}
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{user.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 md:text-2xl">{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-4 pb-2 md:text-2xl">
            Selected Participants:
          </h2>
          <ul className="mt-2 space-y-2">
            {selectedFriends.map((friend) => (
              <li key={friend._id} className="flex items-center w-[100%] p-2 md:text-2xl">
                <img
                  src={friend.picture}
                  alt={friend.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="ml-2">{friend.name}</span>
                <button
                  type="button"
                  className="bg-red-500 text-white ml-auto p-1 rounded cursor-pointer md:p-2"
                  onClick={() => removeFriendFromGroup(friend)}
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="submit"
          className="bg-[#2F5A62] text-white p-2 rounded text-xl md:text-2xl"
        >
          create
        </button>
        {error && <span className="text-red-500  mt-1 text-2xl">{error}</span>}
      </form>
    </>
  );
};

export default CreateGroupPage;
