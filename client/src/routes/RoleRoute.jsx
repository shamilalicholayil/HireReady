import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { roleHomeMap } from "../constants/roles";

export default function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={roleHomeMap[user?.role] || "/login"} replace />;
  }

  return <Outlet />;
}
