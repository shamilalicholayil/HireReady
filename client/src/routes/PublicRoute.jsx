import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function PublicRoute() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}

export default PublicRoute;
