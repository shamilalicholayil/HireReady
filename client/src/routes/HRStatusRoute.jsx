import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { roleHomeMap } from "../constants/roles";

export default function HRStatusRoute({ allowedStatus }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.hrStatus === allowedStatus) {
    return <Outlet />;
  }

  if (user?.hrStatus === "pending") {
    return <Navigate to="/hr-verification-pending" replace />;
  }
  if (user?.hrStatus === "rejected") {
    return <Navigate to="/hr-application-rejected" replace />;
  }

  return <Navigate to={roleHomeMap[user?.role] || "/login"} replace />;
}
