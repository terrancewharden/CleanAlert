import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const CYAN="#00d4ff",NAVY="#0a1628",SURFACE="#0f2044",BORDER="#1e3a6e",GREEN="#00e096",GOLD="#ffd700",MUTED="#6b8cba",TEXT="#e8f4ff";

const S = {
  page:{minHeight:"100vh",background:NAVY,fontFamily:"system-ui,sans-serif",color:TEXT},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.25rem 1.5rem",background:SURFACE,borderBottom:`1px solid ${BORDER}`},
  logo:{color:CYAN,fontWeight:800,fontSize:20},
  badge:{background:"#7c3aed",color:"#fff",fontSize:11,padding:"2px 8px",borderRadius:20,fontWeight:700,marginLeft:8},
  body:{padding:"1.5rem"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:"2rem"},
  stat:{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"1.25rem"},
  statVal:{color:CYAN,fontSize:32,fontWeight:800},
  statLabel:{color:MUTED,fontSize:13,marginTop:4},
  section:{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"1.25rem",marginBottom:"1.5rem"},
  sectionTitle:{color:TEXT,fontSize:16,fontWeight:700,marginBottom:"1rem"},
  table:{width:"100%",borderCollapse:"collapse"},
  th:{color:MUTED,fontSize:12,textAlign:"left",padding:"0.5rem",borderBottom:`1px solid ${BORDER}`},
  td:{color:"#a0b4cc",fontSize:13,padding:"0.6rem 0.5rem",borderBottom:`1px solid ${NAVY}`},
  banBtn:(banned)=>({background:banned?"#16803c":"#dc2626",color:"#fff",border:"none",borderRadius:6,padding:"3px 10px",fontSize:12,cursor:"pointer"}),
  logoutBtn:{background:"transparent",color:MUTED,border:`1px solid ${BORDER}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13},
  actRow:{display:"flex",gap:12,alignItems:"center",padding:"0.6rem 0",borderBottom:`1px solid ${NAVY}`},
  actType:(t)=>({background:t==="deal"?"rgba(0,212,255,0.12)":"rgba(124,58,237,0.12)",color:t==="deal"?CYAN:"#a78bfa",fontSize:11,padding:"2px 8px",borderRadius:10,fontWeight:700}),
  actText:{color:"#a0b4cc",fontSize:13,flex:1},
  actActor:{color:MUTED,fontSize:12},
  err:{background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:10,padding:"1rem",color:"#ff6b6b",fontSize:14,marginBottom:"1rem"},
};

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
        const [sr, ur, ar] = await Promise.all([
          authFetch("/api/admin/stats"),
          authFetch("/api/admin/users"),
          authFetch("/api/admin/recent"),
        ]);

        const [s, u, a] = await Promise.all([sr.json(), ur.json(), ar.json()]);

        if (s.error) { setError(`Stats: ${s.error}`); } else { setStats(s); }
        if (Array.isArray(u)) setUsers(u); else setError(`Users: ${u.error}`);
        if (Array.isArray(a)) setActivity(a); else setError(`Activity: ${a.error}`);
      } catch (e) {
        setError(`Failed to load: ${e.message}`);
      }
    };
    load();
  }, []);

  const toggleBan = async (id, banned) => {
    await authFetch(`/api/admin/users/${id}/ban`, { method:"POST", body:JSON.stringify({ is_banned: !banned }) });
    setUsers(u => u.map(x => x.id === id ? { ...x, is_banned: !banned } : x));
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div><span style={S.logo}>CleanAlert</span><span style={S.badge}>ADMIN</span></div>
        <button style={S.logoutBtn} onClick={() => { logout(); nav("/"); }}>Sign out</button>
      </div>

      <div style={S.body}>
        {error && <div style={S.err}>⚠️ {error}</div>}

        {stats ? (
          <div style={S.grid}>
            {[
              ["Active Subscribers", stats.activeSubscribers ?? 0, "🧹"],
              ["MRR", `$${stats.mrr ?? 0}`, "💰"],
              ["Total Contracts", stats.totalContracts ?? 0, "📋"],
              ["Total Deals", stats.totalDeals ?? 0, "🤝"],
            ].map(([label, val, icon]) => (
              <div key={label} style={S.stat}>
                <div style={{ fontSize:24, marginBottom:4 }}>{icon}</div>
                <div style={S.statVal}>{val}</div>
                <div style={S.statLabel}>{label}</div>
              </div>
            ))}
            {Array.isArray(stats.usersByType) && stats.usersByType.map(row => (
              <div key={row.user_type} style={S.stat}>
                <div style={S.statVal}>{row.count}</div>
                <div style={S.statLabel}>{row.user_type}s</div>
              </div>
            ))}
          </div>
        ) : !error && (
          <div style={{ color:MUTED, marginBottom:"2rem" }}>Loading stats…</div>
        )}

        {activity.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Recent Activity</div>
            {activity.map((a, i) => (
              <div key={i} style={S.actRow}>
                <span style={S.actType(a.type)}>{a.type?.toUpperCase()}</span>
                <span style={S.actText}>{a.detail}</span>
                <span style={S.actActor}>{a.actor}</span>
              </div>
            ))}
          </div>
        )}

        <div style={S.section}>
          <div style={S.sectionTitle}>Users</div>
          {users.length === 0 ? (
            <div style={{ color:MUTED, fontSize:14 }}>No users yet.</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>{["Name","Email","Type","Company","Sub Status","Joined",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ opacity: u.is_banned ? 0.5 : 1 }}>
                      <td style={S.td}>{u.name}</td>
                      <td style={S.td}>{u.email}</td>
                      <td style={S.td}>{u.user_type}</td>
                      <td style={S.td}>{u.company_name || "—"}</td>
                      <td style={S.td}>{u.subscription_status || "—"}</td>
                      <td style={S.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={S.td}>
                        <button style={S.banBtn(u.is_banned)} onClick={() => toggleBan(u.id, u.is_banned)}>
                          {u.is_banned ? "Unban" : "Ban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
