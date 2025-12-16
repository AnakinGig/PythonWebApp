import { Navigate } from "react-router-dom";

function PrivateRoute({ user, requiredRole, requireUnverified, children }) {
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  if (requireUnverified && user.email_verified) return <Navigate to="/profile" />;
  return children;
}

export default PrivateRoute;