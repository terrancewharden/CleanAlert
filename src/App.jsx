import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Subscribe from "./pages/Subscribe.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import CleanerDashboard from "./pages/CleanerDashboard.jsx";
import Admin from "./pages/Admin.jsx";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight:"100vh", background:"#0a1628", display:"flex", alignItems:"center", justifyContent:"center", color:"#00d4ff", fontFamily:"system-ui" }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.user_type)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/subscribe" element={
        <ProtectedRoute roles={["cleaner"]}><Subscribe /></ProtectedRoute>
      } />
      <Route path="/subscribe/success" element={
        <ProtectedRoute roles={["cleaner"]}><Subscribe /></ProtectedRoute>
      } />
      <Route path="/buyer" element={
        <ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>
      } />
      <Route path="/cleaner" element={
        <ProtectedRoute roles={["cleaner"]}><CleanerDashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
