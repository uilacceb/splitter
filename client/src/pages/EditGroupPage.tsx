import React, { useEffect, useState } from "react";
import { groupIcons } from "../icons";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useRequestCounts } from "../context/RequestContext";
import { Edit, RefreshCcw } from "lucide-react";

type Friend = {
  _id: string;
  name: string;
  picture: string;
  email?: string;
};

type Group = {
  _id: string;
  title: string;
  icon: string;
  createdBy: {
    _id: string;
  };
  members: Friend[];
};

const EditGroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [randomIcon, setRandomIcon] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { counts } = useRequestCounts();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}`);
        setGroup(res.data);
        setGroupName(res.data.title);
        setRandomIcon(res.data.icon);
        setSelectedFriends(res.data.members);
      } catch (err) {
        console.error("Failed to fetch group", err);
      }
    };
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    const fetchFriends = async () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      try {
        const res = await axios.get(`/api/users/friends?userId=${currentUser._id}`);
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

  const addFriendToGroup = async (friend: Friend) => {
    try {
      await axios.put(`/api/groups/${groupId}/members/add`, {
        userId: friend._id,
      });
      setSelectedFriends((prev) => [...prev, friend]);
    } catch (err) {
      console.error("Failed to add member", err);
    }
    setQuery("");
  };

  const removeFriendFromGroup = async (friend: Friend) => {
    if (group?.createdBy._id !== currentUser._id) return; // Only admin
    try {
      await axios.put(`/api/groups/${groupId}/members/remove`, {
        userId: friend._id,
      });
      setSelectedFriends((prev) => prev.filter((f) => f._id !== friend._id));
    } catch (err) {
      console.error("Failed to remove member", err);
    }
  };

  const handleUpdateGroup = async (e: any) => {
    e.preventDefault();
    if (!groupName.trim()) return setError("Please enter a group name.");
    if (!randomIcon) return setError("Group icon is missing.");

    try {
      await axios.put(`/api/groups/${groupId}/edit`, {
        title: groupName,
        icon: randomIcon,
        userId: currentUser._id,
      });
      alert("Group updated successfully");
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error("Failed to update group", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const refreshIcon = () => {
    const index = Math.floor(Math.random() * groupIcons.length);
    setRandomIcon(groupIcons[index]);
  };

  return (
    <form
      className="m-4 h-screen flex flex-col space-y-4 p-4 gap-8"
      onSubmit={handleUpdateGroup}
    >
      <div className="flex flex-col">
        <label className="text-2xl font-semibold pb-2">Group Title</label>
        <input
          type="text"
          className="border-2 border-gray-300 p-2 w-[70%]"
          onChange={(e) => setGroupName(e.target.value)}
          value={groupName}
          placeholder="Enter group name"
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold pb-4">Group Icon</h1>
        <div className="flex items-center space-x-2">
          {randomIcon && (
            <img
              src={randomIcon}
              alt="Group Icon"
              width={70}
              height={70}
              className="mr-6"
            />
          )}
          <RefreshCcw color="#a9b0ab" onClick={refreshIcon} />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold pb-2">Add Participants</h1>
        <input
          className="border-2 border-gray-400 p-2 mt-1 block w-[70%]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search user by email or name"
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
        <h2 className="text-xl font-semibold mt-4 pb-2">
          Current Participants:
        </h2>
        <ul className="mt-2 space-y-2">
          {selectedFriends.map((friend) => (
            <li key={friend._id} className="flex items-center w-[100%] p-2">
              <img
                src={friend.picture}
                alt={friend.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="ml-2">{friend.name}</span>
              {group?.createdBy._id === currentUser._id && (
                <button
                  type="button"
                  className="bg-red-500 text-white ml-auto p-1 rounded cursor-pointer"
                  onClick={() => removeFriendFromGroup(friend)}
                >
                  remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="submit"
        className="bg-[#2F5A62] text-white p-2 rounded text-xl"
      >
        Update
      </button>
      {error && <span className="text-red-500 mt-1 text-2xl">{error}</span>}
    </form>
  );
};

export default EditGroupPage;
