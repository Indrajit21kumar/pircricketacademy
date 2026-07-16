import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle, Users, Star, Trophy, BarChart3, Zap, Tag } from "lucide-react";

const benefits = [
  { icon: Tag,        text: "Founding Batch Pricing Locked In for the Full Season" },
  { icon: Users,      text: "Priority Batch Allocation — choose your preferred timing" },
  { icon: Star,       text: "Founding Student Recognition — lifetime academy record" },
  { icon: Trophy,     text: "Personalised Development Tracking from Day One" },
  { icon: BarChart3,  text: "QR Attendance, Monthly Report Cards & Parent Portal access" },
  { icon: CheckCircle,text: "Founding Batch Pricing Locked In for the Full Season" },
];

const batches = ["U8","U12","U16","U19","Elite"];

export default function FoundingBatch() {

  return (
    <section id="founding-batch" className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-4xl">

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">🎉 Founding Batch 2026</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Be Among the <span className="text-secondary">First Students</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">The founding batch sets the culture and standards of PIR Cricket Academy. These seats will not be available again at this stage.</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="bg-card border border-secondary/20 rounded-2xl p-8 md:p-10 shadow-xl shadow-secondary/5">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wider mb-5">Founding Batch Benefits</h3>
              <ul className="space-y-4">
                {benefits.map(({icon:Icon,text},i) => (
                  <motion.li key={i} initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08}}
                    className={`flex items-start gap-3 ${i===0 ? "bg-secondary/10 border border-secondary/30 rounded-xl px-3 py-2 -mx-3" : ""}`}>
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${i===0 ? "text-secondary" : "text-secondary"}`} />
                    <span className={`text-sm leading-relaxed ${i===0 ? "text-secondary font-bold" : "text-foreground/80"}`}>{text}</span>
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

              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <p className="text-destructive font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2"><Zap className="h-4 w-4" />Seats Limited</p>
                <p className="text-muted-foreground text-sm">Once founding batch is full, registrations move to a waitlist.</p>
              </div>

              <Link href="/admissions" className="w-full bg-secondary text-secondary-foreground font-bold uppercase tracking-wide py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] text-base text-center block">
                Apply for Founding Batch
              </Link>
              <p className="text-center text-muted-foreground text-xs">Free registration · No commitment · Seat confirmed within 24 hours</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
