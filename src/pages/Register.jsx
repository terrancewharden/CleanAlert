import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

const NAVY="#0A1628", CYAN="#00D4FF", MUTED="#6b8cba", BORDER="#1e3a6e";

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const TicketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
);

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [userType, setUserType] = useState("buyer");
  const [form, setForm] = useState({ name:"", email:"", password:"", company_name:"", location:"", promo_code:"" });
  const [showPw, setShowPw] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [promoValid, setPromoValid] = useState(null);
  const [tosAgreed, setTosAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const checkPromo = async (code) => {
    if (!code.trim()) { setPromoValid(null); return; }
    const r = await fetch(`/api/auth/check-promo?code=${encodeURIComponent(code.trim())}`);
    setPromoValid(r.ok);
  };

  const submit = async e => {
    e.preventDefault(); setError("");
    if (!tosAgreed) return setError("You must agree to the Terms of Service to continue.");
    setLoading(true);
    const body = { ...form, user_type: userType, tos_agreed: true };
    if (userType !== "cleaner") delete body.promo_code;
    const r = await fetch("/api/auth/register", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    const data = await r.json(); setLoading(false);
    if (!r.ok) return setError(data.error||"Registration failed");
    login(data.token, data.user);
    nav(userType==="cleaner"?"/cleaner":"/buyer");
  };

  const lbl = { display:"block", color:"#374151", fontSize:13, fontWeight:600, marginBottom:5 };
  const inp = { width:"100%", padding:"0.7rem 1rem", border:"1px solid #d1d5db", borderRadius:8, color:"#111827", fontSize:15, marginBottom:"1.1rem", outline:"none", fontFamily:"'DM Sans',sans-serif" };

  return (
    <div style={{ minHeight:"100vh", background:NAVY, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem 1rem", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:12, padding:"2.5rem 2rem", width:"100%", maxWidth:440, border:"1px solid #e2e8f0" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:"0.5rem" }}><Logo size={36} /></div>
        <p style={{ color:MUTED, fontSize:14, textAlign:"center", marginBottom:"1.75rem" }}>Create your account</p>

        {error && <div style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"0.75rem 1rem", color:"#be123c", fontSize:13, marginBottom:"1rem" }}>{error}</div>}

        {/* TYPE SELECTOR */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"1.5rem" }}>
          {[["buyer","🏢","I Need Cleaning"],["cleaner","🧹","I'm a Cleaner"]].map(([type,icon,label])=>(
            <div key={type} onClick={()=>setUserType(type)} style={{ padding:"0.9rem", borderRadius:8, border:`2px solid ${userType===type?CYAN:"#e2e8f0"}`, background:userType===type?"#f0fdff":"#fff", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
              <div style={{ color:userType===type?NAVY:"#6b7280", fontWeight:700, fontSize:14 }}>{label}</div>
            </div>
          ))}
        </div>

        <form onSubmit={submit}>
          <label style={lbl}>Full Name</label>
          <input style={inp} value={form.name} onChange={set("name")} required />
          <label style={lbl}>Email</label>
          <input style={inp} type="email" value={form.email} onChange={set("email")} required />
          <label style={lbl}>Password</label>
          <div style={{ position:"relative", marginBottom:"1.1rem" }}>
            <input style={{ ...inp, marginBottom:0, paddingRight:"3rem" }} type={showPw?"text":"password"} value={form.password} onChange={set("password")} required minLength={6} />
            <button type="button" onClick={()=>setShowPw(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", alignItems:"center" }}><EyeIcon open={showPw} /></button>
          </div>
          <label style={lbl}>Company / Business Name</label>
          <input style={inp} value={form.company_name} onChange={set("company_name")} />
          <label style={lbl}>Location (City, State)</label>
          <input style={inp} value={form.location} onChange={set("location")} />

          {/* PROMO CODE — cleaners only */}
          {userType === "cleaner" && (
            <div style={{ marginBottom:"1.1rem" }}>
              {!showPromo ? (
                <button type="button" onClick={()=>setShowPromo(true)} style={{ background:"none", border:"none", color:CYAN, fontSize:13, fontWeight:600, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:6 }}>
                  <TicketIcon /> Have an invite code? (get 90 days free)
                </button>
              ) : (
                <div>
                  <label style={lbl}>Invite / Promo Code</label>
                  <div style={{ position:"relative" }}>
                    <input
                      style={{ ...inp, marginBottom:0, paddingRight:"2.5rem", borderColor: promoValid===true?"#22c55e": promoValid===false?"#ef4444":"#d1d5db", textTransform:"uppercase" }}
                      placeholder="e.g. CLEAN90"
                      value={form.promo_code}
                      onChange={e=>{ set("promo_code")(e); checkPromo(e.target.value); }}
                    />
                    {promoValid===true && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#22c55e", fontSize:16 }}>✓</span>}
                    {promoValid===false && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#ef4444", fontSize:16 }}>✗</span>}
                  </div>
                  {promoValid===true && <p style={{ color:"#15803d", fontSize:12, marginTop:6, fontWeight:600 }}>✓ Valid code — 90 days free access unlocked!</p>}
                  {promoValid===false && <p style={{ color:"#dc2626", fontSize:12, marginTop:6 }}>Invalid or expired code.</p>}
                </div>
              )}
            </div>
          )}

          {/* ToS */}
          <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:"1rem", padding:"0.85rem", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0" }}>
            <input type="checkbox" id="tos" checked={tosAgreed} onChange={e=>setTosAgreed(e.target.checked)} style={{ marginTop:2, accentColor:CYAN, width:15, height:15, flexShrink:0, cursor:"pointer" }} />
            <label htmlFor="tos" style={{ color:"#374151", fontSize:12, lineHeight:1.5, cursor:"pointer" }}>
              I agree to CleanAlert's <strong>Terms of Service</strong>. I understand that if I complete a deal outside the platform with a buyer I met through CleanAlert within 12 months, a bypass fee of <strong>$250</strong> is owed to CleanAlert LLC.
            </label>
          </div>

          <button type="submit" disabled={loading||!tosAgreed} style={{ width:"100%", padding:"0.8rem", background:tosAgreed?CYAN:"#e5e7eb", color:tosAgreed?NAVY:"#9ca3af", fontWeight:800, fontSize:16, border:"none", borderRadius:8, cursor:tosAgreed?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
            {loading?"Creating account…":"Create Account"}
          </button>
        </form>

        <p style={{ color:MUTED, fontSize:13, textAlign:"center", marginTop:"1.5rem" }}>Already have an account? <Link to="/login" style={{ color:CYAN, fontWeight:600, textDecoration:"none" }}>Sign in</Link></p>
      </div>
    </div>
  );
}
