import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUnreadCountApi } from "../../api/chat";
import "./Navbar.css";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const isSeeker = user?.role === "job_seeker";

  useEffect(() => {
    if (!user) return;
    const fetch = () => getUnreadCountApi().then(r => setUnread(r.data.data.unreadCount)).catch(() => {});
    fetch();
    const t = setInterval(fetch, 15000);
    return () => clearInterval(t);
  }, [user]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <span>NaukriClone</span>
        </Link>

        <div className="navbar-links">
          {isSeeker ? (
            <>
              <Link to="/home" className="nav-link">Jobs</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/recruiter/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/recruiter/post-job" className="nav-link">Post Job</Link>
              <Link to="/recruiter/profile" className="nav-link">Profile</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          <Link to="/chat" className="nav-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {unread > 0 && <span className="nav-badge">{unread > 9 ? "9+" : unread}</span>}
          </Link>
          <button onClick={handleLogout} className="nav-icon-btn logout-btn" title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}