import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-evenly items-center bg-gray-800 text-white p-4">
      <p className="cursor-pointer" onClick={() => navigate("/friends")}>
        Friends
      </p>
      <p className="cursor-pointer" onClick={() => navigate("/groups")}>
        Groups
      </p>
      <p className="cursor-pointer" onClick={() => navigate("/account")}>
        Account
      </p>
    </div>
  );
};

export default Header;
