import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Star, Trophy, IndianRupee, Shield, MapPin, Home, Award, Flame, ChevronDown, ChevronUp } from "lucide-react";

// ── Fee constants ─────────────────────────────────────────────────────────────
const REGISTRATION_FEE = 5000;
const KIT_FEE = 2000;
const MONTHLY_FEE = 3500;

const PACKAGES = [
  { key: "3month",  label: "3-Month Pack",  months: 3,  discountPct: 10, highlight: false, Icon: Zap },
  { key: "6month",  label: "6-Month Pack",  months: 6,  discountPct: 15, highlight: true,  Icon: Star },
  { key: "12month", label: "12-Month Pack", months: 12, discountPct: 20, highlight: false, Icon: Trophy },
];

function calcPackage(months: number, discountPct: number) {
  const monthlyTotal  = months * MONTHLY_FEE;
  const discountAmount = Math.round(monthlyTotal * discountPct / 100);
  const total = REGISTRATION_FEE + KIT_FEE + (monthlyTotal - discountAmount);
  return { monthlyTotal, discountAmount, total };
}

// ── Base fees ─────────────────────────────────────────────────────────────────
const BASE_FEES = [
  { Icon: IndianRupee, label: "Registration Fee", desc: "One-time admission fee to join the academy",        amount: REGISTRATION_FEE, tag: "One-time" },
  { Icon: Star,        label: "Academy Kit",       desc: "Dress, cap & duffel bag — official PIR Academy gear", amount: KIT_FEE,           tag: "One-time" },
  { Icon: Zap,         label: "Monthly Fee",        desc: "Full access to all training sessions & facilities",  amount: MONTHLY_FEE,       tag: "Per month" },
];

