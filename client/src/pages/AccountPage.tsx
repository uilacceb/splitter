import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRequestCounts } from "../context/RequestContext";
import GoBack from "../components/GoBack";

const AccountPage = () => {
  const navigate = useNavigate();
  const { setUser, user } = useAuth(); // reset user from context
  const { counts, refreshCounts } = useRequestCounts();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null); // clear auth context
    navigate("/login");
  };

  return (
    <div className="p-6 ">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-4 pt-6">
          Welcome {user?.name.split(" ")[0]}!
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 inline"
        >
          Logout
        </button>
      </div>

      <p>
        You have {counts.total} request(s)
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#39625C] text-white rounded hover:bg-[#83A99B] transition duration-300"
          type="button"
          onClick={() => navigate("/requests")}
        >
          Check requests
        </button>
      </p>
    </div>
  );
};

export default AccountPage;
