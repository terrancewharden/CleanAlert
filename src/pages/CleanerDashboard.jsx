import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import ContractCard from "../components/ContractCard.jsx";

const NAVY="#0A1628", CYAN="#00D4FF", BORDER="#1e3a6e", MUTED="#6b8cba";

const SEED_CARDS = [
  { id:"seed-1", business_name:"Trident Property Group", facility_type:"Office", location:"Center City, PA 19103", budget:"$1,200/mo", sqft:"3,200 sqft", frequency:"Weekly", contract_length:"1 year", notes:"3-floor office building. Need janitorial Mon–Fri. Breakrooms and restrooms are priority.", isSeed:true },
  { id:"seed-2", business_name:"The Roost — Airbnb", facility_type:"Airbnb/VRBO", location:"Fishtown, PA 19125", budget:"$95/turnover", sqft:"850 sqft", frequency:"Bi-weekly", contract_length:"Ongoing", notes:"Studio loft, quick turnovers between guests. Usually 2–3 hours. Need someone reliable and fast.", isSeed:true },
  { id:"seed-3", business_name:"Atlas Fitness Center", facility_type:"Gym/Fitness", location:"King of Prussia, PA 19406", budget:"$2,800/mo", sqft:"8,500 sqft", frequency:"Daily", contract_length:"6 months", notes:"Full gym facility. Evening cleaning crew needed. Locker rooms, weight floor, cardio area.", isSeed:true },
];

const SEED_DEALS = [
  { id:"d1", title:"Mrs. Meyer's Cleaning Bundle", brand:"Grove Co.", value:"$48 value", description:"All-purpose, dish soap, hand soap + bonus scrubber set. Pro-grade.", badge:"HOT DEAL", color:"#ff6b35" },
  { id:"d2", title:"Microfiber Pro Pack (24ct)", brand:"AmazonBasics Pro", value:"$34 value", description:"Industrial-grade microfiber cloths. Lint-free, machine washable 500x.", badge:"BEST SELLER", color:"#7c3aed" },
  { id:"d3", title:"Shark Navigator Pro Upright", brand:"Shark", value:"$329 value", description:"Bagless, HEPA filter, anti-allergen seal. Preferred by 80% of pro cleaners.", badge:"STAFF PICK", color:"#0369a1" },
  { id:"d4", title:"Concentrated Cleaner 5-Pack", brand:"Zep Commercial", value:"$67 value", description:"Multi-surface, bathroom, floor, glass, degreaser. Each jug makes 32 ready-to-use quarts.", badge:"BULK DEAL", color:"#166534" },
  { id:"d5", title:"Mop & Bucket Pro System", brand:"Rubbermaid", value:"$89 value", description:"Commercial-grade wringer bucket, 2 cotton mop heads. Built for daily use.", badge:"NEW", color:"#b45309" },
];

const shimmer = `@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`;
const pulse = `@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.4)}50%{box-shadow:0 0 0 8px rgba(0,212,255,0)}}`;

function DealBadge({ color, label }) {
  return (
    <span style={{
      background:`linear-gradient(90deg,${color},${color}99,${color})`,
      backgroundSize:"200% auto",
      animation:"shimmer 2s linear infinite",
      color:"#fff", fontSize:10, fontWeight:800, padding:"3px 10px",
      borderRadius:4, letterSpacing:"0.08em"
    }}>{label}</span>
  );
}

