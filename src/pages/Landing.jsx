import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const CYAN="#00d4ff",NAVY="#0a1628",SURFACE="#0f2044",BORDER="#1e3a6e",GREEN="#00e096",GOLD="#ffd700",MUTED="#6b8cba",TEXT="#e8f4ff";

const CSS = `
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(0,212,255,.4)}70%{box-shadow:0 0 0 18px rgba(0,212,255,0)}100%{box-shadow:0 0 0 0 rgba(0,212,255,0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.ca-hero-btn:hover{opacity:.88;transform:scale(1.03)}
.ca-hero-btn{transition:all .2s}
.ca-feature:hover{border-color:${CYAN}!important;transform:translateY(-4px)}
.ca-feature{transition:all .2s}
@media(max-width:640px){
  .ca-hero-title{font-size:2rem!important}
  .ca-features-grid{grid-template-columns:1fr!important}
  .ca-how-grid{grid-template-columns:1fr!important}
  .ca-nav-links{display:none!important}
  .ca-hero-btns{flex-direction:column!important;align-items:stretch!important}
}
`;

const features = [
  { icon:"⚡", title:"Real-Time Alerts", desc:"Contract leads post live — cleaners see them instantly and move fast before the competition." },
  { icon:"🏢", title:"Verified Buyers", desc:"Every contract is posted by a real business. No spam, no fake leads, no wasted time." },
  { icon:"📋", title:"Contract Management", desc:"Track active contracts, monitor days remaining, and get renewal alerts before they expire." },
  { icon:"⭐", title:"Reviews & Reputation", desc:"Build a track record that makes buyers choose you over everyone else." },
  { icon:"🤝", title:"Direct Connection", desc:"When a buyer accepts your interest, you get their contact info directly. No middleman." },
  { icon:"📍", title:"Local Leads", desc:"Contracts in your area — office, warehouse, retail, medical, restaurant, and more." },
];

const howBuyer = [
  { n:"1", text:"Post your cleaning contract in under 2 minutes" },
  { n:"2", text:"Cleaners express interest with a message" },
  { n:"3", text:"Review profiles, ratings, and accept the best fit" },
];

const howCleaner = [
  { n:"1", text:"Create your cleaner profile" },
  { n:"2", text:"Browse live contracts in your area" },
  { n:"3", text:"Express interest and get hired fast" },
];

