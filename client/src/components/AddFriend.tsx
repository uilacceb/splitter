import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddFriend = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-[1rem] flex justify-end pb-[0.3rem] pr-[1rem]">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-[#39625C] text-white rounded hover:bg-[#83A99B] transition duration-300"
        type="button"
        onClick={() => navigate("/add-friend")}
      >
        <UserPlus size={20} />
        Add friend
      </button>
    </div>
  );
};

export default AddFriend;
