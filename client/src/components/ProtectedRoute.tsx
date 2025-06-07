import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactElement } from "react";

type ProtectedRouteProps = {
  children: ReactElement;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  if (loading) {
    // Show a spinner, skeleton, or nothing while auth is being restored
    return <div>Loading...</div>;
  }
  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
