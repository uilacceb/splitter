import { useEffect, useState } from "react";
import GroupList from "../components/GroupList";
import NoGroups from "../components/NoGroups";
import axios from "axios";

const GroupPage = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    axios
      .get(`/api/groups?userId=${currentUser._id}`)
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Error fetching groups", err));
  }, []);

  return (
    <>
      {groups.length === 0 ? <NoGroups /> : <></>}
      <GroupList groups={groups} />
    </>
  );
};

export default GroupPage;
