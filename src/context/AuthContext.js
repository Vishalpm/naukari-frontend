import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, clearToken, getUser, setUser, clearUser } from "../utils/token";
import { getMeApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    getMeApi()
      .then((res) => {
        const { _id, id, email, role } = res.data.data;
        const u = { id: id || _id, email, role, token };
        setUserState(u);
        setUser(u);
      })
      .catch(() => { clearToken(); clearUser(); })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setToken(userData.token);
    setUser(userData);
    setUserState(userData);
  };

  const logout = () => {
    clearToken();
    clearUser();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);