import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CYAN="#00d4ff",NAVY="#0a1628",SURFACE="#0f2044",BORDER="#1e3a6e",GOLD="#ffd700",GREEN="#00e096",PURPLE="#7c3aed",MUTED="#6b8cba",TEXT="#e8f4ff",LABEL="#a0b4cc";

// Keyframes injected once
const CSS = `
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(0,212,255,.5)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}100%{box-shadow:0 0 0 0 rgba(0,212,255,0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;

const S = {
  page:{minHeight:"100vh",background:NAVY,fontFamily:"system-ui,sans-serif",color:TEXT},
  nav:{background:SURFACE,borderBottom:`1px solid ${BORDER}`,padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"},
  logo:{color:CYAN,fontWeight:800,fontSize:20},
  navRight:{display:"flex",gap:12,alignItems:"center"},
  navBtn:{background:"transparent",color:MUTED,border:`1px solid ${BORDER}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13},
  layout:{display:"flex",gap:0,minHeight:"calc(100vh - 61px)"},
  main:{flex:1,padding:"1.5rem",overflowY:"auto"},
  sidebar:{width:280,background:SURFACE,borderLeft:`1px solid ${BORDER}`,padding:"1.25rem",overflowY:"auto"},
  banner:{background:"linear-gradient(90deg,rgba(0,212,255,.15),rgba(0,212,255,.05))",border:`1px solid ${CYAN}`,borderRadius:12,padding:"0.85rem 1.25rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:10,animation:"slideDown .4s ease"},
  bannerDot:{width:10,height:10,borderRadius:"50%",background:CYAN,animation:"pulseRing 1.5s infinite"},
  bannerText:{color:CYAN,fontWeight:600,fontSize:14},
  tabs:{display:"flex",gap:8,marginBottom:"1.25rem"},
  tab:(a)=>({padding:"0.55rem 1.1rem",borderRadius:10,border:`1px solid ${a?CYAN:BORDER}`,background:a?"rgba(0,212,255,0.08)":SURFACE,color:a?CYAN:MUTED,cursor:"pointer",fontWeight:600,fontSize:13}),
  card:{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"1.25rem",marginBottom:"1rem",animation:"fadeUp .3s ease"},
  cardNew:{border:`1px solid ${CYAN}`,boxShadow:`0 0 16px rgba(0,212,255,.15)`},
  cardTitle:{color:TEXT,fontWeight:700,fontSize:16,marginBottom:8},
  meta:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:"0.75rem"},
  tag:{background:"rgba(0,212,255,0.1)",color:CYAN,fontSize:11,padding:"2px 9px",borderRadius:20},
  tagGold:{background:"rgba(255,215,0,0.1)",color:GOLD,fontSize:11,padding:"2px 9px",borderRadius:20},
  row:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8},
  budget:{color:GREEN,fontWeight:700,fontSize:15},
  expBtn:{background:CYAN,color:NAVY,border:"none",borderRadius:10,padding:"0.6rem 1.25rem",fontWeight:700,fontSize:14,cursor:"pointer",animation:"pulseRing 2s infinite"},
  modal:{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"1rem"},
  modalCard:{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:16,padding:"2rem",width:"100%",maxWidth:440},
  modalTitle:{color:TEXT,fontSize:18,fontWeight:700,marginBottom:"0.5rem"},
  modalSub:{color:MUTED,fontSize:13,marginBottom:"1.25rem"},
  input:{width:"100%",padding:"0.7rem 1rem",background:NAVY,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,fontSize:14,boxSizing:"border-box",outline:"none",marginBottom:"1rem"},
  textarea:{width:"100%",padding:"0.7rem 1rem",background:NAVY,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,fontSize:14,boxSizing:"border-box",outline:"none",resize:"vertical",minHeight:80,marginBottom:"1rem"},
  checkbox:{display:"flex",alignItems:"center",gap:8,color:MUTED,fontSize:13,marginBottom:"1.25rem",cursor:"pointer"},
  modalBtns:{display:"flex",gap:10},
  submitBtn:{flex:1,padding:"0.75rem",background:CYAN,color:NAVY,fontWeight:700,border:"none",borderRadius:10,cursor:"pointer",fontSize:15},
  cancelBtn:{padding:"0.75rem 1.25rem",background:"transparent",color:MUTED,border:`1px solid ${BORDER}`,borderRadius:10,cursor:"pointer",fontSize:14},
  dealBadge:{background:"linear-gradient(135deg,rgba(0,212,255,.12),rgba(124,58,237,.12))",border:`1px solid ${BORDER}`,borderRadius:12,padding:"0.85rem",marginBottom:"0.75rem",animation:"fadeUp .4s ease"},
  dealAmount:{color:GREEN,fontWeight:800,fontSize:18},
  dealName:{color:TEXT,fontSize:13,fontWeight:600},
  dealType:{color:MUTED,fontSize:12},
  sideTitle:{color:MUTED,fontSize:12,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"0.75rem"},
  myContractCard:{background:NAVY,border:`1px solid ${BORDER}`,borderRadius:12,padding:"1rem",marginBottom:"0.75rem"},
  renewAlert:{background:"rgba(255,215,0,0.08)",border:`1px solid ${GOLD}`,borderRadius:8,padding:"0.5rem 0.75rem",marginTop:"0.5rem",color:GOLD,fontSize:12},
};

