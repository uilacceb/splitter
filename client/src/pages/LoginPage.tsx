import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRequestCounts } from "../context/RequestContext";
import SlideToLoginButton from "../components/SlideToLoginButton"; // Update path as needed

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { refreshCounts } = useRequestCounts();

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/google-auth`, {
          email: data.email,
          name: data.name,
          picture: data.picture,
          sub: data.sub,
        });

        // localStorage.setItem("user", JSON.stringify(res.data));
        refreshCounts();
        setUser(res.data);
        navigate("/friends");
      } catch (error) {
        alert("Google Login Failed! Please try again.");
      }
    },
    onError: () => alert("Google Login Failed!"),
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#eee] via-[#83A99B] to-[#2F5A62]">
      <SlideToLoginButton onComplete={login} />
    </div>
  );
};

export default LoginPage;
