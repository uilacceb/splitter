import { useEffect, useState } from "react";
import GroupList from "../components/GroupList";
import NoGroups from "../components/NoGroups";
import axios from "axios";
import Welcome from "../components/Welcome";

const GroupPage = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/groups?userId=${currentUser._id}`)
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Error fetching groups", err));
  }, []);

  return (
    <>
      {groups.length === 0 ? <NoGroups /> : <Welcome />}
      <GroupList groups={groups} />
    </>
  );
};

export default GroupPage;
