import { useNavigate } from "react-router-dom";

export default function Logo({ size = 32, showText = true, style = {} }) {
  const nav = useNavigate();

  return (
    <div
      onClick={() => nav("/")}
      style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", userSelect:"none", ...style }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.08)" />
        <path
          d="M20 8 C20 8 12 17 12 23 C12 27.4 15.6 31 20 31 C24.4 31 28 27.4 28 23 C28 17 20 8 20 8Z"
          fill="rgba(0,212,255,0.15)"
          stroke="#00d4ff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M22 16 L18 22 L21 22 L18 29 L23 21 L20 21 Z" fill="#00d4ff" />
      </svg>
      {showText && (
        <span style={{ color:"#00d4ff", fontWeight:800, fontSize: size > 28 ? 20 : 16, letterSpacing:"-0.02em" }}>
          CleanAlert
        </span>
      )}
    </div>
  );
}
