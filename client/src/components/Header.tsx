import { useNavigate } from "react-router-dom";
import { useRequestCounts } from "../context/RequestContext";

const Header = () => {
  const navigate = useNavigate();
  const { counts } = useRequestCounts();

  return (
    <div className="flex justify-evenly items-center bg-[#39625C] text-white p-6 text-xl">
      <div className="relative">
        <p className="cursor-pointer" onClick={() => navigate("/friends")}>
          Friends
        </p>
        {counts.friend > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded blur-[0.6px] absolute top-0 -right-2">
            {" "}
          </div>
        )}
      </div>
      <div className="relative ">
        <p className="cursor-pointer" onClick={() => navigate("/groups")}>
          Groups
        </p>
        {counts.group > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded blur-[0.6px] absolute top-0 -right-2">
            {" "}
          </div>
        )}
      </div>
      <div>
        <p className="cursor-pointer " onClick={() => navigate("/account")}>
          Account
        </p>
      </div>
    </div>
  );
};

export default Header;
