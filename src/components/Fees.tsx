import { motion } from "framer-motion";
import { CheckCircle, Star, Zap, Trophy } from "lucide-react";

const PLANS = [
  {
    age: "U8",
    label: "Fun & Fundamentals",
    monthly: 1500,
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-400",
    accent: "text-emerald-400",
    icon: Star,
    perks: ["4 sessions / week", "Basic equipment provided", "Fun match days", "Progress report monthly"],
    popular: false,
  },
  {
    age: "U12",
    label: "Skill Building",
    monthly: 2000,
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-400",
    accent: "text-blue-400",
    icon: Zap,
    perks: ["4 sessions / week", "Equipment support", "Monthly match practice", "Skill assessment report"],
    popular: false,
  },
  {
    age: "U16",
    label: "Advanced Development",
    monthly: 2500,
    color: "from-secondary/20 to-secondary/5",
    border: "border-secondary/40",
    badge: "bg-secondary/20 text-secondary",
    accent: "text-secondary",
    icon: Trophy,
    perks: ["4 sessions / week", "Video analysis included", "District trial prep", "Strength & conditioning", "Tournament participation"],
    popular: true,
  },
  {
    age: "U19",
    label: "Performance Cricket",
    monthly: 3000,
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-400",
    accent: "text-orange-400",
    icon: Trophy,
    perks: ["4 sessions / week", "Video analysis included", "State-level prep", "Athletic conditioning", "Match scenario training"],
    popular: false,
  },
  {
    age: "Elite",
    label: "High Performance",
    monthly: 4000,
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-400",
    accent: "text-purple-400",
    icon: Trophy,
    perks: ["5 sessions / week", "Full video analysis", "Personal coach attention", "Fitness programme", "Tournament + selection camps"],
    popular: false,
  },
];

const INCLUSIONS = [
  "Expert BCCI-certified coaching",
  "Structured 4-day weekly curriculum",
  "Monthly performance reports",
  "WhatsApp updates to parents",
  "Academy kit discount",
  "Free trial session before joining",
];

export default function Fees() {
  return (
    <section id="fees" className="py-20 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">Fee Structure</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Transparent Pricing<br /><span className="text-secondary">No Hidden Charges</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One-time registration fee of <span className="text-foreground font-bold">₹1,000</span>. Monthly fees cover all coaching sessions, match days, and progress tracking.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {PLANS.map((p, i) => (
            <motion.div key={p.age} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className={`relative bg-gradient-to-b ${p.color} border ${p.border} rounded-2xl p-6 ${p.popular ? "ring-2 ring-secondary/50 scale-[1.03]" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">Most Popular</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <span className={`${p.badge} font-display font-bold text-xl rounded-lg px-3 py-1.5`}>{p.age}</span>
                <div>
                  <p className="font-bold text-sm text-foreground">{p.label}</p>
                </div>
              </div>

              <div className="mb-5">
                <span className={`font-display text-4xl font-black ${p.accent}`}>₹{p.monthly.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm ml-1">/ month</span>
              </div>

              <div className="space-y-2.5 mb-6">
                {p.perks.map(perk => (
                  <div key={perk} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${p.accent}`} />
                    {perk}
                  </div>
                ))}
              </div>

              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${p.popular ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "border border-border text-foreground hover:bg-muted/40"}`}>
                Book Free Trial →
              </button>
            </motion.div>
          ))}
        </div>

        {/* What's included bar */}
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="bg-card border border-border rounded-2xl p-8">
          <h3 className="font-display text-xl font-bold text-center mb-6">Included in All Batches</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {INCLUSIONS.map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-sm text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Note */}
        <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="text-center text-muted-foreground text-sm mt-6">
          * Fees are collected monthly. Sibling discount of 10% available. For custom pricing or scholarships, contact the academy directly.
        </motion.p>

      </div>
    </section>
  );
}
