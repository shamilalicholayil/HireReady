import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import axiosInstance from "../../api/axiosInstance";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axiosInstance
      .get("/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        dispatch(setCredentials({ user: res.data.user, accessToken: token }));
        navigate("/dashboard");
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  return <p>Redirecting...</p>;
}
