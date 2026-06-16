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
    await authFetch(`/api/contracts/${contractId}/accept/${responseId}`, { method:"POST" });
    setResponses(prev => ({
      ...prev,
      [contractId]: prev[contractId].map(r => ({
        ...r,
        status: r.id===responseId ? "accepted" : r.status==="pending" ? "rejected" : r.status
      }))
    }));
  };

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
                      <div style={{ color:NAVY, fontWeight:700, fontSize:15 }}>{c.title}</div>
                      <div style={{ color:"#6b7280", fontSize:13, marginTop:4 }}>{c.location} · {c.category} · {c.response_count||0} response{c.response_count!==1?"s":""}</div>
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
                                <div style={{ color:NAVY, fontWeight:700, fontSize:14 }}>{resp.cleaner_name}</div>
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
                            {resp.status==="pending" && (
                              <button onClick={()=>acceptResponse(c.id,resp.id)} style={{ marginTop:10, background:CYAN, color:NAVY, border:"none", borderRadius:6, padding:"6px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                                Accept This Cleaner
                              </button>
                            )}
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
    </div>
  );
}
