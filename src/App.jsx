import { useState, useEffect, useRef } from "react";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const CYAN   = "#00D4FF";
const NAVY   = "#0A1628";
const SURFACE = "#0e2040";
const SURFACE2 = "#0c1b35";
const BORDER = "#1e3a5f";
const GOLD   = "#FFB800";
const GREEN  = "#00E599";
const PURPLE = "#9B6DFF";

// ─── KEYFRAMES (injected once) ────────────────────────────────────────────────
const CSS = `
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(0,212,255,0.65); }
    70%  { box-shadow: 0 0 0 14px rgba(0,212,255,0); }
    100% { box-shadow: 0 0 0 0 rgba(0,212,255,0); }
  }
  @keyframes pulse-gold {
    0%   { box-shadow: 0 0 0 0 rgba(255,184,0,0.55); }
    70%  { box-shadow: 0 0 0 10px rgba(255,184,0,0); }
    100% { box-shadow: 0 0 0 0 rgba(255,184,0,0); }
  }
  @keyframes slide-down {
    from { transform: translateY(-36px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes slide-in-right {
    from { transform: translateX(24px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .alert-banner { animation: slide-down 0.35s ease; }
  .card-enter   { animation: fade-up 0.4s ease; }
  .deal-enter   { animation: slide-in-right 0.45s ease; }
  .pulse-express { animation: pulse-ring 1.4s ease 3; }
  .pulse-deal    { animation: pulse-gold 1.6s ease 2; }

  @media (max-width: 480px) {
    .tab-full  { display: none !important; }
    .tab-short { display: inline !important; }
    .form-row-2 { grid-template-columns: 1fr !important; }
  }
`;

// ─── SEED DATA — Incoming Contracts ───────────────────────────────────────────
const SEED_CARDS = [
  {
    id: "s1", businessName: "Apex Realty Group",
    location: "Chicago, IL", zip: "60601", facilityType: "Office",
    sqft: "12,000", frequency: "Daily", contractLength: "1 year",
    budget: "$1,500–$5,000/mo", startDate: "2026-07-01",
    notes: "Must have janitorial bonding. Day porter preferred.",
    status: "live", responded: false, timestamp: Date.now() - 1000 * 60 * 18,
  },
  {
    id: "s2", businessName: "Crestview Medical Plaza",
    location: "Atlanta, GA", zip: "30301", facilityType: "Medical",
    sqft: "6,400", frequency: "Daily", contractLength: "6 months",
    budget: "$1,500–$5,000/mo", startDate: "2026-07-15",
    notes: "HIPAA-compliant cleaning required. Bio-hazard cert a plus.",
    status: "live", responded: false, timestamp: Date.now() - 1000 * 60 * 45,
  },
  {
    id: "s3", businessName: "Northgate Logistics Hub",
    location: "Columbus, OH", zip: "43201", facilityType: "Warehouse",
    sqft: "40,000", frequency: "Weekly", contractLength: "Ongoing",
    budget: "$5,000+/mo", startDate: "2026-08-01",
    notes: "High-ceiling floor scrubbing and dock area deep clean monthly.",
    status: "live", responded: false, timestamp: Date.now() - 1000 * 60 * 90,
  },
];

// ─── SEED DATA — Claimed Deals ────────────────────────────────────────────────
const SEED_DEALS = [
  {
    id: "d1", businessName: "Brightline Realty",
    location: "Denver, CO", facilityType: "Office",
    budget: "$2,100/mo", contractLength: "1 year",
    cleaner: "PinnaclePro Cleaning", timestamp: Date.now() - 1000 * 60 * 8,
    emoji: "🏢",
  },
  {
    id: "d2", businessName: "NextGen Medical Suites",
    location: "Phoenix, AZ", facilityType: "Medical",
    budget: "$3,800/mo", contractLength: "6 months",
    cleaner: "CleanEdge Services", timestamp: Date.now() - 1000 * 60 * 31,
    emoji: "🏥",
  },
  {
    id: "d3", businessName: "Urban Storage Co.",
    location: "Miami, FL", facilityType: "Warehouse",
    budget: "$5,400/mo", contractLength: "Ongoing",
    cleaner: "MetroShine Janitorial", timestamp: Date.now() - 1000 * 60 * 55,
    emoji: "🏭",
  },
  {
    id: "d4", businessName: "Lakeside Academy",
    location: "Nashville, TN", facilityType: "School",
    budget: "$1,200/mo", contractLength: "1 year",
    cleaner: "BrightStart Cleaning", timestamp: Date.now() - 1000 * 60 * 102,
    emoji: "🏫",
  },
  {
    id: "d5", businessName: "Harbor Square Retail",
    location: "Seattle, WA", facilityType: "Retail",
    budget: "$900/mo", contractLength: "3 months",
    cleaner: "NorthStar Custodial", timestamp: Date.now() - 1000 * 60 * 140,
    emoji: "🏪",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Tag({ label, color = CYAN, bg }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      background: bg || `${color}18`,
      color, border: `1px solid ${color}40`,
    }}>{label}</span>
  );
}

