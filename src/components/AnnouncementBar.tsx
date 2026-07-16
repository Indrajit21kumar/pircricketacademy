const items = [
  "🏏 PIRcricketHub launching August/September 2026 in Patna",
  "🌟 From the Soil of Bihar, to the Stadiums of India",
  "🎓 PIR Talent Scholarship — 100% Free Training for Deserving Players · Inquire Now",
  "🎯 Early Admissions Open — Limited Founding Batch Seats",
  "🏆 Bihar's First Double Centurion in Ranji Trophy — Indrajit Kumar",
  "✅ U8, U12, U16, U19 & Elite Batches Now Forming",
  "📍 Sector-A, Police Colony, Anisabad, Patna",
  "📞 WhatsApp / Call: +91 89360 61688",
  "🤝 Under the Aegis of S.P Sports & Cultural Organisation, Patna",
];

export default function AnnouncementBar() {
  const repeated = [...items, ...items];
  return (
    <div className="fixed top-0 inset-x-0 bg-secondary text-secondary-foreground py-2 overflow-hidden z-[60]">
      <div className="flex whitespace-nowrap animate-ticker">
        {repeated.map((msg, i) => (
          <span key={i} className="inline-flex items-center shrink-0 px-8 text-sm font-semibold">
            {msg}<span className="mx-8 opacity-40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
