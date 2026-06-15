import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const S = {
  page: { minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: "2rem 1rem" },
  card: { background: "#0f2044", border: "1px solid #1e3a6e", borderRadius: 16, padding: "2.5rem 2rem", width: "100%", maxWidth: 440 },
  logo: { color: "#00d4ff", fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: "0.25rem" },
  sub: { color: "#6b8cba", fontSize: 14, textAlign: "center", marginBottom: "2rem" },
  label: { display: "block", color: "#a0b4cc", fontSize: 13, marginBottom: 6 },
  input: { width: "100%", padding: "0.75rem 1rem", background: "#0a1628", border: "1px solid #1e3a6e", borderRadius: 10, color: "#e8f4ff", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: "1.25rem" },
  types: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" },
  typeBtn: (active) => ({ padding: "1rem", borderRadius: 12, border: `2px solid ${active ? "#00d4ff" : "#1e3a6e"}`, background: active ? "rgba(0,212,255,0.08)" : "#0a1628", color: active ? "#00d4ff" : "#6b8cba", cursor: "pointer", textAlign: "center", fontWeight: 600, fontSize: 15 }),
  typeIcon: { fontSize: 24, marginBottom: 4 },
  btn: { width: "100%", padding: "0.85rem", background: "#00d4ff", color: "#0a1628", fontWeight: 700, fontSize: 16, border: "none", borderRadius: 10, cursor: "pointer" },
  err: { color: "#ff6b6b", fontSize: 13, marginBottom: "1rem", textAlign: "center" },
  link: { color: "#00d4ff", textDecoration: "none" },
  foot: { color: "#6b8cba", fontSize: 13, textAlign: "center", marginTop: "1.5rem" },
  note: { color: "#6b8cba", fontSize: 12, textAlign: "center", marginBottom: "1.5rem" },
};

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [userType, setUserType] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", password: "", company_name: "", location: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, user_type: userType }),
    });
    const data = await r.json();
    setLoading(false);
    if (!r.ok) return setError(data.error || "Registration failed");
    login(data.token, data.user);
    if (userType === "cleaner") nav("/subscribe");
    else nav("/buyer");
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <Logo size={36} style={{justifyContent:"center",marginBottom:"0.25rem"}} />
        <div style={S.sub}>Create your account</div>
        {error && <div style={S.err}>{error}</div>}

        <div style={S.types}>
          {[["buyer", "🏢", "I Need Cleaning"], ["cleaner", "🧹", "I'm a Cleaner"]].map(([type, icon, label]) => (
            <div key={type} style={S.typeBtn(userType === type)} onClick={() => setUserType(type)}>
              <div style={S.typeIcon}>{icon}</div>
              {label}
            </div>
          ))}
        </div>

        {userType === "cleaner" && (
          <div style={S.note}>🔒 Cleaners get a 7-day free trial, then $29/mo to access leads.</div>
        )}

        <form onSubmit={submit}>
          <label style={S.label}>Full Name</label>
          <input style={S.input} value={form.name} onChange={set("name")} required />
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" value={form.email} onChange={set("email")} required />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" value={form.password} onChange={set("password")} required minLength={6} />
          <label style={S.label}>Company / Business Name</label>
          <input style={S.input} value={form.company_name} onChange={set("company_name")} />
          <label style={S.label}>Location (City, State)</label>
          <input style={S.input} value={form.location} onChange={set("location")} />
          <button style={S.btn} disabled={loading}>{loading ? "Creating account…" : "Create Account"}</button>
        </form>
        <div style={S.foot}>
          Already have an account? <Link to="/login" style={S.link}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
