import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CYAN="#00d4ff",NAVY="#0a1628",SURFACE="#0f2044",BORDER="#1e3a6e",GOLD="#ffd700",GREEN="#00e096",MUTED="#6b8cba",TEXT="#e8f4ff",LABEL="#a0b4cc";

const S = {
  page:{minHeight:"100vh",background:NAVY,fontFamily:"system-ui,sans-serif",color:TEXT},
  nav:{background:SURFACE,borderBottom:`1px solid ${BORDER}`,padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"},
  logo:{color:CYAN,fontWeight:800,fontSize:20},
  navRight:{display:"flex",gap:12,alignItems:"center"},
  navBtn:{background:"transparent",color:MUTED,border:`1px solid ${BORDER}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13},
  body:{maxWidth:900,margin:"0 auto",padding:"1.5rem 1rem"},
  h2:{color:TEXT,fontSize:20,fontWeight:700,marginBottom:"1.25rem"},
  card:{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"1.5rem",marginBottom:"1.25rem"},
  form:{display:"grid",gap:"1rem"},
  row2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"},
  label:{color:LABEL,fontSize:13,marginBottom:5,display:"block"},
  input:{width:"100%",padding:"0.7rem 1rem",background:NAVY,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,fontSize:14,boxSizing:"border-box",outline:"none"},
  select:{width:"100%",padding:"0.7rem 1rem",background:NAVY,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,fontSize:14,boxSizing:"border-box",outline:"none"},
  textarea:{width:"100%",padding:"0.7rem 1rem",background:NAVY,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,fontSize:14,boxSizing:"border-box",outline:"none",resize:"vertical",minHeight:90},
  btn:{padding:"0.8rem 1.5rem",background:CYAN,color:NAVY,fontWeight:700,fontSize:15,border:"none",borderRadius:10,cursor:"pointer"},
  contractCard:{background:NAVY,border:`1px solid ${BORDER}`,borderRadius:12,padding:"1.25rem",marginBottom:"1rem"},
  contractTitle:{color:TEXT,fontWeight:700,fontSize:16,marginBottom:8},
  meta:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8},
  tag:{background:"rgba(0,212,255,0.1)",color:CYAN,fontSize:12,padding:"3px 10px",borderRadius:20},
  responses:{color:GREEN,fontSize:13,fontWeight:600},
  daysLeft:{color:GOLD,fontSize:12},
  tabs:{display:"flex",gap:8,marginBottom:"1.5rem"},
  tab:(a)=>({padding:"0.6rem 1.25rem",borderRadius:10,border:`1px solid ${a?CYAN:BORDER}`,background:a?"rgba(0,212,255,0.08)":SURFACE,color:a?CYAN:MUTED,cursor:"pointer",fontWeight:600,fontSize:14}),
  responseItem:{display:"flex",alignItems:"center",gap:12,padding:"0.75rem",background:SURFACE,borderRadius:10,marginBottom:8},
  rName:{color:TEXT,fontWeight:600,fontSize:14,flex:1},
  rCompany:{color:MUTED,fontSize:13},
  rRating:{color:GOLD,fontSize:13},
  acceptBtn:{background:GREEN,color:NAVY,border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontWeight:700,fontSize:13},
  reviewForm:{background:"rgba(0,212,255,0.05)",border:`1px solid ${BORDER}`,borderRadius:10,padding:"1rem",marginTop:"0.75rem"},
  stars:{display:"flex",gap:6,marginBottom:"0.75rem"},
  star:(a)=>({fontSize:24,cursor:"pointer",color:a?GOLD:BORDER}),
};

export default function BuyerDashboard() {
  const { user, authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("post");
  const [contracts, setContracts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [responses, setResponses] = useState({});
  const [reviewState, setReviewState] = useState({});
  const [form, setForm] = useState({ title:"", location:"", service_type:"", sq_footage:"", frequency:"", budget:"", duration_months:"3", notes:"" });
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (tab === "contracts") loadContracts();
  }, [tab]);

  const loadContracts = async () => {
    const r = await authFetch("/api/contracts/posted");
    if (r.ok) setContracts(await r.json());
  };

  const loadResponses = async (id) => {
    if (responses[id]) return;
    const r = await authFetch(`/api/contracts/${id}`);
    if (r.ok) {
      const data = await r.json();
      setResponses(p => ({ ...p, [id]: data.responses || [] }));
    }
  };

  const expand = async (id) => {
    setExpanded(expanded === id ? null : id);
    if (expanded !== id) loadResponses(id);
  };

  const accept = async (contractId, responseId, cleanerId) => {
    await authFetch(`/api/contracts/${contractId}/accept/${responseId}`, { method: "POST" });
    setResponses(p => ({ ...p, [contractId]: p[contractId].map(r => ({ ...r, status: r.id === responseId ? "accepted" : "rejected" })) }));
    setReviewState(p => ({ ...p, [responseId]: { open: true, cleanerId, rating: 0, comment: "" } }));
  };

  const submitReview = async (dealId, cleanerId, responseId) => {
    const rs = reviewState[responseId];
    await authFetch("/api/reviews", { method: "POST", body: JSON.stringify({ deal_id: dealId, reviewee_id: cleanerId, rating: rs.rating, comment: rs.comment }) });
    setReviewState(p => ({ ...p, [responseId]: { ...p[responseId], submitted: true } }));
  };

  const postContract = async e => {
    e.preventDefault();
    setPosting(true);
    const r = await authFetch("/api/contracts", { method: "POST", body: JSON.stringify(form) });
    setPosting(false);
    if (r.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); setForm({ title:"", location:"", service_type:"", sq_footage:"", frequency:"", budget:"", duration_months:"3", notes:"" }); }
  };

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <Logo size={28} />
        <div style={S.navRight}>
          <span style={{ color: MUTED, fontSize: 13 }}>{user?.company_name || user?.name}</span>
          <button style={S.navBtn} onClick={() => { logout(); nav("/login"); }}>Sign out</button>
        </div>
      </nav>
      <div style={S.body}>
        <div style={S.tabs}>
          {[["post","Post Contract"],["contracts","My Contracts"]].map(([k,l]) => (
            <button key={k} style={S.tab(tab===k)} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "post" && (
          <div style={S.card}>
            <div style={S.h2}>Post a Cleaning Contract</div>
            {success && <div style={{ color: GREEN, marginBottom: "1rem", fontWeight: 600 }}>✅ Contract posted! Cleaners will start responding soon.</div>}
            <form style={S.form} onSubmit={postContract}>
              <div>
                <label style={S.label}>Contract Title</label>
                <input style={S.input} value={form.title} onChange={set("title")} placeholder="e.g. Weekly Office Cleaning — 3rd Floor" required />
              </div>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Location</label>
                  <input style={S.input} value={form.location} onChange={set("location")} placeholder="City, State" required />
                </div>
                <div>
                  <label style={S.label}>Service Type</label>
                  <select style={S.select} value={form.service_type} onChange={set("service_type")} required>
                    <option value="">Select…</option>
                    {["Office","Warehouse","Retail","Medical","School","Restaurant","Post-Construction"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Sq. Footage</label>
                  <input style={S.input} value={form.sq_footage} onChange={set("sq_footage")} placeholder="e.g. 5,000 sq ft" />
                </div>
                <div>
                  <label style={S.label}>Frequency</label>
                  <select style={S.select} value={form.frequency} onChange={set("frequency")}>
                    <option value="">Select…</option>
                    {["Daily","3x/week","Weekly","Bi-weekly","Monthly","One-time"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Budget (monthly)</label>
                  <input style={S.input} value={form.budget} onChange={set("budget")} placeholder="e.g. $800–$1,200" />
                </div>
                <div>
                  <label style={S.label}>Contract Duration</label>
                  <select style={S.select} value={form.duration_months} onChange={set("duration_months")}>
                    {[["1","1 month"],["3","3 months"],["6","6 months"],["12","1 year"],["24","2 years"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={S.label}>Additional Notes</label>
                <textarea style={S.textarea} value={form.notes} onChange={set("notes")} placeholder="Special requirements, access instructions, etc." />
              </div>
              <div><button style={S.btn} type="submit" disabled={posting}>{posting ? "Posting…" : "Post Contract →"}</button></div>
            </form>
          </div>
        )}

        {tab === "contracts" && (
          <div>
            <div style={S.h2}>Your Posted Contracts</div>
            {contracts.length === 0 && <p style={{ color: MUTED }}>No contracts posted yet.</p>}
            {contracts.map(c => (
              <div key={c.id} style={S.contractCard}>
                <div style={S.contractTitle} onClick={() => expand(c.id)} role="button" tabIndex={0}>
                  {c.title}
                </div>
                <div style={S.meta}>
                  <span style={S.tag}>{c.service_type}</span>
                  <span style={S.tag}>{c.location}</span>
                  <span style={S.tag}>{c.frequency}</span>
                  {c.days_remaining !== undefined && (
                    <span style={{ ...S.tag, background: c.days_remaining < 14 ? "rgba(255,107,107,0.15)" : "rgba(0,224,150,0.1)", color: c.days_remaining < 14 ? "#ff6b6b" : GREEN }}>
                      {c.days_remaining > 0 ? `${c.days_remaining}d left` : "EXPIRED — Renew?"}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={S.responses}>{c.response_count || 0} responses</span>
                  <button style={{ ...S.navBtn, color: CYAN }} onClick={() => expand(c.id)}>
                    {expanded === c.id ? "Hide ▲" : "View Responses ▼"}
                  </button>
                </div>

                {expanded === c.id && responses[c.id] && (
                  <div style={{ marginTop: "1rem" }}>
                    {responses[c.id].length === 0 && <p style={{ color: MUTED, fontSize: 14 }}>No responses yet. Cleaners will respond soon.</p>}
                    {responses[c.id].map(resp => (
                      <div key={resp.id} style={S.responseItem}>
                        <div style={{ flex: 1 }}>
                          <div style={S.rName}>{resp.cleaner_name}</div>
                          <div style={S.rCompany}>{resp.company_name} · {resp.location}</div>
                          {resp.rating > 0 && <div style={S.rRating}>{"★".repeat(Math.round(resp.rating))} ({resp.review_count} reviews)</div>}
                          {resp.message && <p style={{ color: LABEL, fontSize: 13, margin: "0.5rem 0 0" }}>{resp.message}</p>}
                        </div>
                        {resp.status === "pending" && (
                          <button style={S.acceptBtn} onClick={() => accept(c.id, resp.id, resp.cleaner_id)}>Accept ✓</button>
                        )}
                        {resp.status === "accepted" && <span style={{ color: GREEN, fontSize: 13, fontWeight: 700 }}>✅ Hired</span>}
                        {resp.status === "rejected" && <span style={{ color: MUTED, fontSize: 13 }}>Passed</span>}

                        {reviewState[resp.id]?.open && !reviewState[resp.id]?.submitted && (
                          <div style={S.reviewForm}>
                            <div style={{ color: TEXT, fontSize: 14, marginBottom: "0.75rem" }}>Leave a review for {resp.cleaner_name}</div>
                            <div style={S.stars}>
                              {[1,2,3,4,5].map(n => (
                                <span key={n} style={S.star(n <= (reviewState[resp.id]?.rating || 0))}
                                  onClick={() => setReviewState(p => ({ ...p, [resp.id]: { ...p[resp.id], rating: n } }))}>★</span>
                              ))}
                            </div>
                            <textarea style={{ ...S.textarea, minHeight: 60 }}
                              placeholder="How was the service?"
                              value={reviewState[resp.id]?.comment || ""}
                              onChange={e => setReviewState(p => ({ ...p, [resp.id]: { ...p[resp.id], comment: e.target.value } }))} />
                            <button style={{ ...S.btn, marginTop: "0.5rem", padding: "0.6rem 1rem", fontSize: 13 }}
                              onClick={() => submitReview(null, resp.cleaner_id, resp.id)}>Submit Review</button>
                          </div>
                        )}
                        {reviewState[resp.id]?.submitted && <span style={{ color: GREEN, fontSize: 13 }}>Review submitted ✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
