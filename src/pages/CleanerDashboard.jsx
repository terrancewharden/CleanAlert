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

const SEED_WINS = [
  { id:"w1", cleaner:"Marcus T.", company:"MT Clean Co.", facility_type:"Office", business_name:"Trident Property Group", location:"Center City, PA", budget:"$1,200/mo", contract_length:"1 year", ago:"3 days ago", badge:"🏆 1-Year Contract" },
  { id:"w2", cleaner:"Sarah K.", company:"Sparkle Services", facility_type:"Airbnb/VRBO", business_name:"Private Host (Fishtown)", location:"Fishtown, PA", budget:"$95/turnover", contract_length:"Ongoing", ago:"1 week ago", badge:"⚡ Recurring Deal" },
  { id:"w3", cleaner:"DeShawn M.", company:"Diamond Clean", facility_type:"Gym/Fitness", business_name:"Atlas Fitness Center", location:"King of Prussia, PA", budget:"$2,800/mo", contract_length:"6 months", ago:"2 weeks ago", badge:"💰 Big Contract" },
  { id:"w4", cleaner:"Tanya R.", company:"TR Cleaning LLC", facility_type:"Restaurant", business_name:"Broad St. Kitchen", location:"South Philly, PA", budget:"$650/mo", contract_length:"3 months", ago:"3 weeks ago", badge:"🤝 New Client" },
  { id:"w5", cleaner:"James O.", company:"Pro Surface LLC", facility_type:"Medical", business_name:"PhilaMed Urgent Care", location:"Bala Cynwyd, PA", budget:"$3,400/mo", contract_length:"1 year", ago:"1 month ago", badge:"🏆 1-Year Contract" },
];

const shimmer = `@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`;
const pulse = `@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.4)}50%{box-shadow:0 0 0 8px rgba(0,212,255,0)}}`;
const glow = `@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(255,196,0,0.3)}50%{box-shadow:0 0 18px 4px rgba(255,196,0,0.15)}}`;

