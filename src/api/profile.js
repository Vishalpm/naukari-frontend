import api from "./axios";

export const getSeekerProfileApi    = ()         => api.get("/profile/seeker");
export const updateSeekerProfileApi = (formData) =>
  api.put("/profile/seeker", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const addEducationApi    = (data)       => api.post("/profile/education", data);
export const updateEducationApi = (id, data)   => api.put(`/profile/education/${id}`, data);
export const deleteEducationApi = (id)         => api.delete(`/profile/education/${id}`);

export const addExperienceApi    = (data)      => api.post("/profile/experience", data);
export const updateExperienceApi = (id, data)  => api.put(`/profile/experience/${id}`, data);
export const deleteExperienceApi = (id)        => api.delete(`/profile/experience/${id}`);

export const getRecruiterProfileApi    = ()         => api.get("/profile/recruiter");
export const updateRecruiterProfileApi = (formData) =>
  api.put("/profile/recruiter", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const getRecruiterPublicApi     = (id)       => api.get(`/profile/recruiter/${id}/public`);