// ── Special eligibility discounts ─────────────────────────────────────────────
const SPECIAL_DISCOUNTS = [
  {
    Icon: Flame, title: "India / Challenger Trophy Player", subtitle: "Completely Free Practice",
    discount: "100% FREE", highlight: true,
    color: "text-secondary", bg: "bg-secondary/10 border-secondary/40", badge: "bg-secondary/20 text-secondary",
    description: "Any cricketer who has represented India at any age group, or played in the Challenger Trophy, trains at PIR Cricket Academy free of charge — at any age. No fees, no conditions. This is our commitment to elite Indian cricket.",
  },
  {
    Icon: Shield, title: "State Player", subtitle: "20% Off on All Fees",
    discount: "20%", highlight: false,
    color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", badge: "bg-blue-500/15 text-blue-400",
    description: "Any player who has represented Bihar or another state in official BCCI-affiliated cricket (U-14, U-16, U-19, U-23, Senior) receives a flat 20% discount on all fees — registration, kit, and monthly training.",
  },
  {
    Icon: Award, title: "State Selection from PIR Camp", subtitle: "50% Off — Ongoing Reward",
    discount: "50%", highlight: false,
    color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", badge: "bg-orange-500/15 text-orange-400",
    description: "If you earn your state selection while training at PIR Cricket Academy, your monthly fees are cut by 50% immediately and remain at that rate for as long as you train here. Your success is our success.",
  },
  {
    Icon: MapPin, title: "Patna District Player", subtitle: "10% Off on All Fees",
    discount: "10%", highlight: false,
    color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", badge: "bg-green-500/15 text-green-400",
    description: "Players who represent Patna District in official district cricket receive a 10% discount on all academy fees as part of our commitment to nurturing local talent from our home district.",
  },
  {
    Icon: Home, title: "Police Colony Resident", subtitle: "10% Off on All Fees",
    discount: "10%", highlight: false,
    color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", badge: "bg-purple-500/15 text-purple-400",
    description: "Residents of Police Colony, Patna receive a 10% discount on all academy fees. We are proud to be part of this community and want to make quality cricket coaching accessible to every family here.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Fees() {
  const [openDiscount, setOpenDiscount] = useState<number | null>(null);

  return (
    <section id="fees" className="py-24 bg-gradient-to-b from-card/20 to-background">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-secondary" />
            <span className="text-secondary font-bold uppercase tracking-widest text-sm">Fee Structure</span>
            <div className="h-px w-12 bg-secondary" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 uppercase">
            Invest in Your Game
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transparent pricing. No hidden charges. Commit more, save more — our packages reward players who are serious about the long game.
          </p>
        </motion.div>

        {/* Base fee cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {BASE_FEES.map((f, i) => (
            <motion.div key={f.label} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <f.Icon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-display text-lg font-bold uppercase">{f.label}</h4>
                  <span className="text-xs font-bold uppercase tracking-wider bg-secondary/15 text-secondary px-2 py-0.5 rounded-full">{f.tag}</span>
                </div>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-border">
                <span className="font-display text-3xl font-bold">₹{f.amount.toLocaleString("en-IN")}</span>
                <span className="text-muted-foreground text-sm ml-1">{f.tag === "Per month" ? "/ month" : " (one-time)"}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upfront packages */}
        <div className="text-center mb-10">
          <h3 className="font-display text-2xl md:text-3xl font-bold uppercase mb-3">Upfront Payment Packages</h3>
          <p className="text-muted-foreground">Pay fees upfront and unlock exclusive discounts on your monthly training costs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {PACKAGES.map((pkg, i) => {
            const { monthlyTotal, discountAmount, total } = calcPackage(pkg.months, pkg.discountPct);
            return (
              <motion.div key={pkg.key} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}}
                className={`relative rounded-2xl border-2 shadow-lg overflow-hidden flex flex-col ${pkg.highlight ? "border-secondary shadow-secondary/20" : "border-border"} bg-card`}>
                {pkg.highlight && (
                  <div className="bg-secondary text-secondary-foreground text-center py-2 text-xs font-bold uppercase tracking-widest">Most Popular</div>
                )}
                <div className="p-7 flex flex-col gap-5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pkg.highlight ? "bg-secondary/20" : "bg-muted/50"}`}>
                      <pkg.Icon className={`w-6 h-6 ${pkg.highlight ? "text-secondary" : "text-foreground"}`} />
                    </div>
                    <div>
                      <h5 className="font-display text-xl font-bold uppercase">{pkg.label}</h5>
                      <p className="text-muted-foreground text-sm">Reg + Kit + {pkg.months} months</p>
                    </div>
                  </div>

                  {/* Savings badge */}
                  <div className={`rounded-xl p-4 text-center border ${pkg.highlight ? "bg-secondary/10 border-secondary/30" : "bg-muted/30 border-border"}`}>
                    <p className="text-xs text-muted-foreground mb-1">You save</p>
                    <p className={`font-display text-2xl font-bold ${pkg.highlight ? "text-secondary" : "text-foreground"}`}>₹{discountAmount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{pkg.discountPct}% off monthly fees</p>
                  </div>

                  {/* Breakdown */}
                  <ul className="flex flex-col gap-3 text-sm">
                    <li className="flex justify-between"><span className="text-muted-foreground flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-secondary shrink-0"/>Registration</span><span className="font-medium">₹{REGISTRATION_FEE.toLocaleString("en-IN")}</span></li>
                    <li className="flex justify-between"><span className="text-muted-foreground flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-secondary shrink-0"/>Academy kit</span><span className="font-medium">₹{KIT_FEE.toLocaleString("en-IN")}</span></li>
                    <li className="flex justify-between"><span className="text-muted-foreground flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-secondary shrink-0"/>{pkg.months} months × ₹{MONTHLY_FEE.toLocaleString("en-IN")}</span><span className="font-medium line-through text-muted-foreground">₹{monthlyTotal.toLocaleString("en-IN")}</span></li>
                    <li className="flex justify-between text-green-400 font-medium"><span className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 shrink-0"/>{pkg.discountPct}% discount</span><span>−₹{discountAmount.toLocaleString("en-IN")}</span></li>
                    <li className="pt-3 border-t border-border flex justify-between">
                      <span className="font-bold uppercase tracking-wide">Total Payable</span>
                      <span className="font-display text-2xl font-bold">₹{total.toLocaleString("en-IN")}</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}
                    className={`w-full font-bold uppercase tracking-widest py-3 rounded-xl mt-auto transition-all ${pkg.highlight ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "border border-border hover:bg-muted/40 text-foreground"}`}>
                    Select This Package
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mb-20">All fees in Indian Rupees (INR). For group enquiries, contact us directly.</p>

        {/* Special eligibility discounts */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-secondary" />
            <span className="text-secondary font-bold uppercase tracking-widest text-sm">Special Benefits</span>
            <div className="h-px w-12 bg-secondary" />
          </div>
          <h3 className="font-display text-3xl md:text-4xl font-bold uppercase mb-3">Eligibility Discounts</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PIR Cricket Academy believes talent should never be stopped by fees. These discounts apply automatically — just mention your eligibility when you register.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {SPECIAL_DISCOUNTS.map((d, i) => (
            <motion.div key={d.title} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className={`relative rounded-2xl border-2 p-6 flex flex-col gap-4 ${d.bg} ${d.highlight ? "shadow-xl shadow-secondary/20" : "shadow-sm"}`}>
              {d.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow">Highest Honour</span>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${d.bg}`}>
                  <d.Icon className={`w-6 h-6 ${d.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-display text-base font-bold uppercase leading-tight">{d.title}</h5>
                  <p className={`text-sm font-semibold mt-0.5 ${d.color}`}>{d.subtitle}</p>
                </div>
                <div className={`shrink-0 rounded-xl px-3 py-2 text-center font-display font-black text-lg ${d.badge}`}>{d.discount}</div>
              </div>

              {/* Expandable description */}
              <button onClick={() => setOpenDiscount(openDiscount === i ? null : i)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start">
                {openDiscount === i ? <><ChevronUp className="h-3.5 w-3.5"/>Hide details</> : <><ChevronDown className="h-3.5 w-3.5"/>See details</>}
              </button>
              {openDiscount === i && (
                <p className="text-muted-foreground text-sm leading-relaxed border-t border-current/10 pt-3">{d.description}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">Note:</span> Discounts are verified at registration. Multiple discounts may apply — speak to the coaching team for your best rate. All eligibility is subject to documentation.
          </p>
        </div>

      </div>
    </section>
  );
}
