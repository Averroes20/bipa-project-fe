import type { ReactNode } from "react";
import { Navigate } from "react-router";

interface Props {

  children: ReactNode;
}


export default function ProtectedRoute ({
  children,
}: Props) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login page or show an error
    return <Navigate to="/login" />;
  }

  return children;
}