export default function SPSportsLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield shape */}
      <path d="M50 4 L90 20 L90 55 Q90 85 50 106 Q10 85 10 55 L10 20 Z" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2.5" />
      <path d="M50 12 L83 26 L83 55 Q83 80 50 98 Q17 80 17 55 L17 26 Z" fill="#1e40af" />
      {/* Cricket player silhouette */}
      <circle cx="50" cy="35" r="7" fill="#93c5fd" />
      <path d="M43 44 Q50 42 57 44 L60 65 L55 65 L52 52 L52 65 L48 65 L48 52 L45 65 L40 65 Z" fill="#93c5fd" />
      {/* Bat */}
      <rect x="56" y="38" width="4" height="18" rx="2" transform="rotate(25,58,47)" fill="#fbbf24" />
      {/* Ball */}
      <circle cx="35" cy="56" r="4" fill="#fbbf24" />
      {/* SP text */}
      <text x="50" y="83" textAnchor="middle" fill="#fbbf24" fontSize="13" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">SP</text>
      {/* Bottom text */}
      <text x="50" y="104" textAnchor="middle" fill="#93c5fd" fontSize="5" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">SPORTS & CULTURAL ORG.</text>
    </svg>
  );
}