const MOCK_DEALS = [
  { id:1, cleaner:"Apex Clean Co.", type:"Office 5,200 sqft", monthly:"$1,400" },
  { id:2, cleaner:"SparkPro Services", type:"Warehouse Weekly", monthly:"$950" },
  { id:3, cleaner:"Elite Facility Group", type:"Medical Daily", monthly:"$3,200" },
  { id:4, cleaner:"BrightShine LLC", type:"Retail 3x/week", monthly:"$780" },
];

export default function CleanerDashboard() {
  const { user, authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("leads");
  const [contracts, setContracts] = useState([]);
  const [myContracts, setMyContracts] = useState([]);
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState({ message: "", share_deal: false });
  const [newIds, setNewIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const prevCount = useRef(0);

  useEffect(() => {
    style();
    loadLeads();
    loadMyContracts();
    const iv = setInterval(loadLeads, 15000);
    return () => clearInterval(iv);
  }, []);

  const style = () => {
    if (!document.getElementById("ca-styles")) {
      const el = document.createElement("style");
      el.id = "ca-styles"; el.textContent = CSS;
      document.head.appendChild(el);
    }
  };

  const loadLeads = async () => {
    const r = await authFetch("/api/contracts");
    if (r.ok) {
      const data = await r.json();
      setContracts(prev => {
        if (data.length > prev.length) {
          const prevIds = new Set(prev.map(c => c.id));
          setNewIds(new Set(data.filter(c => !prevIds.has(c.id)).map(c => c.id)));
          setTimeout(() => setNewIds(new Set()), 8000);
        }
        return data;
      });
    }
  };

  const loadMyContracts = async () => {
    const r = await authFetch("/api/contracts/my");
    if (r.ok) setMyContracts(await r.json());
  };

  const openModal = (contract) => {
    setModal(contract);
    setModalForm({ message: "", share_deal: false });
  };

  const submitInterest = async () => {
    setSubmitting(true);
    const r = await authFetch(`/api/contracts/${modal.id}/respond`, {
      method: "POST",
      body: JSON.stringify(modalForm),
    });
    setSubmitting(false);
    if (r.ok) {
      setContracts(p => p.filter(c => c.id !== modal.id));
      // Simulate deal badge appearing
      if (modalForm.share_deal) {
        setTimeout(() => {
          setDeals(p => [{ id: Date.now(), cleaner: user?.company_name || user?.name, type: `${modal.service_type}`, monthly: modal.budget }, ...p]);
        }, 4000);
      }
      setModal(null);
    }
  };

  const hasNewLeads = newIds.size > 0;

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <nav style={S.nav}>
        <span style={S.logo}>CleanAlert</span>
        <div style={S.navRight}>
          <span style={{ color: MUTED, fontSize: 13 }}>{user?.company_name || user?.name}</span>
          {user?.subscription_status !== "active" && (
            <button style={{ ...S.navBtn, color: GOLD, borderColor: GOLD }} onClick={() => nav("/subscribe")}>⚡ Upgrade</button>
          )}
          <button style={S.navBtn} onClick={() => { logout(); nav("/login"); }}>Sign out</button>
        </div>
      </nav>

      <div style={S.layout}>
        <div style={S.main}>
          {hasNewLeads && (
            <div style={S.banner}>
              <div style={S.bannerDot} />
              <span style={S.bannerText}>{newIds.size} new contract{newIds.size > 1 ? "s" : ""} just posted in your area</span>
            </div>
          )}

          <div style={S.tabs}>
            {[["leads","Live Leads"],["mycontracts","My Contracts"]].map(([k,l]) => (
              <button key={k} style={S.tab(tab===k)} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === "leads" && (
            <>
              {contracts.length === 0 && <p style={{ color: MUTED }}>No open contracts right now. Check back soon.</p>}
              {contracts.map(c => (
                <div key={c.id} style={{ ...S.card, ...(newIds.has(c.id) ? S.cardNew : {}) }}>
                  {newIds.has(c.id) && <div style={{ color: CYAN, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🔵 NEW</div>}
                  <div style={S.cardTitle}>{c.title}</div>
                  <div style={S.meta}>
                    <span style={S.tag}>{c.service_type}</span>
                    <span style={S.tag}>📍 {c.location}</span>
                    {c.frequency && <span style={S.tag}>{c.frequency}</span>}
                    {c.sq_footage && <span style={S.tag}>{c.sq_footage}</span>}
                    {c.duration_months && <span style={S.tagGold}>{c.duration_months}mo contract</span>}
                  </div>
                  {c.notes && <p style={{ color: LABEL, fontSize: 13, marginBottom: "0.75rem" }}>{c.notes}</p>}
                  <div style={S.row}>
                    <span style={S.budget}>{c.budget || "Budget TBD"}</span>
                    <button style={S.expBtn} onClick={() => openModal(c)}>Express Interest →</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "mycontracts" && (
            <>
              {myContracts.length === 0 && <p style={{ color: MUTED }}>No active contracts yet.</p>}
              {myContracts.map(c => (
                <div key={c.id} style={S.myContractCard}>
                  <div style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{c.title}</div>
                  <div style={S.meta}>
                    <span style={S.tag}>{c.service_type}</span>
                    <span style={S.tag}>{c.location}</span>
                    <span style={{ ...S.tag, color: GREEN, background: "rgba(0,224,150,0.1)" }}>{c.days_remaining}d remaining</span>
                  </div>
                  <div style={{ color: GREEN, fontWeight: 700 }}>{c.budget}</div>
                  {c.days_remaining <= 30 && (
                    <div style={S.renewAlert}>⚠️ Contract ending soon — contact buyer to renew</div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div style={S.sidebar}>
          <div style={S.sideTitle}>🏆 Claimed Deals</div>
          {deals.map(d => (
            <div key={d.id} style={S.dealBadge}>
              <div style={S.dealAmount}>{d.monthly}/mo</div>
              <div style={S.dealName}>{d.cleaner}</div>
              <div style={S.dealType}>{d.type}</div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={S.modalCard}>
            <div style={S.modalTitle}>Express Interest</div>
            <div style={S.modalSub}>{modal.title} · {modal.location}</div>
            <textarea style={S.textarea}
              placeholder="Introduce your business — why are you the right fit?"
              value={modalForm.message}
              onChange={e => setModalForm(f => ({ ...f, message: e.target.value }))}
            />
            <label style={S.checkbox}>
              <input type="checkbox" checked={modalForm.share_deal}
                onChange={e => setModalForm(f => ({ ...f, share_deal: e.target.checked }))} />
              Share this deal publicly if we're accepted (helps other cleaners see the marketplace is active)
            </label>
            <div style={S.modalBtns}>
              <button style={S.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.submitBtn} onClick={submitInterest} disabled={submitting}>
                {submitting ? "Sending…" : "Send Interest →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