export default function Landing() {
  const nav = useNavigate();

  return (
    <div style={{ background:NAVY, fontFamily:"system-ui,sans-serif", color:TEXT, minHeight:"100vh" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ background:SURFACE, borderBottom:`1px solid ${BORDER}`, padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Logo size={32} />
        <div className="ca-nav-links" style={{ display:"flex", gap:"2rem" }}>
          {["Features","How It Works","For Cleaners"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{ color:MUTED, textDecoration:"none", fontSize:14 }}>{l}</a>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="ca-hero-btn" onClick={() => nav("/login")} style={{ background:"transparent", color:CYAN, border:`1px solid ${CYAN}`, borderRadius:10, padding:"0.55rem 1.25rem", fontSize:14, fontWeight:600, cursor:"pointer" }}>Log In</button>
          <button className="ca-hero-btn" onClick={() => nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:10, padding:"0.55rem 1.25rem", fontSize:14, fontWeight:700, cursor:"pointer" }}>Sign Up Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign:"center", padding:"5rem 1.5rem 4rem", maxWidth:780, margin:"0 auto" }}>
        <div style={{ display:"inline-block", background:"rgba(0,212,255,0.08)", border:`1px solid rgba(0,212,255,0.3)`, borderRadius:20, padding:"0.35rem 1rem", fontSize:13, color:CYAN, fontWeight:600, marginBottom:"1.5rem" }}>
          🔴 LIVE — Commercial Cleaning Contracts In Your Area
        </div>
        <h1 className="ca-hero-title" style={{ fontSize:"3rem", fontWeight:900, lineHeight:1.15, marginBottom:"1.25rem", background:`linear-gradient(135deg, ${TEXT}, ${CYAN})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          The Fastest Way to Win Commercial Cleaning Contracts
        </h1>
        <p style={{ color:MUTED, fontSize:18, lineHeight:1.7, marginBottom:"2.5rem", maxWidth:600, margin:"0 auto 2.5rem" }}>
          Businesses post cleaning contracts. Cleaners respond in real time. Deals get made — fast.
        </p>
        <div className="ca-hero-btns" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="ca-hero-btn" onClick={() => nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:12, padding:"1rem 2rem", fontSize:17, fontWeight:800, cursor:"pointer", animation:"pulseRing 2s infinite" }}>
            Find Contracts Now →
          </button>
          <button className="ca-hero-btn" onClick={() => nav("/register")} style={{ background:"transparent", color:TEXT, border:`1px solid ${BORDER}`, borderRadius:12, padding:"1rem 2rem", fontSize:16, fontWeight:600, cursor:"pointer" }}>
            Post a Contract
          </button>
        </div>
        <p style={{ color:MUTED, fontSize:13, marginTop:"1.25rem" }}>Free to post · Free to browse · No hidden fees</p>
      </section>

      {/* LIVE FEED PREVIEW */}
      <section style={{ maxWidth:700, margin:"0 auto 5rem", padding:"0 1.5rem" }}>
        <div style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:18, padding:"1.5rem", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${CYAN},${GREEN})` }} />
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.25rem" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:CYAN, animation:"pulseRing 1.5s infinite" }} />
            <span style={{ color:CYAN, fontWeight:700, fontSize:14 }}>Live Contract Feed</span>
          </div>
          {[
            { title:"Weekly Office Cleaning — Center City", type:"Office", loc:"Philadelphia, PA", budget:"$800–1,200/mo", age:"2m ago" },
            { title:"Warehouse Cleaning 3x/week", type:"Warehouse", loc:"Camden, NJ", budget:"$1,400/mo", age:"14m ago" },
            { title:"Medical Office Daily Service", type:"Medical", loc:"King of Prussia, PA", budget:"$2,800/mo", age:"1h ago" },
          ].map((c,i) => (
            <div key={i} style={{ background:NAVY, border:`1px solid ${BORDER}`, borderRadius:12, padding:"1rem 1.25rem", marginBottom:"0.75rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ color:TEXT, fontWeight:600, fontSize:15, marginBottom:6 }}>{c.title}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ background:"rgba(0,212,255,0.1)", color:CYAN, fontSize:11, padding:"2px 9px", borderRadius:20 }}>{c.type}</span>
                  <span style={{ background:"rgba(0,212,255,0.1)", color:CYAN, fontSize:11, padding:"2px 9px", borderRadius:20 }}>📍 {c.loc}</span>
                  <span style={{ color:MUTED, fontSize:12 }}>{c.age}</span>
                </div>
              </div>
              <div style={{ color:GREEN, fontWeight:700, fontSize:15 }}>{c.budget}</div>
            </div>
          ))}
          <div style={{ textAlign:"center", marginTop:"0.5rem" }}>
            <button className="ca-hero-btn" onClick={() => nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:10, padding:"0.7rem 1.75rem", fontWeight:700, fontSize:15, cursor:"pointer" }}>Claim a Contract →</button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth:1100, margin:"0 auto 5rem", padding:"0 1.5rem" }}>
        <h2 style={{ textAlign:"center", fontSize:"2rem", fontWeight:800, marginBottom:"0.75rem" }}>Everything You Need to Win</h2>
        <p style={{ textAlign:"center", color:MUTED, marginBottom:"3rem" }}>Built for cleaning businesses that want to grow fast.</p>
        <div className="ca-features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {features.map(f => (
            <div key={f.title} className="ca-feature" style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:16, padding:"1.5rem" }}>
              <div style={{ fontSize:32, marginBottom:"0.75rem" }}>{f.icon}</div>
              <div style={{ color:TEXT, fontWeight:700, fontSize:16, marginBottom:"0.5rem" }}>{f.title}</div>
              <div style={{ color:MUTED, fontSize:14, lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background:SURFACE, borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"4rem 1.5rem", marginBottom:"5rem" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:"2rem", fontWeight:800, marginBottom:"3rem" }}>How It Works</h2>
          <div className="ca-how-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem" }}>
            {[["🏢 For Businesses", howBuyer], ["🧹 For Cleaners", howCleaner]].map(([label, steps]) => (
              <div key={label}>
                <div style={{ color:CYAN, fontWeight:700, fontSize:16, marginBottom:"1.25rem" }}>{label}</div>
                {steps.map(s => (
                  <div key={s.n} style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:"1rem" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(0,212,255,0.12)", border:`1px solid ${CYAN}`, color:CYAN, fontWeight:800, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.n}</div>
                    <div style={{ color:MUTED, fontSize:15, lineHeight:1.5, paddingTop:4 }}>{s.text}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR CLEANERS */}
      <section id="for-cleaners" style={{ maxWidth:700, margin:"0 auto 5rem", padding:"0 1.5rem", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:"1rem", animation:"float 3s ease-in-out infinite" }}>🧹</div>
        <h2 style={{ fontSize:"2rem", fontWeight:800, marginBottom:"1rem" }}>Cleaners: Stop Chasing. Start Winning.</h2>
        <p style={{ color:MUTED, fontSize:16, lineHeight:1.7, marginBottom:"2rem" }}>
          Most cleaning businesses spend hours cold calling and bidding on jobs they'll never hear back from. CleanAlert flips it — buyers come to you, post what they need, and you express interest in seconds.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:"2rem" }}>
          {["Office buildings","Warehouses","Medical offices","Restaurants","Retail stores","Schools"].map(t => (
            <span key={t} style={{ background:"rgba(0,212,255,0.08)", border:`1px solid ${BORDER}`, color:CYAN, fontSize:13, padding:"0.4rem 1rem", borderRadius:20 }}>{t}</span>
          ))}
        </div>
        <button className="ca-hero-btn" onClick={() => nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:12, padding:"1rem 2.5rem", fontSize:17, fontWeight:800, cursor:"pointer" }}>
          Get Started Free →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${BORDER}`, padding:"2rem 1.5rem", textAlign:"center" }}>
        <Logo size={24} style={{justifyContent:"center"}} />
        <div style={{ color:MUTED, fontSize:13 }}>Real-time commercial cleaning contract marketplace</div>
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:"1rem" }}>
          <button onClick={() => nav("/login")} style={{ background:"transparent", color:MUTED, border:"none", cursor:"pointer", fontSize:13 }}>Log In</button>
          <button onClick={() => nav("/register")} style={{ background:"transparent", color:MUTED, border:"none", cursor:"pointer", fontSize:13 }}>Sign Up</button>
        </div>
      </footer>
    </div>
  );
}
