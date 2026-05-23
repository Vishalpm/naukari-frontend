import api from "./axios";
export const seekerStartChatApi    = (jobId)           => api.post(`/chat/start/job/${jobId}`);
export const recruiterStartChatApi = (seekerId, jobId) =>
  api.post(`/chat/start/seeker/${seekerId}`, { jobId });
export const getConversationsApi   = ()                => api.get("/chat/conversations");
export const getMessagesApi        = (convId, page=1)  =>
  api.get(`/chat/${convId}/messages`, { params: { page, limit: 30 } });
export const getUnreadCountApi     = ()                => api.get("/chat/unread");