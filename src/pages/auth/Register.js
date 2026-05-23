import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerApi } from "../../api/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import "./Auth.css";

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "job_seeker" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await registerApi(form);
      const { token, user } = res.data.data;
      login({ ...user, token });
      navigate(user.role === "job_seeker" ? "/home" : "/recruiter/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page page-center">
      <div className="auth-card fade-up">
        <div className="auth-logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <span>NaukriClone</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join thousands of professionals</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} required />

          <div className="role-toggle-wrap">
            <label className="input-label">I am a</label>
            <div className="role-toggle">
              {[{ v: "job_seeker", l: "Job Seeker" }, { v: "recruiter", l: "Recruiter" }].map(o => (
                <button
                  key={o.v}
                  type="button"
                  className={`role-btn ${form.role === o.v ? "active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, role: o.v }))}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" loading={loading} className="btn-full" style={{ marginTop: 8 }}>
            Create Account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}