import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import { Login }    from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ChatInbox }  from "./pages/chat/ChatInbox";
import { ChatWindow } from "./pages/chat/ChatWindow";
import { SeekerHome } from "./pages/seeker/SeekerHome";
import { RecruiterDashboard } from "./pages/recruiter/RecruiterDashboard";
import { PostJob } from "./pages/recruiter/PostJob";

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0F1E" }}>
      <div className="spinner" />
    </div>
  );
}

console.log(process.env.REACT_APP_BACKEND_URL);

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "job_seeker" ? "/home" : "/recruiter/dashboard"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"        element={<RootRedirect />} />
      <Route path="/login"   element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Seeker */}
      <Route path="/home" element={
        <PrivateRoute role="job_seeker"><SeekerHome /></PrivateRoute>
      } />

      {/* Recruiter */}
      <Route path="/recruiter/dashboard" element={
        <PrivateRoute role="recruiter"><RecruiterDashboard /></PrivateRoute>
      } />
      <Route path="/recruiter/post-job" element={
        <PrivateRoute role="recruiter"><PostJob /></PrivateRoute>
      } />

      {/* Chat — both roles */}
      <Route path="/chat" element={
        <PrivateRoute><ChatInbox /></PrivateRoute>
      } />
      <Route path="/chat/:conversationId" element={
        <PrivateRoute><ChatWindow /></PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}