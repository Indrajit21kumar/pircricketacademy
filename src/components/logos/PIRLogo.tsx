export default function PIRLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="50" cy="50" r="48" stroke="#eab308" strokeWidth="3" fill="#0a0f1e" />
      <circle cx="50" cy="50" r="42" stroke="#eab308" strokeWidth="1" strokeDasharray="2 3" fill="none" />
      {/* Cricket bat */}
      <rect x="46" y="20" width="8" height="28" rx="4" fill="#eab308" />
      <rect x="44" y="46" width="12" height="6" rx="2" fill="#ca8a04" />
      {/* Ball */}
      <circle cx="50" cy="62" r="6" fill="#eab308" />
      <path d="M46 62 Q50 58 54 62" stroke="#ca8a04" strokeWidth="1" fill="none" />
      <path d="M46 62 Q50 66 54 62" stroke="#ca8a04" strokeWidth="1" fill="none" />
      {/* PIR text */}
      <text x="50" y="78" textAnchor="middle" fill="#eab308" fontSize="9" fontFamily="sans-serif" fontWeight="bold" letterSpacing="2">PIR</text>
      {/* Arc text top */}
      <path id="topArc" d="M 15,50 A 35,35 0 0,1 85,50" fill="none" />
      <text fontSize="5.5" fill="#eab308" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">
        <textPath href="#topArc" startOffset="10%">CRICKET ACADEMY</textPath>
      </text>
      {/* Arc text bottom */}
      <path id="botArc" d="M 20,60 A 35,35 0 0,0 80,60" fill="none" />
      <text fontSize="4.5" fill="#ca8a04" fontFamily="sans-serif" letterSpacing="1.5">
        <textPath href="#botArc" startOffset="18%">ESTD. 2025 · PATNA</textPath>
      </text>
    </svg>
  );
}
