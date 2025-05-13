import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const handleLoginSuccess = async (credentialResponse: any) => {
    const decoded: any = jwtDecode(credentialResponse.credential);
    const res = await axios.post("/api/users/google-auth", {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      sub: decoded.sub, // unique Google ID
    });

    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    navigate("/friends");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
};

export default LoginPage;
