import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle, Users, Star, Trophy, BarChart3, Phone } from "lucide-react";

const benefits = [
  { icon: Trophy,     text: "Globally-benchmarked structured curriculum — ICC, BCCI, ECB, CA" },
  { icon: Users,      text: "Priority batch allocation — choose your preferred timing" },
  { icon: Star,       text: "Founding student recognition — lifetime academy record" },
  { icon: BarChart3,  text: "Personalised development tracking from Day One" },
  { icon: CheckCircle,text: "QR attendance, monthly report cards & parent portal access" },
];

const batches = ["U8","U12","U16","U19","Elite"];

export default function FoundingBatch() {
  return (
    <section id="enrol" className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-4xl">

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
          <span className="inline-block bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">✅ Now Enrolling — 2026</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Enrol Your Child <span className="text-secondary">Today</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">PIR Cricket Academy is now open in Patna. Register your child for the 2026 season — batches are forming now.</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="bg-card border border-secondary/20 rounded-2xl p-8 md:p-10 shadow-xl shadow-secondary/5">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wider mb-5">What Every Student Gets</h3>
              <ul className="space-y-4">
                {benefits.map(({icon:Icon,text},i) => (
                  <motion.li key={i} initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08}}
                    className="flex items-start gap-3">
                    <Icon className="h-5 w-5 shrink-0 mt-0.5 text-secondary" />
                    <span className="text-sm leading-relaxed text-foreground/80">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="font-display font-bold text-lg uppercase tracking-wider mb-4">Open Batches</h3>
                <div className="flex flex-wrap gap-2">
                  {batches.map(b => <span key={b} className="bg-secondary/10 text-secondary border border-secondary/30 rounded-lg px-4 py-2 text-sm font-bold">{b}</span>)}
                </div>
                <p className="text-muted-foreground text-xs mt-2">Morning & Evening · Patna, Bihar</p>
              </div>

              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-600 dark:text-green-400 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2"><CheckCircle className="h-4 w-4" />Academy is Open</p>
                <p className="text-muted-foreground text-sm">Admissions are open now. Batches are filling fast — register to secure your child's spot.</p>
              </div>

              <Link href="/admissions" className="w-full bg-secondary text-secondary-foreground font-bold uppercase tracking-wide py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] text-base text-center block">
                Apply for Admission — Free
              </Link>
              <a href="tel:+918936061688" className="flex items-center justify-center gap-2 text-center text-muted-foreground text-xs hover:text-secondary transition-colors">
                <Phone className="h-3.5 w-3.5" /> +91 89360 61688 · Free registration · Seat confirmed within 24 hours
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
