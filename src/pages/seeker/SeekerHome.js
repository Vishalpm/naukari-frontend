import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { searchJobsApi, getRecommendedApi } from "../../api/jobs";
import { seekerStartChatApi } from "../../api/chat";
import "./SeekerHome.css";

const fmtSalary = (n) => n ? `₹${(n/100000).toFixed(1)}L` : null;
const fmtExp    = (min, max) => {
  if (!min && !max) return null;
  if (!max) return `${min}+ yrs`;
  if (!min) return `0-${max} yrs`;
  return `${min}-${max} yrs`;
};

function JobCard({ job, onMessage }) {
  return (
    <div className="job-card fade-up">
      <div className="job-card-top">
        <div className="job-company-logo">
          {job.recruiter?.companyLogo
            ? <img src={`${process.env.REACT_APP_BACKEND_URL}/${job.recruiter.companyLogo}`} alt="" />
            : <span>{(job.recruiter?.companyName || "?").charAt(0)}</span>
          }
        </div>
        <div className="job-card-meta">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.recruiter?.companyName}</p>
        </div>
      </div>

      <div className="job-tags">
        {job.location?.map(l => <Badge key={l} variant="slate">{l}</Badge>)}
        {fmtExp(job.experienceMin, job.experienceMax) && <Badge variant="blue">{fmtExp(job.experienceMin, job.experienceMax)}</Badge>}
        {(job.salaryMin || job.salaryMax) && <Badge variant="green">{fmtSalary(job.salaryMin)} – {fmtSalary(job.salaryMax)}</Badge>}
        <Badge variant="amber">{job.jobType?.replace("_", " ")}</Badge>
      </div>

      <p className="job-desc">{job.description?.slice(0, 140)}…</p>

      <div className="job-card-actions">
        <button className="job-msg-btn" onClick={() => onMessage(job._id || job.id)} title="Message Recruiter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Message
        </button>
        <span className="job-posted">
          {new Date(job.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}

export function SeekerHome() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: "", location: "", jobType: "" });

  const load = (params = {}) => {
    setLoading(true);
    searchJobsApi({ ...filters, ...params })
      .then(r => setJobs(r.data.data.jobs))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const handleMessage = async (jobId) => {
    try {
      console.log(jobId);
      const res = await seekerStartChatApi(jobId);
      navigate(`/chat/${res.data.data.conversationId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start chat");
    }
  };

  return (
    <Layout>
      <div className="seeker-home">
        <div className="home-hero fade-up">
          <h1>Find your <span className="hero-accent">next role</span></h1>
          <p>Thousands of jobs from top companies across India</p>
        </div>


        <form className="search-bar fade-up" onSubmit={handleSearch}>
          <Input placeholder="Job title, skills..." value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} />
          <Input placeholder="Location" value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} />
          <select className="filter-select" value={filters.jobType} onChange={e => setFilters(f => ({ ...f, jobType: e.target.value }))}>
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
          <Button type="submit">Search</Button>
        </form>

        {loading ? (
          <div className="jobs-loading">
            {[1,2,3,4].map(i => <div key={i} className="job-skeleton" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="jobs-empty">
            <p>No jobs found. Try different filters.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onMessage={handleMessage} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}