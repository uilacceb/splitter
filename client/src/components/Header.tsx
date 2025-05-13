import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-evenly items-center bg-gray-800 text-white p-4">
      <p onClick={() => navigate("/friends")}>Friends</p>
      <p onClick={() => navigate("/groups")}>Groups</p>
      <p onClick={() => navigate("/account")}>Account</p>
    </div>
  );
};

export default Header;
