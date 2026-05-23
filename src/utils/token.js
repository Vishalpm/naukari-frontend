export const getToken   = () => localStorage.getItem("nc_token");
export const setToken   = (t) => localStorage.setItem("nc_token", t);
export const clearToken = () => localStorage.removeItem("nc_token");
export const getUser    = () => {
  try { return JSON.parse(localStorage.getItem("nc_user") || "null"); }
  catch { return null; }
};
export const setUser    = (u) => localStorage.setItem("nc_user", JSON.stringify(u));
export const clearUser  = () => localStorage.removeItem("nc_user");