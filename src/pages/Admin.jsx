import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const NAVY="#0A1628", CYAN="#00D4FF", BORDER="#1e3a6e", MUTED="#6b8cba";

export default function Admin() {
  const { authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoTab, setPromoTab] = useState(false);
  const [newCode, setNewCode] = useState({ code:"", trial_days:90, max_uses:"", note:"" });
  const [promoMsg, setPromoMsg] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [subAction, setSubAction] = useState({}); // { [userId]: { mode, date } }
  const [subMsg, setSubMsg] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sr,ur,ar,pr,nr] = await Promise.all([
          authFetch("/api/admin/stats"),
          authFetch("/api/admin/users"),
          authFetch("/api/admin/recent"),
          authFetch("/api/admin/promo-codes"),
          authFetch("/api/admin/notifications"),
        ]);
        const [s,u,a,p,n] = await Promise.all([sr.json(),ur.json(),ar.json(),pr.json(),nr.json()]);
        if (s.error) setError(`Stats: ${s.error}`); else setStats(s);
        if (Array.isArray(u)) setUsers(u); else setError(`Users: ${u?.error || 'Failed to load'}`);
        if (Array.isArray(a)) setActivity(a); else setError(`Activity: ${a?.error || 'Failed to load'}`);
        if (Array.isArray(p)) setPromoCodes(p);
        if (Array.isArray(n)) setNotifications(n);
      } catch(e) { setError(e.message); }
    };
    load();
  }, []);

  const markRead = async (id) => {
    await authFetch(`/api/admin/notifications/${id}`, { method:"PATCH" });
    setNotifications(n => n.map(x => x.id===id ? {...x, is_read:true} : x));
  };

  const createCode = async (e) => {
    e.preventDefault(); setPromoMsg("");
    const r = await authFetch("/api/admin/promo-codes", { method:"POST", body:JSON.stringify({ ...newCode, max_uses: newCode.max_uses ? parseInt(newCode.max_uses) : null }) });
    const d = await r.json();
    if (d.error) { setPromoMsg(`Error: ${d.error}`); return; }
    setPromoCodes(p=>[d,...p]);
    setNewCode({ code:"", trial_days:90, max_uses:"", note:"" });
    setPromoMsg("✓ Code created!");
  };

  const toggleCode = async (id, active) => {
    await authFetch(`/api/admin/promo-codes/${id}`, { method:"PATCH", body:JSON.stringify({ is_active:!active }) });
    setPromoCodes(p=>p.map(c=>c.id===id?{...c,is_active:!active}:c));
  };

  const toggleBan = async (id, banned) => {
    await authFetch(`/api/admin/users/${id}/ban`, { method:"POST", body:JSON.stringify({is_banned:!banned}) });
    setUsers(u => u.map(x => x.id===id ? {...x, is_banned:!banned} : x));
  };

  const controlSub = async (userId, action) => {
    const date = subAction[userId]?.date;
    if (action === "schedule" && !date) {
      setSubMsg(m=>({...m,[userId]:"Pick a date first."})); return;
    }
    const r = await authFetch(`/api/admin/users/${userId}/subscription`, {
      method:"PATCH", body: JSON.stringify({ action, scheduled_date: date })
    });
    const d = await r.json();
    if (d.error) { setSubMsg(m=>({...m,[userId]:`Error: ${d.error}`})); return; }
    setUsers(u => u.map(x => x.id===userId ? {...x, subscription_status:d.subscription_status, scheduled_activation_date:d.scheduled_activation_date} : x));
    setSubAction(m=>({...m,[userId]:{}}));
    setSubMsg(m=>({...m,[userId]: action==="activate_now"?"✓ Activated" : action==="cancel"?"✓ Cancelled" : "✓ Scheduled"}));
  };

  const th = { color:"#6b7280", fontSize:12, fontWeight:600, textAlign:"left", padding:"0.6rem 0.75rem", borderBottom:"1px solid #e5e7eb", textTransform:"uppercase", letterSpacing:"0.05em" };
  const td = { color:"#111827", fontSize:13, padding:"0.7rem 0.75rem", borderBottom:"1px solid #f3f4f6" };

  return (
    <div style={{ minHeight:"100vh", background:NAVY, fontFamily:"'DM Sans',sans-serif" }}>
      <nav style={{ borderBottom:`1px solid ${BORDER}`, padding:"1rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Logo size={30} />
          <span style={{ background:"#4c1d95", color:"#fff", fontSize:11, padding:"3px 10px", borderRadius:4, fontWeight:700, letterSpacing:"0.06em" }}>ADMIN</span>
        </div>
        <div className="ca-nav-right" style={{ gap:8 }}>
          <button onClick={()=>nav("/cleaner")} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"5px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cleaner View</button>
          <button onClick={()=>nav("/buyer")} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"5px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Buyer View</button>
          <button onClick={()=>{logout();nav("/");}} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"5px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sign out</button>
        </div>
      </nav>

      <div className="ca-page" style={{ padding:"1.5rem" }}>
        {error && <div style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"0.75rem 1rem", color:"#be123c", fontSize:13, marginBottom:"1rem" }}>⚠️ {error}</div>}

        {/* DEAL ALERTS */}
        {notifications.filter(n=>!n.is_read).length > 0 && (
          <div style={{ marginBottom:"1.5rem" }}>
            <div style={{ color:"#fff", fontSize:14, fontWeight:700, marginBottom:8 }}>
              🔔 Deal Alerts — {notifications.filter(n=>!n.is_read).length} new
            </div>
            {notifications.filter(n=>!n.is_read).map(n=>(
              <div key={n.id} style={{ background:"#fff", borderRadius:10, border:"2px solid #fbbf24", padding:"1rem 1.25rem", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ background:"#fef3c7", color:"#92400e", fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:4 }}>🤝 DEAL MADE</span>
                    <span style={{ color:"#9ca3af", fontSize:12 }}>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color:"#111827", fontWeight:700, fontSize:14, marginBottom:4 }}>{n.detail}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px" }}>
                    <div style={{ color:"#374151", fontSize:12 }}><strong>Buyer:</strong> {n.buyer_name} · {n.buyer_email}{n.buyer_phone ? ` · ${n.buyer_phone}` : ""}</div>
                    <div style={{ color:"#374151", fontSize:12 }}><strong>Cleaner:</strong> {n.cleaner_name} ({n.cleaner_company}) · {n.cleaner_email}{n.cleaner_phone ? ` · ${n.cleaner_phone}` : ""}</div>
                  </div>
                </div>
                <button onClick={()=>markRead(n.id)} style={{ background:"#0A1628", color:"#00D4FF", border:"1px solid #1e3a6e", borderRadius:6, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                  ✓ Followed Up
                </button>
              </div>
            ))}
          </div>
        )}

        {stats && (
          <div className="ca-stats" style={{ marginBottom:"1.5rem" }}>
            {[["Active Subscribers",stats.activeSubscribers??0,"🧹"],["MRR",`$${stats.mrr??0}`,"💰"],["Contracts",stats.totalContracts??0,"📋"],["Deals",stats.totalDeals??0,"🤝"]].map(([label,val,icon])=>(
              <div key={label} style={{ background:"#fff", borderRadius:10, padding:"1.25rem", border:"1px solid #e5e7eb" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                <div style={{ color:NAVY, fontSize:28, fontWeight:900 }}>{val}</div>
                <div style={{ color:"#6b7280", fontSize:13, marginTop:4 }}>{label}</div>
              </div>
            ))}
            {Array.isArray(stats.usersByType) && stats.usersByType.map(row=>(
              <div key={row.user_type} style={{ background:"#fff", borderRadius:10, padding:"1.25rem", border:"1px solid #e5e7eb" }}>
                <div style={{ color:NAVY, fontSize:28, fontWeight:900 }}>{row.count}</div>
                <div style={{ color:"#6b7280", fontSize:13, marginTop:4 }}>{row.user_type}s</div>
              </div>
            ))}
          </div>
        )}

        {activity.length>0 && (
          <div style={{ background:"#fff", borderRadius:10, padding:"1.25rem", border:"1px solid #e5e7eb", marginBottom:"1.5rem" }}>
            <div style={{ color:NAVY, fontSize:15, fontWeight:700, marginBottom:"1rem" }}>Recent Activity</div>
            {activity.map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"0.6rem 0", borderBottom:i<activity.length-1?"1px solid #f3f4f6":"none" }}>
                <span style={{ background:a.type==="deal"?"#e0f7ff":"#f5f0ff", color:a.type==="deal"?"#006d8f":"#6d3aaa", fontSize:11, padding:"2px 8px", borderRadius:4, fontWeight:700 }}>{a.type?.toUpperCase()}</span>
                <span style={{ color:"#374151", fontSize:13, flex:1 }}>{a.detail}</span>
                <span style={{ color:"#9ca3af", fontSize:12 }}>{a.actor}</span>
              </div>
            ))}
          </div>
        )}

        {/* PROMO CODES */}
        <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", marginBottom:"1.5rem", overflow:"hidden" }}>
          <div onClick={()=>setPromoTab(v=>!v)} style={{ padding:"1rem 1.25rem", borderBottom: promoTab?"1px solid #e5e7eb":"none", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
            <span style={{ color:NAVY, fontSize:15, fontWeight:700 }}>🎟️ Invite / Promo Codes</span>
            <span style={{ color:MUTED, fontSize:13 }}>{promoTab?"▲":"▼"} {promoCodes.length} codes</span>
          </div>
          {promoTab && (
            <div style={{ padding:"1.25rem" }}>
              {/* CREATE FORM */}
              <form onSubmit={createCode} className="ca-promo-form">
                {[["Code","code","e.g. SUMMER90","text"],["Trial Days","trial_days","90","number"],["Max Uses","max_uses","unlimited","number"],["Note (internal)","note","e.g. Reddit launch","text"]].map(([l,k,ph,t])=>(
                  <div key={k}>
                    <label style={{ display:"block", color:"#6b7280", fontSize:11, fontWeight:600, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</label>
                    <input type={t} placeholder={ph} value={newCode[k]} onChange={e=>setNewCode(n=>({...n,[k]:e.target.value}))} style={{ width:"100%", padding:"0.6rem 0.75rem", border:"1px solid #e5e7eb", borderRadius:6, fontSize:13, color:"#111827", fontFamily:"'DM Sans',sans-serif", textTransform:k==="code"?"uppercase":"none" }} required={k==="code"} />
                  </div>
                ))}
                <button type="submit" style={{ background:CYAN, color:NAVY, border:"none", borderRadius:6, padding:"0.6rem 1rem", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>+ Create</button>
              </form>
              {promoMsg && <div style={{ color:promoMsg.startsWith("✓")?"#15803d":"#dc2626", fontSize:13, fontWeight:600, marginBottom:"1rem" }}>{promoMsg}</div>}

              {/* CODES TABLE */}
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Code","Trial","Uses","Max","Note","Status",""].map(h=><th key={h} style={{ color:"#6b7280", fontSize:11, fontWeight:600, textAlign:"left", padding:"0.5rem 0.6rem", borderBottom:"1px solid #f3f4f6", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {promoCodes.map(c=>(
                    <tr key={c.id}>
                      <td style={{ padding:"0.6rem", fontWeight:800, fontSize:14, color:NAVY, fontFamily:"monospace" }}>{c.code}</td>
                      <td style={{ padding:"0.6rem", color:"#374151", fontSize:13 }}>{c.trial_days}d</td>
                      <td style={{ padding:"0.6rem", color:"#374151", fontSize:13 }}>{c.uses_count}</td>
                      <td style={{ padding:"0.6rem", color:"#374151", fontSize:13 }}>{c.max_uses||"∞"}</td>
                      <td style={{ padding:"0.6rem", color:"#6b7280", fontSize:12 }}>{c.note||"—"}</td>
                      <td style={{ padding:"0.6rem" }}><span style={{ background:c.is_active?"#dcfce7":"#fee2e2", color:c.is_active?"#166534":"#dc2626", fontSize:11, padding:"2px 8px", borderRadius:4, fontWeight:700 }}>{c.is_active?"ACTIVE":"OFF"}</span></td>
                      <td style={{ padding:"0.6rem" }}><button onClick={()=>toggleCode(c.id,c.is_active)} style={{ background:"#f3f4f6", color:"#374151", border:"none", borderRadius:4, padding:"3px 10px", fontSize:12, cursor:"pointer" }}>{c.is_active?"Disable":"Enable"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* USERS TABLE */}
        <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
          <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #e5e7eb" }}>
            <span style={{ color:NAVY, fontSize:15, fontWeight:700 }}>Users</span>
          </div>
          {users.length===0
            ? <div style={{ padding:"2rem", color:"#9ca3af", textAlign:"center", fontSize:13 }}>No users yet.</div>
            : users.map(u=>(
              <div key={u.id} style={{ borderBottom:"1px solid #f3f4f6", padding:"1rem 1.25rem", opacity:u.is_banned?0.5:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                  {/* User info */}
                  <div style={{ flex:1, minWidth:160 }}>
                    <div style={{ color:NAVY, fontWeight:700, fontSize:14 }}>{u.name} {u.company_name ? `· ${u.company_name}` : ""}</div>
                    <div style={{ color:"#6b7280", fontSize:12 }}>{u.email} · {u.user_type}</div>
                    <div style={{ marginTop:4, display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ background: u.subscription_status==="active"?"#dcfce7": u.subscription_status==="trial"?"#fef9c3": u.subscription_status==="cancelled"?"#fee2e2":"#f3f4f6", color: u.subscription_status==="active"?"#166534": u.subscription_status==="trial"?"#92400e": u.subscription_status==="cancelled"?"#dc2626":"#6b7280", fontSize:10, padding:"2px 8px", borderRadius:4, fontWeight:700 }}>
                        {(u.subscription_status||"inactive").toUpperCase()}
                      </span>
                      {u.scheduled_activation_date && (
                        <span style={{ color:"#6b7280", fontSize:11 }}>⏰ Activates {new Date(u.scheduled_activation_date).toLocaleDateString()}</span>
                      )}
                      {u.trial_ends_at && u.subscription_status==="trial" && (
                        <span style={{ color:"#92400e", fontSize:11 }}>Trial ends {new Date(u.trial_ends_at).toLocaleDateString()}</span>
                      )}
                      <span style={{ color:"#d1d5db", fontSize:11 }}>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Subscription controls — cleaners only */}
                  {u.user_type === "cleaner" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {u.subscription_status !== "active" && (
                          <button onClick={()=>controlSub(u.id,"activate_now")} style={{ background:"#dcfce7", color:"#166534", border:"1px solid #bbf7d0", borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                            ⚡ Activate Now
                          </button>
                        )}
                        {u.subscription_status !== "cancelled" && (
                          <button onClick={()=>controlSub(u.id,"cancel")} style={{ background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                            ✕ Cancel Sub
                          </button>
                        )}
                        <button onClick={()=>toggleBan(u.id,u.is_banned)} style={{ background:u.is_banned?"#f3f4f6":"#fff7ed", color:u.is_banned?"#374151":"#9a3412", border:`1px solid ${u.is_banned?"#e5e7eb":"#fed7aa"}`, borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                          {u.is_banned?"Unban":"Ban"}
                        </button>
                      </div>

                      {/* Schedule activation */}
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <input
                          type="date"
                          value={subAction[u.id]?.date||""}
                          onChange={e=>setSubAction(m=>({...m,[u.id]:{...m[u.id],date:e.target.value}}))}
                          style={{ fontSize:11, padding:"3px 6px", border:"1px solid #e5e7eb", borderRadius:4, color:"#374151", fontFamily:"'DM Sans',sans-serif" }}
                        />
                        <button onClick={()=>controlSub(u.id,"schedule")} style={{ background:"#f0f9ff", color:"#0369a1", border:"1px solid #bae6fd", borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                          Schedule →
                        </button>
                      </div>
                      {subMsg[u.id] && <div style={{ fontSize:11, color:subMsg[u.id].startsWith("✓")?"#166534":"#dc2626", fontWeight:600 }}>{subMsg[u.id]}</div>}
                    </div>
                  )}

                  {/* Buyers: just ban control */}
                  {u.user_type !== "cleaner" && u.user_type !== "admin" && (
                    <button onClick={()=>toggleBan(u.id,u.is_banned)} style={{ background:u.is_banned?"#f3f4f6":"#fff7ed", color:u.is_banned?"#374151":"#9a3412", border:`1px solid ${u.is_banned?"#e5e7eb":"#fed7aa"}`, borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer", alignSelf:"flex-start" }}>
                      {u.is_banned?"Unban":"Ban"}
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
