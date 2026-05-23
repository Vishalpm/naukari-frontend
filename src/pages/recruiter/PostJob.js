import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { createJobApi } from "../../api/jobs";
import "./Recruiter.css";

export function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", location: "", skills: "",
    jobType: "full_time", experienceMin: "", experienceMax: "",
    salaryMin: "", salaryMax: "", industry: "", department: "",
    education: "", openings: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await createJobApi({
        ...form,
        location: form.location.split(",").map(s => s.trim()).filter(Boolean),
        skills:   form.skills.split(",").map(s => s.trim()).filter(Boolean),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        experienceMin: form.experienceMin ? Number(form.experienceMin) : undefined,
        experienceMax: form.experienceMax ? Number(form.experienceMax) : undefined,
        openings: Number(form.openings),
      });
      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="form-page fade-up">
        <div className="form-header">
          <h1 className="page-title">Post a Job</h1>
          <p className="page-sub">Fill in the details to attract the right candidates</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-section">
            <h3 className="section-title">Basic Info</h3>
            <div className="form-grid">
              <Input label="Job Title *" placeholder="e.g. Senior Node.js Developer" value={form.title} onChange={set("title")} required />
              <Input label="Industry" placeholder="e.g. Information Technology" value={form.industry} onChange={set("industry")} />
              <Input label="Department" placeholder="e.g. Engineering" value={form.department} onChange={set("department")} />
              <div className="input-wrap">
                <label className="input-label">Job Type</label>
                <select className="form-select" value={form.jobType} onChange={set("jobType")}>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Location & Openings</h3>
            <div className="form-grid">
              <Input label="Locations * (comma-separated)" placeholder="Bangalore, Mumbai, Remote" value={form.location} onChange={set("location")} required />
              <Input label="No. of Openings" type="number" min={1} value={form.openings} onChange={set("openings")} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Experience & Salary</h3>
            <div className="form-grid-4">
              <Input label="Min Experience (yrs)" type="number" min={0} value={form.experienceMin} onChange={set("experienceMin")} />
              <Input label="Max Experience (yrs)" type="number" min={0} value={form.experienceMax} onChange={set("experienceMax")} />
              <Input label="Min Salary (₹/yr)" type="number" value={form.salaryMin} onChange={set("salaryMin")} />
              <Input label="Max Salary (₹/yr)" type="number" value={form.salaryMax} onChange={set("salaryMax")} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Skills & Requirements</h3>
            <Input label="Skills * (comma-separated)" placeholder="Node.js, React, PostgreSQL" value={form.skills} onChange={set("skills")} required />
            <div style={{ marginTop: 12 }}>
              <Input label="Education" placeholder="e.g. B.Tech, Any Graduate" value={form.education} onChange={set("education")} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Job Description *</h3>
            <textarea
              className="form-textarea"
              placeholder="Describe the role, responsibilities, perks..."
              value={form.description}
              onChange={set("description")}
              rows={6}
              required
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate("/recruiter/dashboard")}>Cancel</Button>
            <Button type="submit" loading={loading}>Post Job</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}