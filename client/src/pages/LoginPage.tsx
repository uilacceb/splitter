import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRequestCounts } from "../context/RequestContext";
import catPoint from "../assets/cat point.gif";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { refreshCounts } = useRequestCounts();
  const handleLoginSuccess = async (credentialResponse: any) => {
    const decoded: any = jwtDecode(credentialResponse.credential);
    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/users/google-auth`,
      {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub, // unique Google ID
      }
    );

    localStorage.setItem("user", JSON.stringify(res.data));
    refreshCounts();
    setUser(res.data);
    navigate("/friends");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-[#2f6253]   via-[#83A99B]  to-[#c9f4e4]">
      <img src={catPoint} alt="sticker" className="w-24" />
      <div>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log("Login Failed")}
          auto_select={true}
          width="200px"
          cancel_on_tap_outside={true}
          theme="filled_black"
        />
      </div>
    </div>
  );
};

export default LoginPage;
