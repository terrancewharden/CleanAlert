import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const S = {
  page: { minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" },
  card: { background: "#0f2044", border: "1px solid #1e3a6e", borderRadius: 16, padding: "2.5rem 2rem", width: "100%", maxWidth: 420 },
  logo: { color: "#00d4ff", fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: "0.25rem" },
  sub: { color: "#6b8cba", fontSize: 14, textAlign: "center", marginBottom: "2rem" },
  label: { display: "block", color: "#a0b4cc", fontSize: 13, marginBottom: 6 },
  input: { width: "100%", padding: "0.75rem 1rem", background: "#0a1628", border: "1px solid #1e3a6e", borderRadius: 10, color: "#e8f4ff", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: "1.25rem" },
  btn: { width: "100%", padding: "0.85rem", background: "#00d4ff", color: "#0a1628", fontWeight: 700, fontSize: 16, border: "none", borderRadius: 10, cursor: "pointer" },
  err: { color: "#ff6b6b", fontSize: 13, marginBottom: "1rem", textAlign: "center" },
  link: { color: "#00d4ff", textDecoration: "none" },
  foot: { color: "#6b8cba", fontSize: 13, textAlign: "center", marginTop: "1.5rem" },
};

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await r.json();
    setLoading(false);
    if (!r.ok) return setError(data.error || "Login failed");
    login(data.token, data.user);
    if (data.user.user_type === "admin") nav("/admin");
    else if (data.user.user_type === "buyer") nav("/buyer");
    else nav("/cleaner");
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <Logo size={36} style={{justifyContent:"center",marginBottom:"0.25rem"}} />
        <div style={S.sub}>Sign in to your account</div>
        {error && <div style={S.err}>{error}</div>}
        <form onSubmit={submit}>
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={S.btn} disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
        </form>
        <div style={S.foot}>
          Don't have an account? <Link to="/register" style={S.link}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
