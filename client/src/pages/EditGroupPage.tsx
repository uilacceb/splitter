import React, { useEffect, useState } from "react";
import { groupIcons } from "../icons";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useRequestCounts } from "../context/RequestContext";
import { RefreshCcw } from "lucide-react";
import GoBack from "../components/GoBack";

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

type GroupRequest = {
  _id: string;
  to: Friend;
  status: string;
};

const EditGroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [randomIcon, setRandomIcon] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<GroupRequest[]>([]);
  const [newInvites, setNewInvites] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessages, setSuccessMessages] = useState<string[]>([]);
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
  }, [currentUser._id]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}/pending-requests`);
        setPendingRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch pending requests", err);
      }
    };
    fetchPendingRequests();
  }, [groupId]);

  const filteredResults = query
    ? friends.filter(
        (f) =>
          f.name?.toLowerCase().includes(query.toLowerCase()) ||
          f.email?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const addFriendToGroup = (friend: Friend) => {
    if (
      !selectedFriends.find((f) => f._id === friend._id) &&
      !pendingRequests.find((r) => r.to._id === friend._id) &&
      !newInvites.find((f) => f._id === friend._id)
    ) {
      setNewInvites((prev) => [...prev, friend]);
    }
    setQuery("");
  };

  const removeFriendFromGroup = async (friend: Friend) => {
    if (group?.createdBy._id !== currentUser._id) return;
    try {
      await axios.put(`/api/groups/${groupId}/members/remove`, {
        userId: friend._id,
      });
      setSelectedFriends((prev) => prev.filter((f) => f._id !== friend._id));
    } catch (err) {
      console.error("Failed to remove member", err);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessages([]);

    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }
    if (!randomIcon) {
      setError("Group icon is missing.");
      return;
    }

    try {
      await axios.put(`/api/groups/${groupId}/edit`, {
        title: groupName,
        icon: randomIcon,
        userId: currentUser._id,
      });

      // Send invitations to new invites
      for (const friend of newInvites) {
        await axios.post(`/api/groups/${groupId}/invite`, {
          toUserId: friend._id,
          fromUserId: currentUser._id,
        });
        setSuccessMessages((prev) => [
          ...prev,
          `Request sent to ${friend.name}`,
        ]);
      }

      setNewInvites([]);
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

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this group?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/api/groups/${groupId}`);
      alert("Group deleted successfully");
      navigate("/groups");
    } catch (err) {
      console.error("Failed to delete group", err);
      setError("Failed to delete group. Please try again.");
    }
  };

  return (
    <form
      className="m-4 flex flex-col space-y-4 p-4  relative"
      onSubmit={handleUpdateGroup}
    >
      <GoBack />
      <div className="flex flex-col md:pb-4">
        <label className="text-2xl font-semibold pt-3 pb-2 md:text-3xl md:pt-6">
          Group Title
        </label>
        <input
          type="text"
          className="border-2 border-gray-300 p-2 w-[70%] md:text-2xl"
          onChange={(e) => setGroupName(e.target.value)}
          value={groupName}
          placeholder="Change your group name"
        />
      </div>

      <div className="md:pb-4">
        <h1 className="text-2xl font-semibold pb-4 md:text-3xl">Group Icon</h1>
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

      <div className="md:pb-4">
        <h1 className="text-2xl font-semibold pb-2 md:text-3xl">
          Add Participants
        </h1>
        <input
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
        <h2 className="text-xl font-semibold mt-4 pb-2 md:text-3xl">
          Current Participants:
        </h2>
        <ul className="mt-2 space-y-2 md:space-y-4">
          {selectedFriends.map((friend) => (
            <li key={friend._id} className="flex items-center w-[100%] p-2">
              <img
                src={friend.picture}
                alt={friend.name}
                className="w-6 h-6 rounded-full md:w-7 md:h-7 md:mr-2"
              />
              <span className="ml-2 md:text-2xl">{friend.name}</span>
              {group?.createdBy._id === currentUser._id && (
                <button
                  type="button"
                  className=" text-red-500 ml-auto p-1 rounded cursor-pointer md:text-2xl"
                  onClick={() => removeFriendFromGroup(friend)}
                >
                  remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-4 pb-2 md:text-2xl">
            Pending Invitations:
          </h2>
          <ul className="mt-2 space-y-2">
            {pendingRequests.map((request) => (
              <li key={request._id} className="flex items-center w-[100%] p-2">
                <img
                  src={request.to.picture}
                  alt={request.to.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="ml-2">{request.to.name}</span>
                <span className="ml-4 text-gray-500">(Pending)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {newInvites.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-4 pb-2 md:text-2xl">
            New Invitations to be Sent:
          </h2>
          <ul className="mt-2 space-y-2">
            {newInvites.map((friend) => (
              <li key={friend._id} className="flex items-center w-[100%] p-2">
                <img
                  src={friend.picture}
                  alt={friend.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="ml-2">{friend.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {successMessages.length > 0 && (
        <div className="mt-4 text-green-600 space-y-1">
          {successMessages.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      {error && <span className="text-red-500 mt-1 text-2xl">{error}</span>}
      <div className="flex flex-col gap-2 pt-4 md:gap-3 md:pt-8">
        <button
          type="submit"
          className="bg-[#2F5A62] text-white p-2 rounded text-xl md:text-2xl"
        >
          Update
        </button>
        <button
          type="button"
          onClick={handleDeleteGroup}
          className="bg-[#e03535] text-white p-2 rounded text-xl md:text-2xl"
        >
          Delete Group
        </button>
      </div>
    </form>
  );
};

export default EditGroupPage;
