import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const NAVY="#0A1628", CYAN="#00D4FF", BORDER="#1e3a6e", MUTED="#6b8cba";

const FACILITY_TYPES=["Office","Retail","Restaurant","Medical","Warehouse","Gym/Fitness","Airbnb/VRBO","Residential","Other"];
const CONTRACT_LENGTHS=["30 days","3 months","6 months","1 year","Ongoing"];

export default function BuyerDashboard() {
  const { user, authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("post");
  const [contracts, setContracts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [chatDeal, setChatDeal] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  const [form, setForm] = useState({
    business_name:"", facility_type:"Office", notes:"", location:"",
    zip:"", sqft:"", budget:"", frequency:"Weekly",
    contract_length:"3 months", start_date:""
  });

  useEffect(() => {
    if (tab==="contracts") loadContracts();
  }, [tab]);

  const loadContracts = async () => {
    const r = await authFetch("/api/contracts/posted");
    const d = await r.json();
    if (Array.isArray(d)) setContracts(d);
  };

  const loadResponses = async (id) => {
    if (expanded===id) { setExpanded(null); return; }
    setExpanded(id);
    if (responses[id]) return;
    const r = await authFetch(`/api/contracts/${id}`);
    const d = await r.json();
    setResponses(prev => ({ ...prev, [id]: d.responses||[] }));
  };

  const acceptResponse = async (contractId, responseId) => {
    const res = await authFetch(`/api/contracts/${contractId}/accept/${responseId}`, { method:"POST" });
    const deal = await res.json();
    // Reload responses so deal_id is populated (needed for "Message Cleaner" button)
    const r2 = await authFetch(`/api/contracts/${contractId}`);
    const d2 = await r2.json();
    setResponses(prev => ({ ...prev, [contractId]: d2.responses || [] }));
    // Also update contracts list to show closed status
    loadContracts();
  };

  const openChat = async (dealId, resp) => {
    setMessages([]);
    setChatDeal({ deal_id: dealId, cleaner_name: resp.name, company_name: resp.company_name });
    const r = await authFetch(`/api/messages/${dealId}`);
    const d = await r.json();
    if (Array.isArray(d)) setMessages(d);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !chatDeal) return;
    await authFetch(`/api/messages/${chatDeal.deal_id}`, { method:"POST", body: JSON.stringify({ body: msgInput }) });
    setMsgInput("");
    const r = await authFetch(`/api/messages/${chatDeal.deal_id}`);
    const d = await r.json();
    if (Array.isArray(d)) setMessages(d);
  };

  // Poll chat every 5s when open
  useEffect(()=>{
    if (!chatDeal) return;
    const t = setInterval(async ()=>{
      const r = await authFetch(`/api/messages/${chatDeal.deal_id}`);
      const d = await r.json();
      if (Array.isArray(d)) setMessages(d);
    }, 5000);
    return ()=>clearInterval(t);
  },[chatDeal]);

  const submitContract = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    const r = await authFetch("/api/contracts", {
      method:"POST", body: JSON.stringify(form)
    });
    const d = await r.json();
    if (d.id) { setMsg("✓ Contract posted!"); setForm({business_name:"",facility_type:"Office",notes:"",location:"",zip:"",sqft:"",budget:"",frequency:"Weekly",contract_length:"3 months",start_date:""}); }
    else setMsg(d.error||"Something went wrong");
    setLoading(false);
  };

  const inp = { width:"100%", padding:"0.65rem 0.85rem", background:"rgba(255,255,255,0.07)", border:`1px solid ${BORDER}`, borderRadius:7, fontSize:14, color:"#fff", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" };
  const lbl = { display:"block", color:"#a0b4cc", fontSize:13, fontWeight:600, marginBottom:5 };

  return (
    <div style={{ minHeight:"100vh", background:NAVY, fontFamily:"'DM Sans',sans-serif" }}>
      {/* NAV */}
      <nav style={{ borderBottom:`1px solid ${BORDER}`, padding:"1rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Logo size={30} />
        <div className="ca-nav-right">
          {/* SQUARE TOGGLE */}
          <div className="ca-toggle" style={{ background:"#0d1f3c", border:`1px solid ${BORDER}` }}>
            {[["post","Post Job"],["contracts","My Contracts"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                background:tab===t?CYAN:"transparent",
                color:tab===t?NAVY:MUTED,
                border:"none",
                padding:"6px 18px",
                fontSize:13,
                fontWeight:tab===t?700:500,
                cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                letterSpacing:"0.01em"
              }}>{l}</button>
            ))}
          </div>
          <button onClick={()=>{logout();nav("/");}} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"6px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sign out</button>
        </div>
      </nav>

      <div className="ca-page" style={{ padding:"1.5rem", maxWidth:760, margin:"0 auto" }}>

        {/* POST JOB */}
        {tab==="post" && (
          <div className="ca-form-card" style={{ background:"#0d1f3c", borderRadius:12, padding:"2rem", border:`1px solid ${BORDER}` }}>
            <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, marginBottom:"1.5rem" }}>Post a Cleaning Job</h2>
            <form onSubmit={submitContract} style={{ display:"grid", gap:16 }}>
              <div>
                <label style={lbl}>Business / Property Name</label>
                <input style={inp} placeholder="e.g. Center City Office Suite" value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})} required />
              </div>
              <div className="ca-grid-2">
                <div>
                  <label style={lbl}>Facility Type</label>
                  <select style={inp} value={form.facility_type} onChange={e=>setForm({...form,facility_type:e.target.value})}>
                    {FACILITY_TYPES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Frequency</label>
                  <select style={inp} value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}>
                    {["Daily","Weekly","Bi-weekly","Monthly","One-time"].map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="ca-grid-2">
                <div>
                  <label style={lbl}>Contract Length</label>
                  <select style={inp} value={form.contract_length} onChange={e=>setForm({...form,contract_length:e.target.value})}>
                    {CONTRACT_LENGTHS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Sq Footage</label>
                  <input style={inp} placeholder="e.g. 2,500 sqft" value={form.sqft} onChange={e=>setForm({...form,sqft:e.target.value})} />
                </div>
              </div>
              <div>
                <label style={lbl}>Notes / Special Requirements</label>
                <textarea style={{...inp,minHeight:90,resize:"vertical"}} placeholder="Describe what needs to be cleaned, any special requirements…" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
              </div>
              <div className="ca-grid-3">
                <div>
                  <label style={lbl}>City / Address</label>
                  <input style={inp} placeholder="Philadelphia, PA" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} required />
                </div>
                <div>
                  <label style={lbl}>ZIP</label>
                  <input style={inp} placeholder="19103" value={form.zip} onChange={e=>setForm({...form,zip:e.target.value})} />
                </div>
                <div>
                  <label style={lbl}>Budget</label>
                  <input style={inp} placeholder="$800/mo" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} />
                </div>
              </div>
              <div>
                <label style={lbl}>Start Date</label>
                <input type="date" style={inp} value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} />
              </div>
              {msg && <div style={{ color:msg.startsWith("✓")?"#4ade80":"#f87171", fontSize:13, fontWeight:600 }}>{msg}</div>}
              <button type="submit" disabled={loading} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:8, padding:"0.85rem", fontSize:15, fontWeight:800, cursor:"pointer", letterSpacing:"0.01em" }}>
                {loading?"Posting…":"Post Job →"}
              </button>
            </form>
          </div>
        )}

        {/* MY CONTRACTS */}
        {tab==="contracts" && (
          <div>
            <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, marginBottom:"1rem" }}>My Posted Jobs</h2>
            {contracts.length===0
              ? <div style={{ background:"#0d1f3c", borderRadius:12, padding:"2.5rem", textAlign:"center", color:MUTED, border:`1px solid ${BORDER}` }}>No jobs posted yet. <button onClick={()=>setTab("post")} style={{ color:CYAN, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Post one →</button></div>
              : contracts.map(c=>(
                <div key={c.id} style={{ background:"#fff", borderRadius:12, marginBottom:14, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <div onClick={()=>loadResponses(c.id)} style={{ padding:"1.25rem", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ color:NAVY, fontWeight:700, fontSize:15 }}>{c.business_name}</div>
                      <div style={{ color:"#6b7280", fontSize:13, marginTop:4 }}>{c.location} · {c.facility_type} · {c.response_count||0} response{c.response_count!==1?"s":""}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {c.budget && <span style={{ color:"#15803d", fontWeight:700, fontSize:14 }}>{c.budget}</span>}
                      <span style={{ color:CYAN, fontSize:18 }}>{expanded===c.id?"▲":"▼"}</span>
                    </div>
                  </div>
                  {expanded===c.id && (
                    <div style={{ borderTop:"1px solid #f3f4f6", padding:"1rem 1.25rem", background:"#fafafa" }}>
                      {(!responses[c.id]||responses[c.id].length===0)
                        ? <p style={{ color:"#9ca3af", fontSize:13 }}>No responses yet.</p>
                        : responses[c.id].map(resp=>(
                          <div key={resp.id} style={{ background:"#fff", borderRadius:8, padding:"1rem", marginBottom:10, border:"1px solid #e5e7eb" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                              <div>
                                <div style={{ color:NAVY, fontWeight:700, fontSize:14 }}>{resp.name}</div>
                                {resp.company_name && <div style={{ color:"#6b7280", fontSize:12 }}>{resp.company_name}</div>}
                                <div style={{ color:"#374151", fontSize:13, marginTop:6 }}>{resp.message}</div>
                                {resp.quote && <div style={{ color:"#15803d", fontWeight:700, fontSize:14, marginTop:6 }}>Quote: {resp.quote}</div>}
                              </div>
                              <span style={{
                                background:resp.status==="accepted"?"#dcfce7":resp.status==="rejected"?"#fee2e2":"#fef9c3",
                                color:resp.status==="accepted"?"#166534":resp.status==="rejected"?"#dc2626":"#92400e",
                                fontSize:11, padding:"3px 10px", borderRadius:4, fontWeight:700, whiteSpace:"nowrap"
                              }}>{resp.status.toUpperCase()}</span>
                            </div>
                            <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                              {resp.status==="pending" && (
                                <button onClick={()=>acceptResponse(c.id,resp.id)} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:6, padding:"6px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                                  Accept This Cleaner
                                </button>
                              )}
                              {resp.status==="accepted" && resp.deal_id && (
                                <button onClick={()=>openChat(resp.deal_id, resp)} style={{ background:NAVY, color:CYAN, border:`1px solid ${BORDER}`, borderRadius:6, padding:"6px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                                  💬 Message Cleaner
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
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
            <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ color:NAVY, fontWeight:800, fontSize:15 }}>💬 {chatDeal.company_name || chatDeal.cleaner_name}</div>
                <div style={{ color:"#6b7280", fontSize:12, marginTop:2 }}>In-app message thread</div>
              </div>
              <button onClick={()=>setChatDeal(null)} style={{ background:"#f3f4f6", border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer", color:"#6b7280", fontSize:16 }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:10 }}>
              {messages.length===0 && (
                <div style={{ textAlign:"center", color:"#9ca3af", fontSize:13, marginTop:"2rem" }}>No messages yet. Start the conversation!</div>
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
    </div>
  );
}
