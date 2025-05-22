import { useNavigate } from "react-router-dom";
import { useRequestCounts } from "../context/RequestContext";

const Header = () => {
  const navigate = useNavigate();
  const { counts, refreshCounts } = useRequestCounts();

  return (
    <div className="flex justify-evenly items-center bg-[#39625C] text-white p-6 text-xl">
      <p className="cursor-pointer" onClick={() => navigate("/friends")}>
        Friends
      </p>
      <p className="cursor-pointer" onClick={() => navigate("/groups")}>
        Groups
      </p>
      <div className="relative">
        <p className="cursor-pointer " onClick={() => navigate("/account")}>
          Account
        </p>
        {counts.total > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded blur-[0.6px] absolute top-0 -right-1/4">
            {" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
