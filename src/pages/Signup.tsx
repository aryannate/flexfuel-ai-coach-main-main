import { Navigate } from "react-router-dom";

// Signup is disabled — accounts are created by the Coach
export default function Signup() {
  return <Navigate to="/login" replace />;
}
