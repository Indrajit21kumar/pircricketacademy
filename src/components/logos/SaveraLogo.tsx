export default function SaveraLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Circle background */}
      <circle cx="50" cy="46" r="38" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
      <circle cx="50" cy="46" r="32" fill="#991b1b" />
      {/* Rays of hope sunburst */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i}
          x1={50 + 20 * Math.cos((deg - 90) * Math.PI / 180)}
          y1={46 + 20 * Math.sin((deg - 90) * Math.PI / 180)}
          x2={50 + 30 * Math.cos((deg - 90) * Math.PI / 180)}
          y2={46 + 30 * Math.sin((deg - 90) * Math.PI / 180)}
          stroke="#fca5a5" strokeWidth="2" strokeLinecap="round"
        />
      ))}
      {/* Medical cross */}
      <rect x="44" y="32" width="12" height="28" rx="3" fill="white" />
      <rect x="36" y="40" width="28" height="12" rx="3" fill="white" />
      {/* Savera text */}
      <text x="50" y="96" textAnchor="middle" fill="#ef4444" fontSize="13" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">"SAVERA"</text>
      <text x="50" y="108" textAnchor="middle" fill="#fca5a5" fontSize="5" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">CANCER & MULTI SPECIALITY HOSPITAL</text>
    </svg>
  );
}
