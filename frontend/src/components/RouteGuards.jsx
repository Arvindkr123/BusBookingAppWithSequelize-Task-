import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

export function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Checking your session…" />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (admin && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return children;
}
