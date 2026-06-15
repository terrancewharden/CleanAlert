import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const S = {
  page: { minHeight: "100vh", background: "#0a1628", fontFamily: "system-ui,sans-serif", padding: "1.5rem" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  logo: { color: "#00d4ff", fontSize: 22, fontWeight: 800 },
  badge: { background: "#7c3aed", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: "2rem" },
  stat: { background: "#0f2044", border: "1px solid #1e3a6e", borderRadius: 14, padding: "1.25rem" },
  statVal: { color: "#00d4ff", fontSize: 32, fontWeight: 800 },
  statLabel: { color: "#6b8cba", fontSize: 13, marginTop: 4 },
  section: { background: "#0f2044", border: "1px solid #1e3a6e", borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem" },
  sectionTitle: { color: "#e8f4ff", fontSize: 16, fontWeight: 700, marginBottom: "1rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { color: "#6b8cba", fontSize: 12, textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #1e3a6e" },
  td: { color: "#a0b4cc", fontSize: 13, padding: "0.6rem 0.5rem", borderBottom: "1px solid #0a1628" },
  banBtn: (banned) => ({ background: banned ? "#16803c" : "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer" }),
  logoutBtn: { background: "transparent", color: "#6b8cba", border: "1px solid #1e3a6e", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 },
  actRow: { display: "flex", gap: 12, alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #0a1628" },
  actType: (t) => ({ background: t === "deal" ? "rgba(0,212,255,0.12)" : "rgba(124,58,237,0.12)", color: t === "deal" ? "#00d4ff" : "#a78bfa", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }),
  actText: { color: "#a0b4cc", fontSize: 13, flex: 1 },
  actActor: { color: "#6b8cba", fontSize: 12 },
};

export default function Admin() {
  const { authFetch, logout } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([
      authFetch("/api/admin/stats").then(r => r.json()),
      authFetch("/api/admin/users").then(r => r.json()),
      authFetch("/api/admin/recent").then(r => r.json()),
    ]).then(([s, u, a]) => { setStats(s); setUsers(u); setActivity(a); });
  }, []);

  const toggleBan = async (id, banned) => {
    await authFetch(`/api/admin/users/${id}/ban`, { method: "POST", body: JSON.stringify({ is_banned: !banned }) });
    setUsers(u => u.map(x => x.id === id ? { ...x, is_banned: !banned } : x));
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={S.logo}>CleanAlert</span>
          <span style={S.badge}>ADMIN</span>
        </div>
        <button style={S.logoutBtn} onClick={() => { logout(); nav("/login"); }}>Sign out</button>
      </div>

      {stats && (
        <div style={S.grid}>
          {[
            ["Active Subscribers", stats.activeSubscribers, "🧹"],
            ["MRR", `$${stats.mrr}`, "💰"],
            ["Total Contracts", stats.totalContracts, "📋"],
            ["Total Deals", stats.totalDeals, "🤝"],
          ].map(([label, val, icon]) => (
            <div key={label} style={S.stat}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
              <div style={S.statVal}>{val}</div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
          {stats.usersByType?.map(row => (
            <div key={row.user_type} style={S.stat}>
              <div style={S.statVal}>{row.count}</div>
              <div style={S.statLabel}>{row.user_type}s</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.section}>
        <div style={S.sectionTitle}>Recent Activity</div>
        {activity.map((a, i) => (
          <div key={i} style={S.actRow}>
            <span style={S.actType(a.type)}>{a.type.toUpperCase()}</span>
            <span style={S.actText}>{a.detail}</span>
            <span style={S.actActor}>{a.actor}</span>
          </div>
        ))}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Users</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Name", "Email", "Type", "Company", "Sub Status", "Joined", ""].map(h => <th key={h} style={S.th}>{h}</th>)}
              </tr>
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
      </div>
    </div>
  );
}
