import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AccountPage = () => {
  const navigate = useNavigate();
  const { setUser, user } = useAuth(); // reset user from context

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null); // clear auth context
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Account</h1>
      <h2>
        {user?.name} - {user?.email}
      </h2>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default AccountPage;
