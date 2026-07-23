import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { roleHomeMap } from "../constants/roles";

export default function RootRedirect() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.hrStatus === "pending") {
    return <Navigate to="/hr-verification-pending" replace />;
  }
  if (user?.hrStatus === "rejected") {
    return <Navigate to="/hr-application-rejected" replace />;
  }

  return <Navigate to={roleHomeMap[user?.role] || "/login"} replace />;
}
