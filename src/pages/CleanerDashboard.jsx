import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import ContractCard from "../components/ContractCard.jsx";

const CYAN="#00d4ff",NAVY="#0a1628",SURFACE="#0f2044",BORDER="#1e3a6e",GOLD="#ffd700",GREEN="#00e096",PURPLE="#7c3aed",MUTED="#6b8cba",TEXT="#e8f4ff",LABEL="#a0b4cc";

const CSS = `
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(0,212,255,.5)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}100%{box-shadow:0 0 0 0 rgba(0,212,255,0)}}
@keyframes pulseGold{0%{box-shadow:0 0 0 0 rgba(255,215,0,.4)}70%{box-shadow:0 0 0 10px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
`;

const SEED_CARDS = [
  { id:"seed-1", title:"Weekly Office Cleaning — Downtown HQ", location:"Philadelphia, PA", service_type:"Office", sq_footage:"4,200 sq ft", frequency:"3x/week", budget:"$1,100/mo", duration_months:12, notes:"Need bonded and insured crew. Access via lobby after 6pm.", _seed:true },
  { id:"seed-2", title:"Warehouse Deep Clean + Maintenance", location:"Camden, NJ", service_type:"Warehouse", sq_footage:"18,000 sq ft", frequency:"Weekly", budget:"$2,400/mo", duration_months:6, notes:"Heavy equipment areas require industrial cleaning products.", _seed:true },
  { id:"seed-3", title:"Medical Office Sanitization", location:"King of Prussia, PA", service_type:"Medical", sq_footage:"2,800 sq ft", frequency:"Daily", budget:"$3,200/mo", duration_months:24, notes:"Must follow OSHA standards. References required.", _seed:true },
];

const SEED_DEALS = [
  { id:1, cleaner:"Apex Clean Co.", type:"Office · 5,200 sqft", monthly:"$1,400/mo", badge:"🏆" },
  { id:2, cleaner:"SparkPro Services", type:"Warehouse · Weekly", monthly:"$950/mo", badge:"⭐" },
  { id:3, cleaner:"Elite Facility Group", type:"Medical · Daily", monthly:"$3,200/mo", badge:"💎" },
  { id:4, cleaner:"BrightShine LLC", type:"Retail · 3x/week", monthly:"$780/mo", badge:"🥇" },
  { id:5, cleaner:"ProClean Solutions", type:"School · Weekly", monthly:"$1,850/mo", badge:"🏅" },
];

