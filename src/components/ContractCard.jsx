const CSS_CARD = `
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(0,212,255,.5)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}100%{box-shadow:0 0 0 0 rgba(0,212,255,0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;

export default function ContractCard({ contract, isNew }) {
  // Support both seed card fields and DB fields
  const title = contract.business_name || contract.title || "Untitled";
  const type = contract.facility_type || contract.category || "General";
  const sqft = contract.sqft || contract.sq_footage;
  const length = contract.contract_length || contract.duration_months;
  const notes = contract.notes || contract.description;

  return (
    <div style={{
      background: "#ffffff",
      border: isNew ? "2px solid #00d4ff" : "1px solid #dde6f0",
      borderRadius: 16,
      padding: "1.5rem",
      boxShadow: isNew ? "0 4px 24px rgba(0,212,255,.18)" : "0 2px 12px rgba(10,22,40,0.08)",
      animation: "fadeUp .35s ease",
      position: "relative",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <style>{CSS_CARD}</style>

      {/* SAMPLE badge */}
      {contract.isSeed && (
        <div style={{ position:"absolute", top:14, right:14, background:"rgba(124,58,237,0.1)", color:"#7c3aed", fontSize:10, padding:"3px 10px", borderRadius:10, fontWeight:800, border:"1px solid rgba(124,58,237,0.25)", letterSpacing:"0.05em" }}>SAMPLE</div>
      )}

      {isNew && (
        <div style={{ color:"#00d4ff", fontSize:11, fontWeight:800, marginBottom:6, letterSpacing:"0.05em" }}>🔵 NEW CONTRACT</div>
      )}

      {/* Title */}
      <div style={{ color:"#0a1628", fontWeight:800, fontSize:17, marginBottom:"0.75rem", lineHeight:1.3, paddingRight: contract.isSeed ? 64 : 0 }}>
        {title}
      </div>

      {/* Tags */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"0.85rem" }}>
        <span style={{ background:"#e0f7ff", color:"#006d8f", fontSize:12, padding:"4px 12px", borderRadius:20, fontWeight:600 }}>{type}</span>
        <span style={{ background:"#f0f4ff", color:"#3b4e7a", fontSize:12, padding:"4px 12px", borderRadius:20, fontWeight:600 }}>📍 {contract.location}</span>
        {contract.frequency && <span style={{ background:"#f5f0ff", color:"#6d3aaa", fontSize:12, padding:"4px 12px", borderRadius:20, fontWeight:600 }}>{contract.frequency}</span>}
        {sqft && <span style={{ background:"#f0fdf4", color:"#166534", fontSize:12, padding:"4px 12px", borderRadius:20, fontWeight:600 }}>{sqft}</span>}
        {length && <span style={{ background:"#fffbeb", color:"#92400e", fontSize:12, padding:"4px 12px", borderRadius:20, fontWeight:600 }}>📅 {length}</span>}
      </div>

      {/* Notes */}
      {notes && (
        <p style={{ color:"#4a5568", fontSize:14, lineHeight:1.65, marginBottom:"1rem", borderLeft:"3px solid #e2e8f0", paddingLeft:"0.75rem" }}>
          {notes}
        </p>
      )}

      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, borderTop:"1px solid #f0f4f8", paddingTop:"1rem" }}>
        <div>
          <div style={{ color:"#0a1628", fontSize:12, fontWeight:600, marginBottom:2, opacity:0.5 }}>BUDGET</div>
          <div style={{ color:"#007a4d", fontWeight:800, fontSize:20 }}>{contract.budget || "TBD"}</div>
        </div>
      </div>
    </div>
  );
}
