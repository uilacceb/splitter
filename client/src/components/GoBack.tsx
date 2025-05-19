import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const GoBack = () => {
  const navigate = useNavigate();
  return (
    <div
      className="absolute top-2 left-2 cursor-pointer text-[#8d938f]"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="inline" />
      Go back
    </div>
  );
};

export default GoBack;
