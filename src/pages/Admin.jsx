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
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sr,ur,ar] = await Promise.all([authFetch("/api/admin/stats"),authFetch("/api/admin/users"),authFetch("/api/admin/recent")]);
        const [s,u,a] = await Promise.all([sr.json(),ur.json(),ar.json()]);
        if (s.error) setError(`Stats: ${s.error}`); else setStats(s);
        if (Array.isArray(u)) setUsers(u); else setError(`Users: ${u?.error || 'Failed to load'}`);
        if (Array.isArray(a)) setActivity(a); else setError(`Activity: ${a?.error || 'Failed to load'}`);
      } catch(e) { setError(e.message); }
    };
    load();
  }, []);

  const toggleBan = async (id, banned) => {
    await authFetch(`/api/admin/users/${id}/ban`, { method:"POST", body:JSON.stringify({is_banned:!banned}) });
    setUsers(u => u.map(x => x.id===id ? {...x, is_banned:!banned} : x));
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
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>nav("/cleaner")} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"5px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cleaner View</button>
          <button onClick={()=>nav("/buyer")} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"5px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Buyer View</button>
          <button onClick={()=>{logout();nav("/");}} style={{ background:"transparent", color:MUTED, border:`1px solid ${BORDER}`, padding:"5px 12px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ padding:"1.5rem" }}>
        {error && <div style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"0.75rem 1rem", color:"#be123c", fontSize:13, marginBottom:"1rem" }}>⚠️ {error}</div>}

        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:"1.5rem" }}>
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

        <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
          <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #e5e7eb" }}>
            <span style={{ color:NAVY, fontSize:15, fontWeight:700 }}>Users</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Name","Email","Type","Company","Sub Status","Joined",""].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.length===0
                  ? <tr><td colSpan={7} style={{ ...td, color:"#9ca3af", textAlign:"center", padding:"2rem" }}>No users yet.</td></tr>
                  : users.map(u=>(
                    <tr key={u.id} style={{ opacity:u.is_banned?0.5:1 }}>
                      <td style={td}>{u.name}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>{u.user_type}</td>
                      <td style={td}>{u.company_name||"—"}</td>
                      <td style={td}>{u.subscription_status||"—"}</td>
                      <td style={td}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={td}><button onClick={()=>toggleBan(u.id,u.is_banned)} style={{ background:u.is_banned?"#dcfce7":"#fee2e2", color:u.is_banned?"#166534":"#dc2626", border:"none", borderRadius:4, padding:"4px 10px", fontSize:12, cursor:"pointer", fontWeight:600 }}>{u.is_banned?"Unban":"Ban"}</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
