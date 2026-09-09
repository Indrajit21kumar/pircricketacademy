import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Star, Trophy, IndianRupee, Shield, Home, Award, Flame, ChevronDown, ChevronUp, Users, Target, Tag } from "lucide-react";

// ── Fee constants ─────────────────────────────────────────────────────────────
const REGISTRATION_FEE = 5000;
const KIT_FEE = 2000;
const MONTHLY_FEE = 3500;

const PKG_ICONS = [Zap, Star, Trophy, Award, Flame, Shield];

interface ApiPackage { id: number; months: number; label: string; discountPct: number; isActive: boolean; }
interface ApiDiscount { id: number; name: string; percentage: number; description: string; isActive: boolean; }

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

// ── Style map for known discount names ────────────────────────────────────────
const STYLE_MAP: { match: (name: string) => boolean; Icon: React.ElementType; color: string; bg: string; badge: string; highlight?: boolean }[] = [
  { match: n => n.toLowerCase().includes("india") || n.toLowerCase().includes("challenger"),
    Icon: Flame, color: "text-secondary", bg: "bg-secondary/10 border-secondary/40", badge: "bg-secondary/20 text-secondary", highlight: true },
  { match: n => n.toLowerCase().includes("state player") || n.toLowerCase().includes("bihar"),
    Icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", badge: "bg-blue-500/15 text-blue-400" },
  { match: n => n.toLowerCase().includes("district") || n.toLowerCase().includes("patna"),
    Icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", badge: "bg-cyan-500/15 text-cyan-400" },
  { match: n => n.toLowerCase().includes("state selection") || n.toLowerCase().includes("pir academy"),
    Icon: Award, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", badge: "bg-orange-500/15 text-orange-400" },
  { match: n => n.toLowerCase().includes("police colony") || n.toLowerCase().includes("resident"),
    Icon: Home, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", badge: "bg-purple-500/15 text-purple-400" },
  { match: n => n.toLowerCase().includes("sibling"),
    Icon: Users, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30", badge: "bg-teal-500/15 text-teal-400" },
];
const FALLBACK_STYLES: { Icon: React.ElementType; color: string; bg: string; badge: string; highlight?: boolean }[] = [
  { Icon: Tag,    color: "text-secondary",  bg: "bg-secondary/10 border-secondary/30",  badge: "bg-secondary/15 text-secondary" },
  { Icon: Star,   color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", badge: "bg-yellow-500/15 text-yellow-400" },
  { Icon: Shield, color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",    badge: "bg-blue-500/15 text-blue-400" },
  { Icon: Target, color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/30",    badge: "bg-cyan-500/15 text-cyan-400" },
  { Icon: Home,   color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", badge: "bg-purple-500/15 text-purple-400" },
];
function getDiscountStyle(name: string, idx: number) {
  return STYLE_MAP.find(s => s.match(name)) ?? FALLBACK_STYLES[idx % FALLBACK_STYLES.length];
}

// ── Fallback packages (shown while loading or if API empty) ───────────────────
const DEFAULT_PACKAGES: ApiPackage[] = [
  { id: 0, months: 3,  label: "3-Month Pack",  discountPct: 10, isActive: true },
  { id: 0, months: 6,  label: "6-Month Pack",  discountPct: 15, isActive: true },
  { id: 0, months: 12, label: "12-Month Pack", discountPct: 20, isActive: true },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Fees() {
  const [openDiscount, setOpenDiscount] = useState<number | null>(null);
  const [packages, setPackages] = useState<ApiPackage[]>(DEFAULT_PACKAGES);
  const [discounts, setDiscounts] = useState<ApiDiscount[]>([]);

  useEffect(() => {
    fetch("/api/fee-packages")
      .then(r => r.json())
      .then((d: ApiPackage[]) => { if (Array.isArray(d) && d.length > 0) setPackages(d.filter(p => p.isActive)); })
      .catch(() => {});
    fetch("/api/discount-types")
      .then(r => r.json())
      .then((d: { discounts?: ApiDiscount[] } | ApiDiscount[]) => {
        const list = Array.isArray(d) ? d : (d.discounts ?? []);
        setDiscounts(list.filter(x => x.isActive));
      })
      .catch(() => {});
  }, []);

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
          {packages.map((pkg, i) => {
            const { monthlyTotal, discountAmount, total } = calcPackage(pkg.months, pkg.discountPct);
            const highlight = i === 1;
            const Icon = PKG_ICONS[i % PKG_ICONS.length];
            return (
              <motion.div key={pkg.id || pkg.months} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}}
                className={`relative rounded-2xl border-2 shadow-lg overflow-hidden flex flex-col ${highlight ? "border-secondary shadow-secondary/20" : "border-border"} bg-card`}>
                {highlight && (
                  <div className="bg-secondary text-secondary-foreground text-center py-2 text-xs font-bold uppercase tracking-widest">Most Popular</div>
                )}
                <div className="p-7 flex flex-col gap-5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${highlight ? "bg-secondary/20" : "bg-muted/50"}`}>
                      <Icon className={`w-6 h-6 ${highlight ? "text-secondary" : "text-foreground"}`} />
                    </div>
                    <div>
                      <h5 className="font-display text-xl font-bold uppercase">{pkg.label}</h5>
                      <p className="text-muted-foreground text-sm">Reg + Kit + {pkg.months} months</p>
                    </div>
                  </div>

                  {/* Savings badge */}
                  <div className={`rounded-xl p-4 text-center border ${highlight ? "bg-secondary/10 border-secondary/30" : "bg-muted/30 border-border"}`}>
                    <p className="text-xs text-muted-foreground mb-1">You save</p>
                    <p className={`font-display text-2xl font-bold ${highlight ? "text-secondary" : "text-foreground"}`}>₹{discountAmount.toLocaleString("en-IN")}</p>
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
                    className={`w-full font-bold uppercase tracking-widest py-3 rounded-xl mt-auto transition-all ${highlight ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "border border-border hover:bg-muted/40 text-foreground"}`}>
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
          {discounts.map((d, i) => {
            const style = getDiscountStyle(d.name, i);
            const discountLabel = d.percentage >= 100 ? "100% FREE" : `${d.percentage}%`;
            const subtitle = `${d.percentage >= 100 ? "Completely Free" : `${d.percentage}% Off`} — Tuition Fee`;
            return (
              <motion.div key={d.id} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
                className={`relative rounded-2xl border-2 p-6 flex flex-col gap-4 ${style.bg} ${style.highlight ? "shadow-xl shadow-secondary/20" : "shadow-sm"}`}>
                {style.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow">Highest Honour</span>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                    <style.Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-display text-base font-bold uppercase leading-tight">{d.name}</h5>
                    <p className={`text-sm font-semibold mt-0.5 ${style.color}`}>{subtitle}</p>
                  </div>
                  <div className={`shrink-0 rounded-xl px-3 py-2 text-center font-display font-black text-lg ${style.badge}`}>{discountLabel}</div>
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
            );
          })}
          {discounts.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">Loading discounts…</div>
          )}
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
