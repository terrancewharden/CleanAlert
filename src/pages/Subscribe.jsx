import { useState } from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const S = {
  page: { minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: "2rem 1rem" },
  card: { background: "#0f2044", border: "1px solid #1e3a6e", borderRadius: 16, padding: "2.5rem 2rem", width: "100%", maxWidth: 460, textAlign: "center" },
  logo: { color: "#00d4ff", fontSize: 26, fontWeight: 800, marginBottom: "0.5rem" },
  h2: { color: "#e8f4ff", fontSize: 22, fontWeight: 700, marginBottom: "0.5rem" },
  sub: { color: "#6b8cba", fontSize: 15, marginBottom: "2rem" },
  price: { background: "#0a1628", border: "1px solid #1e3a6e", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" },
  amount: { color: "#00d4ff", fontSize: 48, fontWeight: 800 },
  mo: { color: "#6b8cba", fontSize: 16 },
  perks: { listStyle: "none", padding: 0, margin: "1.25rem 0", textAlign: "left" },
  perk: { color: "#a0b4cc", fontSize: 14, padding: "0.35rem 0", display: "flex", gap: 10, alignItems: "center" },
  btn: { width: "100%", padding: "0.9rem", background: "#00d4ff", color: "#0a1628", fontWeight: 700, fontSize: 17, border: "none", borderRadius: 10, cursor: "pointer", marginBottom: "0.75rem" },
  btnOut: { width: "100%", padding: "0.75rem", background: "transparent", color: "#6b8cba", fontSize: 14, border: "1px solid #1e3a6e", borderRadius: 10, cursor: "pointer" },
  success: { color: "#00d4ff", fontSize: 18, fontWeight: 700, marginBottom: "1rem" },
};

export default function Subscribe() {
  const { user, authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const isSuccess = new URLSearchParams(window.location.search).has("success") || window.location.pathname.includes("success");

  const checkout = async () => {
    setLoading(true);
    const r = await authFetch("/api/stripe/create-checkout", { method: "POST" });
    const data = await r.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  };

  if (isSuccess) return (
    <div style={S.page}>
      <div style={S.card}>
        <Logo size={36} style={{justifyContent:"center",marginBottom:"0.5rem"}} />
        <div style={{ fontSize: 56, margin: "1rem 0" }}>🎉</div>
        <div style={S.success}>You're subscribed!</div>
        <p style={{ color: "#a0b4cc", marginBottom: "2rem" }}>You now have full access to incoming contract leads.</p>
        <button style={S.btn} onClick={() => nav("/cleaner")}>Go to Dashboard →</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.card}>
        <Logo size={36} style={{justifyContent:"center",marginBottom:"0.5rem"}} />
        <div style={S.h2}>Get Full Access</div>
        <div style={S.sub}>Connect with commercial cleaning contracts in your area.</div>

        <div style={S.price}>
          <div><span style={S.amount}>$29</span><span style={S.mo}>/month</span></div>
          <ul style={S.perks}>
            {["✅ Real-time contract alerts", "✅ Express Interest on unlimited leads", "✅ Verified buyer contact info after acceptance", "✅ Deal tracking & renewal alerts", "✅ Reviews & reputation badge", "✅ Cancel anytime"].map(p => (
              <li key={p} style={S.perk}>{p}</li>
            ))}
          </ul>
        </div>

        <button style={S.btn} onClick={checkout} disabled={loading}>
          {loading ? "Redirecting to Stripe…" : "Start 7-Day Free Trial"}
        </button>
        <button style={S.btnOut} onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}
