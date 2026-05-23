import axios from "axios";
import { getToken } from "../utils/token";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` || "https://naukari-clone.onrender.com/api" });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;