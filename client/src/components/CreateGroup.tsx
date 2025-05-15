import { useNavigate } from "react-router-dom";

const CreateGroup = () => {
  const navigate = useNavigate();
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 bg-[#39625C] text-white rounded hover:bg-[#83A99B] transition duration-300"
      type="button"
      onClick={() => navigate("/create-group")}
    >
      Create Group
    </button>
  );
};

export default CreateGroup;