// ─── CLAIMED DEAL CARD ────────────────────────────────────────────────────────
function DealBadge({ deal, isNew }) {
  return (
    <div
      className={isNew ? "deal-enter pulse-deal" : "deal-enter"}
      style={{
        background: `linear-gradient(135deg, ${SURFACE} 0%, #0f2545 100%)`,
        border: `1px solid ${GOLD}50`,
        borderRadius: 10,
        padding: "13px 14px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold shimmer line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        backgroundSize: "200% auto",
        animation: isNew ? "shimmer 1.8s linear 3" : "none",
      }} />

      {/* Trophy row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          fontSize: 22, lineHeight: 1, flexShrink: 0,
          width: 38, height: 38,
          background: `${GOLD}15`,
          border: `1px solid ${GOLD}35`,
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {deal.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 800,
            color: "#fff", lineHeight: 1.3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {deal.businessName}
          </div>
          <div style={{ fontSize: 11, color: "#6a8aaa", marginTop: 2 }}>
            {deal.location} · {deal.facilityType}
          </div>
        </div>

        <Tag label="DEAL ✓" color={GOLD} />
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap",
      }}>
        <div style={{
          flex: 1, background: `${GREEN}10`, border: `1px solid ${GREEN}30`,
          borderRadius: 6, padding: "5px 8px", textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>{deal.budget}</div>
          <div style={{ fontSize: 9, color: "#5a7a9a", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>Value</div>
        </div>
        <div style={{
          flex: 1, background: `${PURPLE}10`, border: `1px solid ${PURPLE}30`,
          borderRadius: 6, padding: "5px 8px", textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PURPLE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{deal.contractLength}</div>
          <div style={{ fontSize: 9, color: "#5a7a9a", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>Length</div>
        </div>
      </div>

      {/* Cleaner attribution */}
      <div style={{
        marginTop: 9, paddingTop: 9, borderTop: `1px solid ${BORDER}`,
        fontSize: 10, color: "#5a7a9a",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>🤝 <span style={{ color: "#8aafcc" }}>{deal.cleaner}</span></span>
        <span>{timeAgo(deal.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── CLAIMED DEALS SIDEBAR ─────────────────────────────────────────────────────
function DealsSidebar({ deals, isMobile }) {
  return (
    <div style={{
      width: "100%",
      display: "flex", flexDirection: "column", gap: 0,
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: isMobile ? 108 : 60, zIndex: 10,
        background: SURFACE2,
        padding: "16px 16px 12px",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>🏆</span>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em" }}>Deals Closed</span>
          <span style={{
            marginLeft: "auto",
            background: `${GOLD}18`, border: `1px solid ${GOLD}40`,
            color: GOLD, borderRadius: 20, padding: "1px 8px",
            fontSize: 10, fontWeight: 800,
          }}>{deals.length}</span>
        </div>
        <div style={{ fontSize: 11, color: "#5a7a9a", lineHeight: 1.4 }}>
          Real contracts. Real wins. These cleaners moved fast — and got paid.
        </div>
      </div>

      {/* Scrollable deal list */}
      <div style={{
        padding: "12px",
        display: "flex", flexDirection: "column", gap: 10,
        overflowY: "auto",
        maxHeight: isMobile ? "none" : "calc(100vh - 160px)",
      }}>
        {[...deals].reverse().map((deal, i) => (
          <DealBadge key={deal.id} deal={deal} isNew={i === 0 && deal.isNew} />
        ))}

        {/* CTA bottom */}
        <div style={{
          marginTop: 8,
          background: `${CYAN}08`,
          border: `1px dashed ${CYAN}40`,
          borderRadius: 10, padding: "14px 12px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: CYAN, marginBottom: 4 }}>
            Your deal could be here.
          </div>
          <div style={{ fontSize: 11, color: "#5a7a9a", lineHeight: 1.5 }}>
            Express interest on a live contract and lock in your next client.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONTRACT CARD ────────────────────────────────────────────────────────────
function ContractCard({ card, onExpressInterest, onSkip }) {
  const [skipped, setSkipped] = useState(false);
  if (skipped) return null;

  return (
    <div className="card-enter" style={{
      background: "#fff", borderRadius: 12, padding: "18px 20px",
      color: NAVY, border: card.isNew ? `2px solid ${CYAN}` : "2px solid transparent",
      transition: "border 0.5s ease",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{card.businessName}</div>
          <div style={{ fontSize: 12, color: "#6a7a8a", fontWeight: 500 }}>{card.location} · {card.zip}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Tag label={card.facilityType} />
          {card.isNew && <Tag label="NEW" color="#ff4d6d" />}
        </div>
      </div>

      {/* Details */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: "10px 16px", padding: "12px 0",
        borderTop: "1px solid #e8edf3", borderBottom: "1px solid #e8edf3",
      }}>
        {[
          ["Sq Footage", card.sqft + " sqft"],
          ["Frequency",  card.frequency],
          ["Contract",   card.contractLength],
          ["Budget",     card.budget],
          ["Start",      new Date(card.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#8899aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{v}</div>
          </div>
        ))}
      </div>

      {card.notes && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#4a5a6a", lineHeight: 1.55 }}>
          <span style={{ fontWeight: 700 }}>Notes: </span>{card.notes}
        </div>
      )}

      <div style={{ fontSize: 10, color: "#aab8c8", marginTop: 8 }}>{timeAgo(card.timestamp)}</div>

      {/* Actions */}
      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        {card.responded ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            background: `${CYAN}15`, border: `1px solid ${CYAN}`,
            borderRadius: 8, padding: "7px 14px",
            fontSize: 12, fontWeight: 800, color: CYAN,
          }}>✓ Response Sent</div>
        ) : (
          <>
            <button
              className={card.isNew ? "pulse-express" : ""}
              onClick={() => onExpressInterest(card)}
              style={{
                background: CYAN, color: NAVY, border: "none",
                borderRadius: 8, padding: "9px 18px",
                fontSize: 12, fontWeight: 800, cursor: "pointer",
              }}>
              Express Interest
            </button>
            <button
              onClick={() => { onSkip(card.id); setSkipped(true); }}
              style={{
                background: "transparent", color: "#8899aa",
                border: "1px solid #c8d4e0", borderRadius: 8,
                padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── RESPONSE MODAL ───────────────────────────────────────────────────────────
function ResponseModal({ card, onClose, onSubmit }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!msg.trim()) return;
    setSent(true);
    setTimeout(() => { onSubmit(card.id, msg); onClose(); }, 1100);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(10,22,40,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: SURFACE, borderRadius: 16, padding: 28,
        width: "100%", maxWidth: 480, border: `1px solid ${BORDER}`,
        animation: "fade-up 0.3s ease",
      }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>✓</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: CYAN }}>Response Sent!</div>
            <div style={{ fontSize: 13, color: "#8899aa", marginTop: 5 }}>
              The buyer will see your message and reach out if interested.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 3 }}>Express Interest</div>
            <div style={{ fontSize: 12, color: "#6a8aaa", marginBottom: 18 }}>
              {card.businessName} · {card.facilityType} · {card.location}
            </div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6a8aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Message
            </label>
            <textarea
              autoFocus value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Introduce your company, your relevant experience, and why you're the right fit..."
              rows={5}
              style={{
                width: "100%", marginTop: 7, padding: "11px 13px",
                background: NAVY, border: `1px solid ${BORDER}`,
                borderRadius: 8, color: "#fff", fontSize: 13,
                resize: "vertical", outline: "none",
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.55,
              }}
            />
            {/* Opt-in checkbox */}
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 9,
              marginTop: 12, cursor: "pointer", fontSize: 12, color: "#7a9aaa", lineHeight: 1.4,
            }}>
              <input type="checkbox" defaultChecked style={{ marginTop: 2, accentColor: CYAN }} />
              If we make a deal, share it publicly as a success badge to inspire other cleaners.
            </label>
            <div style={{ display: "flex", gap: 9, marginTop: 18, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{
                background: "transparent", color: "#8899aa",
                border: `1px solid ${BORDER}`, borderRadius: 8,
                padding: "9px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!msg.trim()} style={{
                background: msg.trim() ? CYAN : BORDER,
                color: msg.trim() ? NAVY : "#3a5a7f",
                border: "none", borderRadius: 8,
                padding: "9px 22px", fontSize: 12, fontWeight: 800,
                cursor: msg.trim() ? "pointer" : "default", transition: "all 0.2s",
              }}>Send Response</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── BUYER FORM ───────────────────────────────────────────────────────────────
function BuyerView({ onPost }) {
  const empty = {
    businessName: "", location: "", zip: "", facilityType: "",
    sqft: "", frequency: "", contractLength: "", budget: "", startDate: "", notes: "",
  };
  const [form, setForm]   = useState(empty);
  const [done, setDone]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = Object.entries(form).every(([k, v]) => k === "notes" || v.trim() !== "");

  function handleSubmit(e) {
    e.preventDefault();
    onPost({ ...form, id: `p${Date.now()}`, status: "live", responded: false, isNew: true, timestamp: Date.now() });
    setDone(true);
    setTimeout(() => { setForm(empty); setDone(false); }, 4000);
  }

  const inp = {
    width: "100%", padding: "10px 13px",
    background: NAVY, border: `1px solid ${BORDER}`,
    borderRadius: 8, color: "#fff", fontSize: 13,
    outline: "none", fontFamily: "'DM Sans', sans-serif",
    appearance: "none", WebkitAppearance: "none",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#6a8aaa", textTransform: "uppercase",
    letterSpacing: "0.05em", marginBottom: 6,
  };

  const Row2 = ({ children }) => (
    <div className="form-row-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>
  );

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Post a Contract Need</div>
        <div style={{ color: "#6a8aaa", marginTop: 5, fontSize: 13 }}>
          Cleaning companies in your area get alerted the moment you submit.
        </div>
      </div>

      {done && (
        <div style={{
          background: `${CYAN}0e`, border: `1px solid ${CYAN}`,
          borderRadius: 10, padding: "14px 18px", marginBottom: 22,
          color: CYAN, fontWeight: 700, fontSize: 13, animation: "fade-up 0.3s ease",
        }}>
          ✓ Contract posted — cleaning companies are being alerted now.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Row2>
          <div><label style={lbl}>Business Name</label><input style={inp} placeholder="e.g. Apex Realty" value={form.businessName} onChange={e => set("businessName", e.target.value)} required /></div>
          <div><label style={lbl}>City</label><input style={inp} placeholder="e.g. Chicago, IL" value={form.location} onChange={e => set("location", e.target.value)} required /></div>
        </Row2>
        <Row2>
          <div><label style={lbl}>ZIP Code</label><input style={inp} placeholder="60601" value={form.zip} onChange={e => set("zip", e.target.value)} required /></div>
          <div>
            <label style={lbl}>Facility Type</label>
            <select style={inp} value={form.facilityType} onChange={e => set("facilityType", e.target.value)} required>
              <option value="">Select...</option>
              {["Office","Medical","School","Warehouse","Retail","Other"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </Row2>
        <Row2>
          <div><label style={lbl}>Square Footage</label><input style={inp} placeholder="e.g. 12,000" value={form.sqft} onChange={e => set("sqft", e.target.value)} required /></div>
          <div>
            <label style={lbl}>Cleaning Frequency</label>
            <select style={inp} value={form.frequency} onChange={e => set("frequency", e.target.value)} required>
              <option value="">Select...</option>
              {["Daily","Weekly","Bi-weekly","Monthly","One-time"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </Row2>
        <Row2>
          <div>
            <label style={lbl}>Contract Length</label>
            <select style={inp} value={form.contractLength} onChange={e => set("contractLength", e.target.value)} required>
              <option value="">Select...</option>
              {["30 days","3 months","6 months","1 year","Ongoing"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Budget Range</label>
            <select style={inp} value={form.budget} onChange={e => set("budget", e.target.value)} required>
              <option value="">Select...</option>
              {["Under $500/mo","$500–$1,500/mo","$1,500–$5,000/mo","$5,000+/mo"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </Row2>
        <div>
          <label style={lbl}>Desired Start Date</label>
          <input type="date" style={inp} value={form.startDate} onChange={e => set("startDate", e.target.value)} required />
        </div>
        <div>
          <label style={lbl}>Notes <span style={{ color: "#3a5a6a", textTransform: "none", fontWeight: 400 }}>(optional)</span></label>
          <textarea rows={3} style={{ ...inp, resize: "vertical" }}
            placeholder="Special requirements, certifications needed, access instructions..."
            value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
        <button type="submit" disabled={!valid} style={{
          background: valid ? CYAN : BORDER, color: valid ? NAVY : "#3a5a7f",
          border: "none", borderRadius: 10, padding: "13px 0",
          fontSize: 14, fontWeight: 800, cursor: valid ? "pointer" : "default",
          letterSpacing: "0.02em", transition: "all 0.2s",
        }}>
          Post Contract Need
        </button>
      </form>
    </div>
  );
}

// ─── CLEANER DASHBOARD ────────────────────────────────────────────────────────
function CleanerView({ cards, deals, onExpressInterest, onSkip }) {
  const [modal,     setModal]     = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [dealTab,   setDealTab]   = useState(false); // mobile toggle
  const prevLen = useRef(cards.length);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (cards.length > prevLen.current) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3500);
    }
    prevLen.current = cards.length;
  }, [cards.length]);

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "calc(100vh - 60px)" }}>

      {/* ── MOBILE TAB BAR ───────────────────────────────────────────────── */}
      {isMobile && (
        <div style={{
          display: "flex", background: SURFACE2,
          borderBottom: `1px solid ${BORDER}`,
          position: "sticky", top: 60, zIndex: 50,
        }}>
          {[
            { key: false, label: `Contracts (${cards.length})` },
            { key: true,  label: `🏆 Deals (${deals.length})` },
          ].map(t => (
            <button key={String(t.key)} onClick={() => setDealTab(t.key)} style={{
              flex: 1, padding: "12px 8px", border: "none",
              background: dealTab === t.key ? `${CYAN}15` : "transparent",
              borderBottom: dealTab === t.key ? `2px solid ${CYAN}` : "2px solid transparent",
              color: dealTab === t.key ? CYAN : "#6a8aaa",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {/* ── LEFT / MAIN: Feed ────────────────────────────────────────────── */}
      {(!isMobile || !dealTab) && (
        <div style={{ flex: 1, minWidth: 0, padding: isMobile ? "20px 16px" : "28px 20px" }}>
          {showAlert && (
            <div className="alert-banner" style={{
              background: `${CYAN}12`, border: `1px solid ${CYAN}`,
              borderRadius: 10, padding: "11px 16px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 10,
              color: CYAN, fontWeight: 700, fontSize: 13,
            }}>
              <span style={{
                width: 9, height: 9, borderRadius: "50%", background: CYAN,
                flexShrink: 0, animation: "pulse-ring 1s ease 3", display: "inline-block",
              }} />
              New contract posted in your area — be the first to respond.
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Incoming Alerts</div>
              <div style={{ color: "#6a8aaa", fontSize: 13, marginTop: 3 }}>
                {cards.length} active contract{cards.length !== 1 ? "s" : ""} near you
              </div>
            </div>
            <div style={{
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "5px 12px",
              fontSize: 10, fontWeight: 700, color: "#6a8aaa",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>Live Feed</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cards.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#2a4a6f", fontSize: 13 }}>
                No active contracts right now. Check back shortly.
              </div>
            )}
            {[...cards].reverse().map(c => (
              <ContractCard key={c.id} card={c}
                onExpressInterest={card => setModal(card)}
                onSkip={onSkip}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── DIVIDER (desktop only) ───────────────────────────────────────── */}
      {!isMobile && <div style={{ width: 1, background: BORDER, flexShrink: 0 }} />}

      {/* ── RIGHT / DEALS: Sidebar ───────────────────────────────────────── */}
      {(!isMobile || dealTab) && (
        <div style={{
          width: isMobile ? "100%" : 280,
          flexShrink: 0,
          background: SURFACE2,
          display: "flex", flexDirection: "column",
        }}>
          <DealsSidebar deals={deals} isMobile={isMobile} />
        </div>
      )}

      {modal && (
        <ResponseModal
          card={modal}
          onClose={() => setModal(null)}
          onSubmit={(id) => { onExpressInterest(id); setModal(null); }}
        />
      )}
    </div>
  );
}

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [breakpoint]);
  return isMobile;
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const FACILITY_EMOJI = { Office:"🏢", Medical:"🏥", School:"🏫", Warehouse:"🏭", Retail:"🏪", Other:"🏗️" };
const MOCK_CLEANERS  = ["ProShine Services","EverClean Co.","SwiftMop Inc.","EliteSanitize","ClearPath Janitorial"];

export default function App() {
  const [tab,   setTab]   = useState("post");
  const [feed,  setFeed]  = useState(SEED_CARDS);
  const [deals, setDeals] = useState(SEED_DEALS);

  function handlePost(card) {
    setFeed(prev => [...prev, card]);
    setTimeout(() => setTab("cleaner"), 350);
  }

  function handleExpressInterest(id) {
    setFeed(prev => prev.map(c => c.id === id ? { ...c, responded: true } : c));

    // Simulate deal appearing in sidebar ~4s later (as if buyer accepted)
    const card = feed.find(c => c.id === id);
    if (card) {
      setTimeout(() => {
        const budgetMap = {
          "Under $500/mo": "$420/mo",
          "$500–$1,500/mo": "$980/mo",
          "$1,500–$5,000/mo": "$2,600/mo",
          "$5,000+/mo": "$6,200/mo",
        };
        setDeals(prev => [...prev, {
          id: `deal-${id}`,
          businessName: card.businessName,
          location: card.location,
          facilityType: card.facilityType,
          budget: budgetMap[card.budget] || card.budget,
          contractLength: card.contractLength,
          cleaner: MOCK_CLEANERS[Math.floor(Math.random() * MOCK_CLEANERS.length)],
          emoji: FACILITY_EMOJI[card.facilityType] || "🏗️",
          timestamp: Date.now(),
          isNew: true,
        }]);
      }, 4000);
    }
  }

  function handleSkip(id) {
    setFeed(prev => prev.filter(c => c.id !== id));
  }

  // Clear isNew flags
  useEffect(() => {
    if (!feed.some(c => c.isNew) && !deals.some(d => d.isNew)) return;
    const t = setTimeout(() => {
      setFeed(prev => prev.map(c => ({ ...c, isNew: false })));
      setDeals(prev => prev.map(d => ({ ...d, isNew: false })));
    }, 5500);
    return () => clearTimeout(t);
  }, [feed, deals]);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: NAVY }}>

        {/* ── TOP NAV ─────────────────────────────────────────────────── */}
        <nav style={{
          background: SURFACE, borderBottom: `1px solid ${BORDER}`,
          position: "sticky", top: 0, zIndex: 100, height: 60,
        }}>
          <div style={{
            maxWidth: "100%", padding: "0 24px",
            height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, background: CYAN,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#0A1628" strokeWidth="2.5"/>
                  <path d="M8 4v4l3 2" stroke="#0A1628" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>
                Clean<span style={{ color: CYAN }}>Alert</span>
              </span>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 3, background: NAVY, borderRadius: 9, padding: 3 }}>
              {[
                { key: "post",    label: "Post a Contract", short: "Post" },
                { key: "cleaner", label: "Cleaner Dashboard", short: "Dashboard" },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  background: tab === t.key ? CYAN : "transparent",
                  color: tab === t.key ? NAVY : "#6a8aaa",
                  border: "none", borderRadius: 6,
                  padding: "7px 10px", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
                }}>
                  <span className="tab-full">{t.label}</span>
                  <span className="tab-short" style={{ display: "none" }}>{t.short}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* ── VIEWS ────────────────────────────────────────────────────── */}
        {tab === "post" ? (
          <BuyerView onPost={handlePost} />
        ) : (
          <CleanerView
            cards={feed.filter(c => c.status === "live")}
            deals={deals}
            onExpressInterest={handleExpressInterest}
            onSkip={handleSkip}
          />
        )}
      </div>
    </>
  );
}
