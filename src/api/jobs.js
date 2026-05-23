import api from "./axios";
export const searchJobsApi      = (params) => api.get("/jobs", { params });
export const getJobByIdApi      = (id)     => api.get(`/jobs/${id}`);
export const getRecommendedApi  = ()       => api.get("/jobs/seeker/recommended");
export const createJobApi       = (data)   => api.post("/jobs", data);
export const updateJobApi       = (id, d)  => api.put(`/jobs/${id}`, d);
export const deleteJobApi       = (id)     => api.delete(`/jobs/${id}`);
export const getMyJobsApi       = (params) => api.get("/jobs/mine/all", { params });
export const getMyJobByIdApi    = (id)     => api.get(`/jobs/mine/${id}`);