function Tag({ children, color = CYAN }) {
  return (
    <span style={{ background:`rgba(${color===GOLD?"255,215,0":color===GREEN?"0,224,150":"0,212,255"},.12)`, color, fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function DealBadge({ deal }) {
  return (
    <div style={{
      background:`linear-gradient(135deg, ${SURFACE}, rgba(255,215,0,0.05))`,
      border:`1px solid rgba(255,215,0,0.35)`,
      borderRadius:14,
      padding:"1rem",
      marginBottom:"0.75rem",
      animation:"fadeUp .4s ease",
      position:"relative",
      overflow:"hidden",
    }}>
      {/* shimmer bar */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        backgroundSize:"200% auto",
        animation:"shimmer 2.5s linear infinite",
      }} />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
        <span style={{ fontSize:20 }}>{deal.badge}</span>
        <span style={{ color:GOLD, fontWeight:800, fontSize:16, animation:"pulseGold 3s infinite" }}>{deal.monthly}</span>
      </div>
      <div style={{ color:TEXT, fontWeight:600, fontSize:13 }}>{deal.cleaner}</div>
      <div style={{ color:MUTED, fontSize:12, marginTop:2 }}>{deal.type}</div>
    </div>
  );
}

export default function CleanerDashboard() {
  const { user, authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("leads");
  const [liveContracts, setLiveContracts] = useState([]);
  const [myContracts, setMyContracts] = useState([]);
  const [deals, setDeals] = useState(SEED_DEALS);
  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState({ message:"", share_deal:false });
  const [newIds, setNewIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    loadLeads();
    loadMyContracts();
    const iv = setInterval(loadLeads, 15000);
    return () => { clearInterval(iv); document.head.removeChild(el); };
  }, []);

  const loadLeads = async () => {
    try {
      const r = await authFetch("/api/contracts");
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) {
          setLiveContracts(prev => {
            const prevIds = new Set(prev.map(c => c.id));
            const fresh = data.filter(c => !prevIds.has(c.id));
            if (fresh.length) { setNewIds(new Set(fresh.map(c => c.id))); setTimeout(() => setNewIds(new Set()), 8000); }
            return data;
          });
        }
      }
    } catch(e) {}
  };

  const loadMyContracts = async () => {
    try {
      const r = await authFetch("/api/contracts/my");
      if (r.ok) { const d = await r.json(); if (Array.isArray(d)) setMyContracts(d); }
    } catch(e) {}
  };

  // Combine seed cards + live contracts (seeds first so feed always looks active)
  const allContracts = [...liveContracts, ...SEED_CARDS.filter(s => !liveContracts.some(l => l.id === s.id))];

  const openModal = (contract) => { setModal(contract); setModalForm({ message:"", share_deal:false }); };

  const submitInterest = async () => {
    if (modal._seed) { setModal(null); return; } // seed cards don't submit
    setSubmitting(true);
    const r = await authFetch(`/api/contracts/${modal.id}/respond`, { method:"POST", body:JSON.stringify(modalForm) });
    setSubmitting(false);
    if (r.ok) {
      setLiveContracts(p => p.filter(c => c.id !== modal.id));
      if (modalForm.share_deal) {
        setTimeout(() => setDeals(p => [{ id:Date.now(), cleaner:user?.company_name||user?.name||"You", type:modal.service_type, monthly:modal.budget||"TBD", badge:"🏆" }, ...p]), 4000);
      }
      setModal(null);
    }
  };

  const hasNew = newIds.size > 0;

  const NAV = { background:SURFACE, borderBottom:`1px solid ${BORDER}`, padding:"1rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" };
  const TAB = (a) => ({ padding:"0.6rem 1.25rem", borderRadius:10, border:`1px solid ${a?CYAN:BORDER}`, background:a?`rgba(0,212,255,0.08)`:SURFACE, color:a?CYAN:MUTED, cursor:"pointer", fontWeight:700, fontSize:13 });

  return (
    <div style={{ minHeight:"100vh", background:NAVY, fontFamily:"system-ui,sans-serif", color:TEXT }}>
      <style>{CSS}</style>

      <nav style={NAV}>
        <Logo size={30} />
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ color:MUTED, fontSize:13 }}>{user?.company_name||user?.name}</span>
          {user?.user_type === "admin" && (
            <button onClick={() => nav("/admin")} style={{ background:"rgba(124,58,237,0.2)", color:"#a78bfa", border:"1px solid rgba(124,58,237,0.4)", borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", fontWeight:700 }}>Admin</button>
          )}
          <button onClick={() => { logout(); nav("/"); }} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13 }}>Sign out</button>
        </div>
      </nav>

      <div style={{ display:"flex", minHeight:"calc(100vh - 61px)" }}>
        {/* MAIN */}
        <div style={{ flex:1, padding:"1.5rem", overflowY:"auto" }}>
          {hasNew && (
            <div style={{ background:`linear-gradient(90deg,rgba(0,212,255,.15),rgba(0,212,255,.05))`, border:`1px solid ${CYAN}`, borderRadius:12, padding:"0.85rem 1.25rem", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:10, animation:"slideDown .4s ease" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:CYAN, animation:"pulseRing 1.5s infinite" }} />
              <span style={{ color:CYAN, fontWeight:700, fontSize:14 }}>{newIds.size} new contract{newIds.size>1?"s":""} just posted near you</span>
            </div>
          )}

          <div style={{ display:"flex", gap:8, marginBottom:"1.25rem" }}>
            {[["leads","🔴 Live Leads"],["mycontracts","My Contracts"]].map(([k,l]) => (
              <button key={k} style={TAB(tab===k)} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === "leads" && (
            <>
              {allContracts.map(c => (
                <ContractCard key={c.id} contract={c} isNew={newIds.has(c.id)} onExpress={openModal} />
              ))}
            </>
          )}

          {tab === "mycontracts" && (
            <>
              {myContracts.length === 0 && <p style={{ color:MUTED }}>No active contracts yet. Express interest in a lead to get started.</p>}
              {myContracts.map(c => (
                <div key={c.id} style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
                  <div style={{ color:TEXT, fontWeight:700, fontSize:16, marginBottom:8 }}>{c.title}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
                    <Tag>{c.service_type}</Tag>
                    <Tag>📍 {c.location}</Tag>
                    <Tag color={c.days_remaining<=30?GOLD:GREEN}>{c.days_remaining}d remaining</Tag>
                  </div>
                  <div style={{ color:GREEN, fontWeight:700, fontSize:16 }}>{c.budget}</div>
                  {c.days_remaining<=30 && (
                    <div style={{ background:`rgba(255,215,0,0.08)`, border:`1px solid ${GOLD}`, borderRadius:8, padding:"0.5rem 0.75rem", marginTop:"0.75rem", color:GOLD, fontSize:13 }}>
                      ⚠️ Contract ending soon — reach out to buyer to renew
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* SIDEBAR — Claimed Deals */}
        <div style={{ width:260, background:SURFACE, borderLeft:`1px solid ${BORDER}`, padding:"1.25rem", overflowY:"auto" }}>
          <div style={{ color:MUTED, fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>🏆 Claimed Deals</div>
          <p style={{ color:MUTED, fontSize:12, marginBottom:"1rem", lineHeight:1.5 }}>Cleaners who recently won contracts on CleanAlert</p>
          {deals.map(d => <DealBadge key={d.id} deal={d} />)}
        </div>
      </div>

      {/* EXPRESS INTEREST MODAL */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:"1rem" }} onClick={e => e.target===e.currentTarget&&setModal(null)}>
          <div style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:18, padding:"2rem", width:"100%", maxWidth:460 }}>
            <div style={{ color:TEXT, fontSize:19, fontWeight:800, marginBottom:"0.35rem" }}>Express Interest</div>
            <div style={{ color:MUTED, fontSize:14, marginBottom:"1.25rem" }}>{modal.title} · {modal.location}</div>
            {modal._seed ? (
              <div style={{ background:`rgba(124,58,237,0.1)`, border:`1px solid rgba(124,58,237,0.3)`, borderRadius:10, padding:"1rem", color:"#a78bfa", fontSize:14, marginBottom:"1.25rem" }}>
                This is a sample contract. Sign up as a cleaner to express interest in real contracts.
              </div>
            ) : (
              <>
                <textarea
                  style={{ width:"100%", padding:"0.75rem 1rem", background:NAVY, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, fontSize:14, boxSizing:"border-box", outline:"none", resize:"vertical", minHeight:90, marginBottom:"1rem" }}
                  placeholder="Introduce your business — why are you the right fit for this contract?"
                  value={modalForm.message}
                  onChange={e => setModalForm(f => ({ ...f, message:e.target.value }))}
                />
                <label style={{ display:"flex", alignItems:"center", gap:8, color:MUTED, fontSize:13, marginBottom:"1.5rem", cursor:"pointer" }}>
                  <input type="checkbox" checked={modalForm.share_deal} onChange={e => setModalForm(f => ({ ...f, share_deal:e.target.checked }))} />
                  Share this deal publicly if accepted (helps show the marketplace is active)
                </label>
              </>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setModal(null)} style={{ padding:"0.75rem 1.25rem", background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, borderRadius:10, cursor:"pointer", fontSize:14 }}>Cancel</button>
              <button onClick={submitInterest} disabled={submitting} style={{ flex:1, padding:"0.75rem", background:CYAN, color:NAVY, fontWeight:700, border:"none", borderRadius:10, cursor:"pointer", fontSize:15 }}>
                {modal._seed ? "Sign Up to Apply →" : submitting ? "Sending…" : "Send Interest →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
