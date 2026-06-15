import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Run ONCE on mount — restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ca_token");
    if (!saved) { setLoading(false); return; }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${saved}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.id) {
          setToken(saved);
          setUser(data);
        } else {
          localStorage.removeItem("ca_token");
        }
      })
      .finally(() => setLoading(false));
  }, []); // empty deps — only on mount

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
    const t = token || localStorage.getItem("ca_token");
    return fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
        ...(opts.headers || {}),
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
