import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

const NAVY="#0A1628", CYAN="#00D4FF", WHITE="#ffffff", MUTED="#6b8cba", BORDER="#1e3a6e";

const features = [
  { icon:"⚡", title:"Real-Time Alerts", desc:"Contract leads post live. Cleaners see them instantly and move before the competition." },
  { icon:"🏢", title:"Verified Buyers", desc:"Every contract posted by a real business. No spam, no fake leads, no wasted time." },
  { icon:"📋", title:"Contract Management", desc:"Track active contracts, days remaining, and get renewal alerts before they expire." },
  { icon:"⭐", title:"Reviews & Reputation", desc:"Build a track record that makes buyers choose you over everyone else." },
  { icon:"🤝", title:"Direct Connection", desc:"When a buyer accepts, you get their contact info directly. No middleman." },
  { icon:"📍", title:"Local Leads", desc:"Contracts in your area — office, warehouse, retail, medical, restaurant and more." },
];

const MOCK_FEED = [
  { title:"Weekly Office Cleaning — Center City", type:"Office", loc:"Philadelphia, PA", budget:"$800–1,200/mo", age:"2m ago" },
  { title:"Warehouse Cleaning 3x/week", type:"Warehouse", loc:"Camden, NJ", budget:"$1,400/mo", age:"14m ago" },
  { title:"Medical Office Daily Service", type:"Medical", loc:"King of Prussia, PA", budget:"$2,800/mo", age:"1h ago" },
];

