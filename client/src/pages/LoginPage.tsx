import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRequestCounts } from "../context/RequestContext";
import { Annoyed } from "lucide-react";

const WAVE_TEXT = "Sign in with Google";

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
        const res = await axios.post("/api/users/google-auth", {
          email: data.email,
          name: data.name,
          picture: data.picture,
          sub: data.sub,
        });

        localStorage.setItem("user", JSON.stringify(res.data));
        refreshCounts();
        setUser(res.data);
        navigate("/friends");
      } catch (error) {
        alert("Google Login Failed! Please try again.");
      }
    },
    onError: () => alert("Google Login Failed!"),
  });

  // Each letter is wrapped with a span for wave effect
  const renderWaveText = (text: string) =>
    text.split("").map((char, idx) => (
      <span
        key={idx}
        className={`inline-block transition-transform duration-200 group-hover:-translate-y-2`}
        style={{ transitionDelay: `${idx * 40}ms` }} // 40ms per letter for ripple
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#eee] via-[#83A99B] to-[#2F5A62]">
      <button
        onClick={() => login()}
        className="group relative flex items-center gap-4 px-8 py-4 rounded-full border-2 border-dashed border-white shadow-xl bg-white/90 hover:bg-white/100 hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95"
      >
        <Annoyed size={32} />
        <span className="font-bold text-lg tracking-wider text-indigo-900">
          {renderWaveText(WAVE_TEXT)}
        </span>
      </button>
    </div>
  );
};

export default LoginPage;
