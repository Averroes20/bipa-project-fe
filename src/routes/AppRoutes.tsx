import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Analyze from "../pages/Analyze";
import Analytics from "../pages/Analytics";
import Dataset from "../pages/Dataset";
import ProtectedRoute from "../components/layout/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
                <Analytics />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dataset"
          element={
            <ProtectedRoute>
                <Dataset />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
                <Analyze />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyze/:analysisId"
          element={
            <ProtectedRoute>
                <Analyze />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