function TrialBanner({ user, nav }) {
  if (!user || user.subscription_status !== "trial" || !user.trial_ends_at) return null;
  const msLeft = new Date(user.trial_ends_at) - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const expired = daysLeft === 0;
  const urgent = daysLeft <= 7;
  const pct = Math.min(100, Math.max(0, (daysLeft / 90) * 100));

  return (
    <div className="ca-trial-banner" style={{ background: expired?"#1a0a0a": urgent?"#1a0f00":"#0a1f10", borderBottom:`1px solid ${expired?"#7f1d1d":urgent?"#78350f":"#14532d"}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18 }}>{expired?"🔒":urgent?"⚠️":"🎉"}</span>
        <div>
          <div style={{ color: expired?"#fca5a5":urgent?"#fcd34d":"#86efac", fontSize:13, fontWeight:700 }}>
            {expired ? "Your free trial has ended" : `${daysLeft} day${daysLeft!==1?"s":""} left on your free trial`}
          </div>
          {!expired && (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
              <div style={{ width:120, height:4, background:"rgba(255,255,255,0.15)", borderRadius:2 }}>
                <div style={{ width:`${pct}%`, height:"100%", background: urgent?"#fbbf24":CYAN, borderRadius:2, transition:"width 0.3s" }} />
              </div>
              <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>of 90 days</span>
            </div>
          )}
        </div>
      </div>
      <button onClick={()=>nav("/subscribe")} style={{ background:expired?"#ef4444":urgent?"#f59e0b":CYAN, color:expired||urgent?"#fff":NAVY, border:"none", borderRadius:6, padding:"6px 16px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>
        {expired?"Subscribe to Restore Access →":"Upgrade to Pro →"}
      </button>
    </div>
  );
}

export default function CleanerDashboard() {
  const { user, authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("feed");
  const [liveContracts, setLiveContracts] = useState([]);
  const [modal, setModal] = useState(null);
  const [responseMsg, setResponseMsg] = useState({});
  const [responseQuote, setResponseQuote] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [myContracts, setMyContracts] = useState([]);

  useEffect(()=>{
    loadFeed();
    const t = setInterval(loadFeed, 15000);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    if(tab==="mine") loadMine();
  },[tab]);

  const loadFeed = async ()=>{
    try {
      const r = await authFetch("/api/contracts/feed");
      const d = await r.json();
      if(Array.isArray(d)) setLiveContracts(d);
    } catch(e){}
  };

  const loadMine = async ()=>{
    try {
      const r = await authFetch("/api/contracts/my");
      const d = await r.json();
      if(Array.isArray(d)) setMyContracts(d);
    } catch(e){}
  };

  const sendResponse = async (contractId)=>{
    const msg = responseMsg[contractId]||"";
    if(!msg.trim()) return;
    await authFetch(`/api/contracts/${contractId}/respond`,{
      method:"POST", body:JSON.stringify({ message:msg, quote:responseQuote[contractId]||"" })
    });
    setSubmitted(p=>({...p,[contractId]:true}));
    setModal(null);
  };

  const allContracts = [...SEED_CARDS, ...liveContracts];

  const inp = { width:"100%", padding:"0.65rem 0.85rem", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, color:"#111827", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", background:NAVY, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{shimmer}{pulse}</style>

      <TrialBanner user={user} nav={nav} />
      <nav style={{ borderBottom:`1px solid ${BORDER}`, padding:"1rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Logo size={30} />
        <div className="ca-nav-right">
          <div className="ca-toggle" style={{ background:"#0d1f3c", border:`1px solid ${BORDER}` }}>
            {[["feed","Job Feed"],["deals","Deals"],["mine","My Bids"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                background:tab===t?CYAN:"transparent",
                color:tab===t?NAVY:MUTED,
                border:"none",
                padding:"6px 18px",
                fontSize:13,
                fontWeight:tab===t?700:500,
                cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif"
              }}>{l}</button>
            ))}
          </div>
          <button onClick={()=>{logout();nav("/");}} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"6px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sign out</button>
        </div>
      </nav>

      <div className="ca-page" style={{ padding:"1.5rem" }}>

        {tab==="feed" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h2 style={{ color:"#fff", fontSize:18, fontWeight:800 }}>Available Jobs</h2>
              <span style={{ color:MUTED, fontSize:12 }}>Live · updates every 15s</span>
            </div>
            <div className="ca-card-grid">
              {allContracts.map(c=>(
                <div key={c.id}>
                  <ContractCard contract={c} />
                  {!submitted[c.id]
                    ? <button onClick={()=>setModal(c)} style={{ width:"100%", background:CYAN, color:NAVY, border:"none", borderRadius:8, padding:"0.7rem", fontSize:13, fontWeight:800, cursor:"pointer", marginTop:8, animation:"pulse 2s infinite" }}>⚡ Express Interest</button>
                    : <div style={{ textAlign:"center", color:"#4ade80", fontSize:13, fontWeight:700, marginTop:8 }}>✓ Bid Sent</div>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="deals" && (
          <div>
            <h2 style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:"1rem" }}>Cleaner Deals & Supplies</h2>
            <div className="ca-deal-grid">
              {SEED_DEALS.map(d=>(
                <div key={d.id} style={{ background:"#fff", borderRadius:12, padding:"1.25rem", border:"1px solid #e5e7eb" }}>
                  <div style={{ marginBottom:10 }}><DealBadge color={d.color} label={d.badge} /></div>
                  <div style={{ color:NAVY, fontWeight:800, fontSize:15, marginBottom:4 }}>{d.title}</div>
                  <div style={{ color:"#6b7280", fontSize:12, marginBottom:8 }}>{d.brand}</div>
                  <p style={{ color:"#374151", fontSize:13, lineHeight:1.5, marginBottom:12 }}>{d.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ color:"#15803d", fontWeight:800, fontSize:14 }}>{d.value}</span>
                    <button style={{ background:NAVY, color:CYAN, border:`1px solid ${CYAN}`, borderRadius:6, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>View Deal</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="mine" && (
          <div>
            <h2 style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:"1rem" }}>My Bids</h2>
            {myContracts.length===0
              ? <div style={{ background:"#0d1f3c", borderRadius:12, padding:"2.5rem", textAlign:"center", color:MUTED, border:`1px solid ${BORDER}` }}>No bids placed yet. <button onClick={()=>setTab("feed")} style={{ color:CYAN, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Browse jobs →</button></div>
              : myContracts.map(c=>(
                <div key={c.id} style={{ background:"#fff", borderRadius:12, marginBottom:12, padding:"1.25rem", border:"1px solid #e5e7eb" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ color:NAVY, fontWeight:700, fontSize:15 }}>{c.title}</div>
                      <div style={{ color:"#6b7280", fontSize:13, marginTop:4 }}>{c.location} · {c.category}</div>
                    </div>
                    <span style={{
                      background:c.response_status==="accepted"?"#dcfce7":c.response_status==="rejected"?"#fee2e2":"#fef9c3",
                      color:c.response_status==="accepted"?"#166534":c.response_status==="rejected"?"#dc2626":"#92400e",
                      fontSize:11, padding:"3px 10px", borderRadius:4, fontWeight:700
                    }}>{(c.response_status||"pending").toUpperCase()}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:999, padding:"0" }}>
          <div className="ca-modal-card">
            <h3 style={{ color:NAVY, fontSize:17, fontWeight:800, marginBottom:4 }}>Express Interest</h3>
            <p style={{ color:"#6b7280", fontSize:13, marginBottom:"1.25rem" }}>{modal.title} · {modal.location}</p>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:"block", color:"#374151", fontSize:13, fontWeight:600, marginBottom:5 }}>Your Message</label>
              <textarea style={{...inp,minHeight:90,resize:"vertical"}} placeholder="Introduce yourself and why you're a great fit…" value={responseMsg[modal.id]||""} onChange={e=>setResponseMsg(p=>({...p,[modal.id]:e.target.value}))} />
            </div>
            <div style={{ marginBottom:"1.5rem" }}>
              <label style={{ display:"block", color:"#374151", fontSize:13, fontWeight:600, marginBottom:5 }}>Your Quote (optional)</label>
              <input style={inp} placeholder="$150" value={responseQuote[modal.id]||""} onChange={e=>setResponseQuote(p=>({...p,[modal.id]:e.target.value}))} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setModal(null)} style={{ flex:1, background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb", borderRadius:7, padding:"0.75rem", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              {modal.isSeed
                ? <button style={{ flex:2, background:"#e5e7eb", color:"#9ca3af", border:"none", borderRadius:7, padding:"0.75rem", fontSize:14, fontWeight:600, cursor:"default" }}>Sample — Login to Bid</button>
                : <button onClick={()=>sendResponse(modal.id)} style={{ flex:2, background:CYAN, color:NAVY, border:"none", borderRadius:7, padding:"0.75rem", fontSize:14, fontWeight:800, cursor:"pointer" }}>Send Bid →</button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
