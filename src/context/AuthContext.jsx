import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ca_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && (data.id || data.user)) setUser(data.user || data); else logout(); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (tok, userData) => {
    localStorage.setItem("ca_token", tok);
    setToken(tok);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("ca_token");
    setToken(null);
    setUser(null);
  };

  const authFetch = (url, opts = {}) => {
    return fetch(url, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
