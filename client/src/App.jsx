import { useEffect } from "react";
import { Toaster } from "sonner";
import { useDispatch } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import axiosInstance from "./api/axiosInstance";

import { setCredentials, setLoading } from "./features/auth/authSlice";
import { useTheme } from "./hooks/useTheme";

import "./styles/App.css";

function App() {
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  useEffect(() => {
    const refresh = async () => {
      dispatch(setLoading(true));
      try {
        const tokenRes = await axiosInstance.post("/auth/refresh");
        const { accessToken } = tokenRes.data;

        const profileRes = await axiosInstance.get("/profile/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        dispatch(
          setCredentials({
            user: profileRes.data.userData,
            accessToken,
          }),
        );
      } catch (err) {
        // refresh failed
      } finally {
        dispatch(setLoading(false));
      }
    };
    refresh();
  }, []);
  return (
    <>
      <AppRoutes />
      <Toaster
        richColors
        position="top-right"
        theme={isDark ? "dark" : "light"}
      />
    </>
  );
}

export default App;
