import { useEffect, useState } from "react";
import GroupList from "../components/GroupList";
import NoGroups from "../components/NoGroups";
import axios from "axios";
import Welcome from "../components/Welcome";
import { useAuth } from "../context/AuthContext";

const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch if user and user._id exists
    if (!user || !user._id) return;

    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/groups?userId=${user._id}`
        );
        setGroups(res.data);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      }
    };

    fetchGroups();
  }, [user?._id]);

  return (
    <>
      {groups.length === 0 ? <NoGroups /> : <Welcome />}
      <GroupList groups={groups} />
    </>
  );
};

export default GroupPage;
