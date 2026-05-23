import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getMyJobsApi, deleteJobApi, updateJobApi } from "../../api/jobs";
import "./Recruiter.css";

export function RecruiterDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyJobsApi().then(r => setJobs(r.data.data.jobs)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    await deleteJobApi(id);
    load();
  };

  const toggleStatus = async (job) => {
    const status = job.status === "active" ? "closed" : "active";
    await updateJobApi(job.id, { status });
    load();
  };

  const statusVariant = (s) => s === "active" ? "green" : s === "draft" ? "amber" : "red";

  return (
    <Layout>
      <div className="recruiter-page fade-up">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Job Posts</h1>
            <p className="page-sub">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
          </div>
          <Button onClick={() => navigate("/recruiter/post-job")}>+ Post New Job</Button>
        </div>

        {loading ? (
          <div className="table-skeleton" />
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs posted yet.</p>
            <Button onClick={() => navigate("/recruiter/post-job")} style={{ marginTop: 16 }}>Post your first job</Button>
          </div>
        ) : (
          <div className="jobs-table-wrap">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td>
                      <p className="table-job-title">{job.title}</p>
                      <p className="table-job-dept">{job.department || job.industry || ""}</p>
                    </td>
                    <td className="table-muted">{job.location?.join(", ")}</td>
                    <td><Badge variant="blue">{job.jobType?.replace("_", " ")}</Badge></td>
                    <td><Badge variant={statusVariant(job.status)}>{job.status}</Badge></td>
                    <td className="table-muted">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className="tbl-btn" onClick={() => toggleStatus(job)}>
                          {job.status === "active" ? "Close" : "Activate"}
                        </button>
                        <button className="tbl-btn danger" onClick={() => handleDelete(job.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}