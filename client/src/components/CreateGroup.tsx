import { useNavigate } from "react-router-dom";

const CreateGroup = () => {
  const navigate = useNavigate();
  return (
    <div className="md:py-4">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-[#39625C] text-white rounded hover:bg-[#83A99B] transition duration-300 md:text-2xl"
        type="button"
        onClick={() => navigate("/create-group")}
      >
        Create Group
      </button>
    </div>
  );
};

export default CreateGroup;