export default function Landing() {
  const nav = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ background:NAVY, minHeight:"100vh", fontFamily:"Inter,sans-serif" }}>

      {/* ADMIN BAR */}
      {user && (
        <div style={{ background:"#4c1d95", padding:"0.6rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
          <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>👑 Admin Preview</span>
          {[["Cleaner Dashboard","/cleaner"],["Buyer Dashboard","/buyer"],["Admin Panel","/admin"]].map(([l,r])=>(
            <button key={r} onClick={()=>nav(r)} style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"none", borderRadius:6, padding:"4px 14px", fontSize:13, cursor:"pointer", fontWeight:600 }}>{l}</button>
          ))}
        </div>
      )}

      {/* NAV */}
      <nav style={{ borderBottom:`1px solid ${BORDER}`, padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Logo size={32} />
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>nav("/login")} style={{ background:"transparent", color:CYAN, border:`1px solid ${CYAN}`, borderRadius:8, padding:"0.5rem 1.25rem", fontSize:14, fontWeight:600, cursor:"pointer" }}>Log In</button>
          <button onClick={()=>nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:8, padding:"0.5rem 1.25rem", fontSize:14, fontWeight:700, cursor:"pointer" }}>Sign Up Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign:"center", padding:"5rem 1.5rem 4rem", maxWidth:740, margin:"0 auto" }}>
        <div style={{ display:"inline-block", border:`1px solid ${CYAN}`, borderRadius:4, padding:"0.3rem 1rem", fontSize:12, color:CYAN, fontWeight:700, letterSpacing:"0.08em", marginBottom:"1.5rem" }}>
          🔴 LIVE — COMMERCIAL CLEANING CONTRACTS
        </div>
        <h1 style={{ fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900, color:WHITE, lineHeight:1.1, marginBottom:"1.25rem", letterSpacing:"-0.02em" }}>
          The Fastest Way to Win<br />Commercial Cleaning Contracts
        </h1>
        <p style={{ color:MUTED, fontSize:18, lineHeight:1.7, marginBottom:"2.5rem" }}>
          Businesses post cleaning contracts. Cleaners respond in real time. Deals close fast.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={()=>nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:8, padding:"0.9rem 2rem", fontSize:16, fontWeight:800, cursor:"pointer" }}>Find Contracts Now →</button>
          <button onClick={()=>nav("/register")} style={{ background:"transparent", color:WHITE, border:`1px solid ${BORDER}`, borderRadius:8, padding:"0.9rem 2rem", fontSize:15, fontWeight:600, cursor:"pointer" }}>Post a Contract</button>
        </div>
        <p style={{ color:MUTED, fontSize:13, marginTop:"1rem" }}>Free to post · Free to browse · No hidden fees</p>
      </section>

      {/* LIVE FEED PREVIEW */}
      <section style={{ maxWidth:680, margin:"0 auto 5rem", padding:"0 1.5rem" }}>
        <div style={{ borderRadius:16, overflow:"hidden", border:`1px solid ${BORDER}` }}>
          {/* Feed header */}
          <div style={{ background:"#0f2044", padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ width:9, height:9, borderRadius:"50%", background:CYAN }} />
            <span style={{ color:CYAN, fontWeight:700, fontSize:13, letterSpacing:"0.05em" }}>LIVE CONTRACT FEED</span>
          </div>
          {/* Feed cards */}
          {MOCK_FEED.map((c,i) => (
            <div key={i} style={{ background:WHITE, padding:"1.1rem 1.25rem", borderBottom: i<MOCK_FEED.length-1 ? "1px solid #e8eef5" : "none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <div>
                <div style={{ color:"#0A1628", fontWeight:700, fontSize:15, marginBottom:6 }}>{c.title}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ background:"#e0f7ff", color:"#006d8f", fontSize:11, padding:"3px 10px", borderRadius:4, fontWeight:600 }}>{c.type}</span>
                  <span style={{ background:"#f0f4ff", color:"#3b4e7a", fontSize:11, padding:"3px 10px", borderRadius:4, fontWeight:600 }}>📍 {c.loc}</span>
                  <span style={{ color:"#9aa5b4", fontSize:12 }}>{c.age}</span>
                </div>
              </div>
              <span style={{ color:"#007a4d", fontWeight:800, fontSize:16, whiteSpace:"nowrap" }}>{c.budget}</span>
            </div>
          ))}
          <div style={{ background:"#0f2044", padding:"0.85rem", textAlign:"center" }}>
            <button onClick={()=>nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:8, padding:"0.65rem 1.75rem", fontWeight:700, fontSize:14, cursor:"pointer" }}>Claim a Contract →</button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth:1080, margin:"0 auto 5rem", padding:"0 1.5rem" }}>
        <h2 style={{ textAlign:"center", fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color:WHITE, marginBottom:"0.75rem", letterSpacing:"-0.02em" }}>Everything You Need to Win</h2>
        <p style={{ textAlign:"center", color:MUTED, marginBottom:"2.5rem" }}>Built for cleaning businesses that move fast.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {features.map(f=>(
            <div key={f.title} style={{ background:WHITE, borderRadius:12, padding:"1.5rem", border:"1px solid #e8eef5" }}>
              <div style={{ fontSize:28, marginBottom:"0.75rem" }}>{f.icon}</div>
              <div style={{ color:"#0A1628", fontWeight:700, fontSize:16, marginBottom:"0.5rem" }}>{f.title}</div>
              <div style={{ color:"#4a5568", fontSize:14, lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"4rem 1.5rem", marginBottom:"5rem" }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color:WHITE, marginBottom:"2.5rem", letterSpacing:"-0.02em" }}>How It Works</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"3rem" }}>
            {[["🏢 For Businesses",[" Post your contract in under 2 minutes","Cleaners respond with interest and a message","Review profiles and accept the best fit"]],
              ["🧹 For Cleaners",["Create your cleaner profile","Browse live contracts in your area","Express interest and get hired fast"]]
            ].map(([label,steps])=>(
              <div key={label}>
                <div style={{ color:CYAN, fontWeight:700, fontSize:15, marginBottom:"1.25rem", letterSpacing:"0.02em" }}>{label}</div>
                {steps.map((s,i)=>(
                  <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:"1rem" }}>
                    <div style={{ width:28, height:28, borderRadius:4, background:CYAN, color:NAVY, fontWeight:800, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                    <div style={{ color:"#a0b4cc", fontSize:15, lineHeight:1.5, paddingTop:4 }}>{s}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign:"center", padding:"4rem 1.5rem 5rem", maxWidth:600, margin:"0 auto" }}>
        <h2 style={{ fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color:WHITE, marginBottom:"1rem", letterSpacing:"-0.02em" }}>Stop Chasing. Start Winning.</h2>
        <p style={{ color:MUTED, fontSize:16, lineHeight:1.7, marginBottom:"2rem" }}>Most cleaning businesses spend hours cold calling. CleanAlert flips it — buyers come to you.</p>
        <button onClick={()=>nav("/register")} style={{ background:CYAN, color:NAVY, border:"none", borderRadius:8, padding:"1rem 2.5rem", fontSize:17, fontWeight:800, cursor:"pointer" }}>Get Started Free →</button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${BORDER}`, padding:"2rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <Logo size={26} />
        <div style={{ color:MUTED, fontSize:13 }}>Real-time commercial cleaning contract marketplace</div>
        <div style={{ display:"flex", gap:16 }}>
          <button onClick={()=>nav("/login")} style={{ background:"transparent", color:MUTED, border:"none", cursor:"pointer", fontSize:13 }}>Log In</button>
          <button onClick={()=>nav("/register")} style={{ background:"transparent", color:MUTED, border:"none", cursor:"pointer", fontSize:13 }}>Sign Up</button>
        </div>
      </footer>
    </div>
  );
}