function WinCard({ win }) {
  const isLive = !win.isSeed;
  return (
    <div style={{
      background:"linear-gradient(145deg,#0d1f3c 0%,#0a1628 100%)",
      borderRadius:14, border:"1px solid #c8920033",
      padding:"1.25rem", position:"relative", overflow:"hidden",
      animation: isLive ? "glow 3s ease-in-out infinite" : "none"
    }}>
      {/* Gold accent bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#c89200,#ffd966,#c89200)" }} />

      {/* Badge */}
      <div style={{ marginBottom:10 }}>
        <span style={{ background:"rgba(200,146,0,0.15)", color:"#ffd966", fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:4, letterSpacing:"0.06em", border:"1px solid rgba(200,146,0,0.3)" }}>
          {win.badge}
        </span>
        {isLive && <span style={{ marginLeft:8, background:"rgba(0,212,255,0.1)", color:CYAN, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4, border:`1px solid rgba(0,212,255,0.2)` }}>LIVE</span>}
      </div>

      {/* Cleaner */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a6e,#0d2550)", border:"2px solid #c89200", display:"flex", alignItems:"center", justifyContent:"center", color:"#ffd966", fontWeight:800, fontSize:14, flexShrink:0 }}>
          {(win.cleaner_company || win.company || "?")[0].toUpperCase()}
        </div>
        <div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>{win.cleaner || "Anonymous"}</div>
          <div style={{ color:MUTED, fontSize:12 }}>{win.cleaner_company || win.company}</div>
        </div>
      </div>

      {/* Contract details */}
      <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"0.75rem", marginBottom:12 }}>
        <div style={{ color:"#fff", fontWeight:700, fontSize:14, marginBottom:4 }}>
          {win.business_name}
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
          <span style={{ background:"rgba(0,212,255,0.1)", color:CYAN, fontSize:11, padding:"2px 8px", borderRadius:4, fontWeight:600 }}>{win.facility_type}</span>
          <span style={{ color:MUTED, fontSize:12 }}>📍 {win.location}</span>
        </div>
        <div style={{ color:MUTED, fontSize:12 }}>{win.contract_length} contract</div>
      </div>

      {/* Budget — the hero number */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:"#6b8cba", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Deal Value</div>
          <div style={{ color:"#4ade80", fontWeight:900, fontSize:22, letterSpacing:"-0.02em" }}>{win.monthly_value || win.budget}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:"#ffd966", fontSize:11, fontWeight:700 }}>✓ Closed on CleanAlert</div>
          <div style={{ color:MUTED, fontSize:11, marginTop:2 }}>{win.ago || "Recently"}</div>
        </div>
      </div>
    </div>
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
  const [publicDeals, setPublicDeals] = useState([]);
  const [shared, setShared] = useState({});
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [chatDeal, setChatDeal] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSent, setReviewSent] = useState({});

  useEffect(()=>{
    loadFeed();
    loadNotifs();
    const t = setInterval(loadFeed, 15000);
    const n = setInterval(loadNotifs, 30000);
    return ()=>{ clearInterval(t); clearInterval(n); };
  },[]);

  const loadNotifs = async ()=>{
    try {
      const r = await authFetch("/api/notifications/mine");
      const d = await r.json();
      if(Array.isArray(d)) setNotifs(d);
    } catch(e){}
  };

  const markNotifRead = async (id)=>{
    await authFetch(`/api/notifications/${id}`, { method:"PATCH" });
    setNotifs(n=>n.map(x=>x.id===id?{...x,is_read:true}:x));
  };

  const markAllRead = async ()=>{
    await authFetch("/api/notifications/read-all", { method:"POST" });
    setNotifs(n=>n.map(x=>({...x,is_read:true})));
  };

  useEffect(()=>{
    if(tab==="mine") loadMine();
    if(tab==="deals") loadDeals();
  },[tab]);

  const loadDeals = async ()=>{
    try {
      const r = await authFetch("/api/contracts/deals/public");
      const d = await r.json();
      if(Array.isArray(d)) setPublicDeals(d);
    } catch(e){}
  };

  const shareWin = async (contractId)=>{
    try {
      await authFetch(`/api/contracts/deals/share`, { method:"POST", body:JSON.stringify({ contract_id: contractId }) });
      setShared(p=>({...p,[contractId]:true}));
      loadDeals();
    } catch(e){}
  };

  const openChat = async (deal)=>{
    setMessages([]);
    setChatDeal(deal);
    loadMessages(deal.deal_id);
  };

  const loadMessages = async (dealId)=>{
    try {
      const r = await authFetch(`/api/messages/${dealId}`);
      const d = await r.json();
      if(Array.isArray(d)) setMessages(d);
    } catch(e){}
  };

  const sendMessage = async ()=>{
    if(!msgInput.trim()||!chatDeal) return;
    await authFetch(`/api/messages/${chatDeal.deal_id}`, { method:"POST", body:JSON.stringify({ body: msgInput }) });
    setMsgInput("");
    loadMessages(chatDeal.deal_id);
  };

  // Poll chat every 5s when open
  useEffect(()=>{
    if(!chatDeal) return;
    const t = setInterval(()=>loadMessages(chatDeal.deal_id), 5000);
    return ()=>clearInterval(t);
  },[chatDeal]);

  const loadFeed = async ()=>{
    try {
      const r = await authFetch("/api/contracts");
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
      <style>{shimmer}{pulse}{glow}</style>

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
          {/* Notification bell */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowNotifs(v=>!v)} style={{ background:"transparent", border:`1px solid ${BORDER}`, borderRadius:6, padding:"6px 10px", cursor:"pointer", color:MUTED, fontSize:16, position:"relative" }}>
              🔔
              {notifs.filter(n=>!n.is_read).length > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {notifs.filter(n=>!n.is_read).length}
                </span>
              )}
            </button>
            {showNotifs && (
              <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:300, background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:200, overflow:"hidden" }}>
                <div style={{ padding:"0.75rem 1rem", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:NAVY, fontWeight:700, fontSize:13 }}>Notifications</span>
                  {notifs.some(n=>!n.is_read) && <button onClick={markAllRead} style={{ background:"none", border:"none", color:CYAN, fontSize:12, cursor:"pointer", fontWeight:600 }}>Mark all read</button>}
                </div>
                <div style={{ maxHeight:320, overflowY:"auto" }}>
                  {notifs.length===0
                    ? <div style={{ padding:"1.5rem", textAlign:"center", color:"#9ca3af", fontSize:13 }}>Nothing yet</div>
                    : notifs.map(n=>(
                      <div key={n.id} onClick={()=>markNotifRead(n.id)} style={{ padding:"0.75rem 1rem", borderBottom:"1px solid #f9fafb", background:n.is_read?"#fff":"#f0f9ff", cursor:"pointer" }}>
                        <div style={{ color:NAVY, fontSize:13, fontWeight:n.is_read?500:700 }}>{n.title}</div>
                        {n.body && <div style={{ color:"#6b7280", fontSize:12, marginTop:2 }}>{n.body}</div>}
                        <div style={{ color:"#d1d5db", fontSize:11, marginTop:3 }}>{new Date(n.created_at).toLocaleDateString()}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
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
            <div style={{ marginBottom:"1.5rem" }}>
              <h2 style={{ color:"#fff", fontSize:18, fontWeight:800 }}>Deals Closed on CleanAlert</h2>
            </div>
            <div className="ca-deal-grid">
              {[...publicDeals.map(d=>({...d, isSeed:false})), ...SEED_WINS].map(w=>(
                <WinCard key={w.id} win={w} />
              ))}
            </div>
            {publicDeals.length === 0 && (
              <div style={{ textAlign:"center", marginTop:"2rem", color:MUTED, fontSize:13 }}>
                Be the first to post a win. Land a contract and share it from <button onClick={()=>setTab("mine")} style={{ color:CYAN, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>My Bids →</button>
              </div>
            )}
          </div>
        )}

        {tab==="mine" && (
          <div>
            <h2 style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:"1rem" }}>My Active Contracts</h2>

            {/* Renewal alerts */}
            {myContracts.filter(c=>c.days_remaining!==null && c.days_remaining<=30 && c.days_remaining>=0).map(c=>(
              <div key={`renew-${c.id}`} style={{ background:"#1a0f00", border:"1px solid #78350f", borderRadius:10, padding:"0.85rem 1.25rem", marginBottom:10, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:18 }}>⚠️</span>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#fcd34d", fontWeight:700, fontSize:13 }}>{c.business_name} — contract expires in {Math.ceil(c.days_remaining)} day{Math.ceil(c.days_remaining)!==1?"s":""}</div>
                  <div style={{ color:"#92400e", fontSize:12, marginTop:2 }}>Reach out to your client about renewal before it closes.</div>
                </div>
                {c.deal_id && <button onClick={()=>openChat(c)} style={{ background:"#fbbf24", color:"#78350f", border:"none", borderRadius:6, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Message Client →</button>}
              </div>
            ))}

            {myContracts.length===0
              ? <div style={{ background:"#0d1f3c", borderRadius:12, padding:"2.5rem", textAlign:"center", color:MUTED, border:`1px solid ${BORDER}` }}>No contracts yet. <button onClick={()=>setTab("feed")} style={{ color:CYAN, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Browse jobs →</button></div>
              : myContracts.map(c=>(
                <div key={c.id} style={{ background:"#fff", borderRadius:12, marginBottom:12, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <div style={{ padding:"1.25rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ color:NAVY, fontWeight:800, fontSize:15 }}>{c.business_name}</div>
                        <div style={{ color:"#6b7280", fontSize:13, marginTop:3 }}>{c.location} · {c.facility_type}</div>
                        {c.budget && <div style={{ color:"#15803d", fontWeight:900, fontSize:16, marginTop:5 }}>{c.budget}</div>}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                        <span style={{ background:"#dcfce7", color:"#166534", fontSize:11, padding:"3px 10px", borderRadius:4, fontWeight:700 }}>ACTIVE</span>
                        {c.days_remaining!==null && (
                          <span style={{ fontSize:11, color: c.days_remaining<=30?"#dc2626": c.days_remaining<=60?"#92400e":"#6b7280", fontWeight:600 }}>
                            {Math.ceil(c.days_remaining)}d remaining
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Buyer contact — revealed on acceptance */}
                    <div style={{ background:"#f0f9ff", borderRadius:8, padding:"0.75rem", border:"1px solid #bae6fd", marginBottom:10 }}>
                      <div style={{ color:"#0369a1", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>🔓 Client Contact</div>
                      <div style={{ color:"#0c4a6e", fontSize:13, fontWeight:600 }}>{c.buyer_name} {c.buyer_company ? `· ${c.buyer_company}` : ""}</div>
                      <div style={{ color:"#0369a1", fontSize:13 }}>{c.buyer_email}{c.buyer_phone ? ` · ${c.buyer_phone}` : ""}</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {c.deal_id && (
                        <button onClick={()=>openChat(c)} style={{ background:NAVY, color:CYAN, border:`1px solid ${BORDER}`, borderRadius:6, padding:"6px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>💬 Message Client</button>
                      )}
                      {shared[c.id]
                        ? <span style={{ color:"#166534", fontSize:13, fontWeight:700, padding:"6px 0" }}>✓ Posted to Deals</span>
                        : <button onClick={()=>shareWin(c.id)} style={{ background:"#0d1f3c", color:"#ffd966", border:"1px solid #c89200", borderRadius:6, padding:"6px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>🏆 Share Win</button>
                      }
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* CHAT MODAL */}
      {chatDeal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#fff", width:"100%", maxWidth:520, borderRadius:"14px 14px 0 0", display:"flex", flexDirection:"column", maxHeight:"80vh" }}>
            {/* Header */}
            <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ color:NAVY, fontWeight:800, fontSize:15 }}>💬 {chatDeal.business_name}</div>
                <div style={{ color:"#6b7280", fontSize:12, marginTop:2 }}>In-app message with {chatDeal.buyer_name || "client"}</div>
              </div>
              <button onClick={()=>setChatDeal(null)} style={{ background:"#f3f4f6", border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer", color:"#6b7280", fontSize:16 }}>✕</button>
            </div>

            {/* Message thread */}
            <div style={{ flex:1, overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:10 }}>
              {messages.length===0 && (
                <div style={{ textAlign:"center", color:"#9ca3af", fontSize:13, marginTop:"2rem" }}>No messages yet. Say hello! 👋</div>
              )}
              {messages.map(m=>{
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} style={{ display:"flex", justifyContent:mine?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"72%", background:mine?NAVY:"#f3f4f6", color:mine?"#fff":"#111827", borderRadius:mine?"12px 12px 2px 12px":"12px 12px 12px 2px", padding:"0.65rem 0.9rem", fontSize:13 }}>
                      <div>{m.body}</div>
                      <div style={{ fontSize:10, color:mine?"rgba(255,255,255,0.5)":"#9ca3af", marginTop:4, textAlign:mine?"right":"left" }}>
                        {new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div style={{ padding:"0.85rem", borderTop:"1px solid #e5e7eb", display:"flex", gap:8 }}>
              <input
                style={{ flex:1, padding:"0.65rem 0.85rem", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none" }}
                placeholder="Type a message…"
                value={msgInput}
                onChange={e=>setMsgInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendMessage()}
              />
              <button onClick={sendMessage} disabled={!msgInput.trim()} style={{ background:NAVY, color:CYAN, border:"none", borderRadius:8, padding:"0.65rem 1.1rem", fontSize:13, fontWeight:700, cursor:msgInput.trim()?"pointer":"default", opacity:msgInput.trim()?1:0.5, fontFamily:"'DM Sans',sans-serif" }}>Send</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:999, padding:"0" }}>
          <div className="ca-modal-card">
            <h3 style={{ color:NAVY, fontSize:17, fontWeight:800, marginBottom:4 }}>Express Interest</h3>
            <p style={{ color:"#6b7280", fontSize:13, marginBottom:"1.25rem" }}>{modal.business_name || modal.facility_type} · {modal.location}</p>
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
