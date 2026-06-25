import { motion } from "framer-motion";
import { ArrowRight, QrCode, FileText, MessageCircle, BarChart3 } from "lucide-react";
import { Link } from "wouter";

const pathway = ["Beginner","Foundation","Development","Competitive","Elite","District Aspirant","State Aspirant"];
const pillars = [
  { icon: BarChart3, title: "Structured Development", desc: "Proven pathway from beginner to state aspirant. Every skill tracked and improved." },
  { icon: QrCode, title: "Technology Coaching", desc: "QR attendance, digital performance tracking, monthly report cards — not just a net session." },
  { icon: FileText, title: "Monthly Reports", desc: "Batting, bowling, fielding, fitness ratings every month. Parents always know how their child is progressing." },
  { icon: MessageCircle, title: "Parent Transparency", desc: "WhatsApp alerts, parent portal, fee transparency. No surprises, full visibility." },
];

export default function WhyPIRSection() {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">Why PIR Cricket Academy?</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">More Than Coaching.<br /><span className="text-secondary">A Complete Cricket Development Journey.</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">From Beginner to State Aspirant — every step is structured, tracked, and supported.</p>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {pathway.map((s,i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="bg-secondary/10 border border-secondary/30 text-secondary font-bold text-xs rounded-lg px-3 py-1.5">{s}</span>
                {i < pathway.length-1 && <ArrowRight className="h-3 w-3 text-secondary/40 shrink-0" />}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {pillars.map(({icon:Icon,title,desc},i) => (
            <motion.div key={title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="bg-card border border-border rounded-xl p-6 flex gap-4 hover:border-secondary/40 transition-colors">
              <div className="bg-secondary/10 rounded-lg p-3 shrink-0 h-fit"><Icon className="h-6 w-6 text-secondary" /></div>
              <div><p className="font-bold text-foreground mb-1">{title}</p><p className="text-muted-foreground text-sm leading-relaxed">{desc}</p></div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/why-pir" className="inline-flex items-center gap-2 text-secondary font-bold uppercase tracking-wider text-sm hover:gap-3 transition-all">
            Learn More About PIR <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
