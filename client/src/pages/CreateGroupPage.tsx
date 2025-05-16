import React, { useEffect, useState } from "react";
import { groupIcons } from "../icons";
import axios from "axios";

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

  useEffect(() => {
    const index = Math.floor(Math.random() * groupIcons.length);
    setRandomIcon(groupIcons[index]);
  }, []);

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

  return (
    <form className="m-4 h-screen flex flex-col space-y-4 p-4">
      <div className="flex flex-col">
        <label className="text-2xl font-semibold">Group Title</label>
        <input type="text" className="border-2 border-gray-300 p-2 w-[60%]" />
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Group Icon</h1>
        {randomIcon && (
          <img src={randomIcon} alt="Group Icon" width={50} height={50} />
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Add Participants</h1>
        <label htmlFor="email">Enter email or name</label>
        <input
          id="email"
          className="border-2 border-gray-400 p-2 mt-1 block"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search user by email"
        />

        {filteredResults.length > 0 && (
          <ul className="mt-2 space-y-2">
            {filteredResults.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between border p-2 rounded bg-gray-100 cursor-pointer"
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
                <span className="text-sm text-gray-500">{user.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-4">Selected Participants:</h2>
        <ul className="mt-2 space-y-2">
          {selectedFriends.map((friend) => (
            <li key={friend._id} className="flex items-center space-x-2">
              <img
                src={friend.picture}
                alt={friend.name}
                className="w-6 h-6 rounded-full"
              />
              <span>{friend.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className="bg-[#2F5A62] text-white p-2 rounded text-xl">
        create
      </button>
    </form>
  );
};

export default CreateGroupPage;
