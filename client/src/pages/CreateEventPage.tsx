import React from "react";
import { useAuth } from "../context/AuthContext";

const CreateEventPage = () => {
  const { user } = useAuth();
  return <div>hello {user?.name}</div>;
};

export default CreateEventPage;
