import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const NAVY="#0A1628", CYAN="#00D4FF", BORDER="#1e3a6e", MUTED="#6b8cba";

export default function Subscribe() {
  const { authFetch } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const startCheckout = async () => {
    setLoading(true); setErr("");
    try {
      const r = await authFetch("/api/stripe/create-checkout", { method:"POST" });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
      else setErr(d.error||"Could not create checkout session.");
    } catch(e) { setErr(e.message); }
    setLoading(false);
  };

  const perks = [
    ["📋","Unlimited contract access","See and respond to every job posted in your area"],
    ["⚡","Priority placement","Your bids show first to buyers in your region"],
    ["📊","Client dashboard","Track accepted jobs, earnings, and client history"],
    ["🔔","Instant alerts","Get notified the moment a matching job is posted"],
    ["⭐","Review system","Build your reputation with verified buyer reviews"],
    ["💼","Business profile","Show off your company, photos, and specialties"],
  ];

  return (
    <div style={{ minHeight:"100vh", background:NAVY, fontFamily:"Inter,sans-serif", display:"flex", flexDirection:"column" }}>
      <nav style={{ borderBottom:`1px solid ${BORDER}`, padding:"1rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Logo size={30} />
        <button onClick={()=>nav(-1)} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, borderRadius:6, padding:"5px 12px", fontSize:13, cursor:"pointer" }}>← Back</button>
      </nav>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:"2.5rem", maxWidth:500, width:"100%", border:"1px solid #e5e7eb" }}>
          {/* HEADER */}
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ background:`${CYAN}18`, border:`1px solid ${CYAN}40`, borderRadius:8, display:"inline-block", padding:"4px 14px", marginBottom:14 }}>
              <span style={{ color:CYAN, fontSize:12, fontWeight:700, letterSpacing:"0.08em" }}>CLEANER PRO</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:4 }}>
              <span style={{ color:NAVY, fontSize:46, fontWeight:900 }}>$29</span>
              <span style={{ color:"#6b7280", fontSize:15 }}>/month</span>
            </div>
            <p style={{ color:"#6b7280", fontSize:14, marginTop:8 }}>Everything you need to land and keep cleaning clients.</p>
          </div>

          {/* PERKS */}
          <div style={{ marginBottom:"2rem" }}>
            {perks.map(([icon,title,desc])=>(
              <div key={title} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"0.6rem 0", borderBottom:"1px solid #f3f4f6" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                <div>
                  <div style={{ color:NAVY, fontSize:14, fontWeight:700 }}>{title}</div>
                  <div style={{ color:"#6b7280", fontSize:12, marginTop:2 }}>{desc}</div>
                </div>
                <span style={{ color:"#22c55e", fontSize:16, marginLeft:"auto", flexShrink:0 }}>✓</span>
              </div>
            ))}
          </div>

          {err && <div style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:7, padding:"0.65rem 1rem", color:"#be123c", fontSize:13, marginBottom:"1rem" }}>{err}</div>}

          <button onClick={startCheckout} disabled={loading} style={{ width:"100%", background:CYAN, color:NAVY, border:"none", borderRadius:8, padding:"1rem", fontSize:16, fontWeight:800, cursor:"pointer", letterSpacing:"0.01em" }}>
            {loading?"Redirecting…":"Subscribe Now →"}
          </button>
          <p style={{ color:"#9ca3af", fontSize:12, textAlign:"center", marginTop:12 }}>Cancel anytime. Powered by Stripe. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}
