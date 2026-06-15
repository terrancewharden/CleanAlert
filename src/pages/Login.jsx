import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

const S = {
  page: { minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" },
  card: { background: "#0f2044", border: "1px solid #1e3a6e", borderRadius: 16, padding: "2.5rem 2rem", width: "100%", maxWidth: 420 },
  sub: { color: "#6b8cba", fontSize: 14, textAlign: "center", marginBottom: "2rem" },
  label: { display: "block", color: "#a0b4cc", fontSize: 13, marginBottom: 6 },
  input: { width: "100%", padding: "0.75rem 1rem", background: "#0a1628", border: "1px solid #1e3a6e", borderRadius: 10, color: "#e8f4ff", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: "1.25rem" },
  pwWrap: { position: "relative", marginBottom: "1.25rem" },
  pwInput: { width: "100%", padding: "0.75rem 3rem 0.75rem 1rem", background: "#0a1628", border: "1px solid #1e3a6e", borderRadius: 10, color: "#e8f4ff", fontSize: 15, boxSizing: "border-box", outline: "none" },
  eyeBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b8cba", padding: 4, display: "flex", alignItems: "center" },
  btn: { width: "100%", padding: "0.85rem", background: "#00d4ff", color: "#0a1628", fontWeight: 700, fontSize: 16, border: "none", borderRadius: 10, cursor: "pointer" },
  err: { color: "#ff6b6b", fontSize: 13, marginBottom: "1rem", textAlign: "center" },
  link: { color: "#00d4ff", textDecoration: "none" },
  foot: { color: "#6b8cba", fontSize: 13, textAlign: "center", marginTop: "1.5rem" },
};

const EyeIcon = ({ open }) => open ? (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
        <Logo size={36} style={{ justifyContent: "center", marginBottom: "0.25rem" }} />
        <div style={S.sub}>Sign in to your account</div>
        {error && <div style={S.err}>{error}</div>}
        <form onSubmit={submit}>
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={S.label}>Password</label>
          <div style={S.pwWrap}>
            <input style={S.pwInput} type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" style={S.eyeBtn} onClick={() => setShowPw(v => !v)}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          <button style={S.btn} disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
        </form>
        <div style={S.foot}>Don't have an account? <Link to="/register" style={S.link}>Sign up</Link></div>
      </div>
    </div>
  );
}
