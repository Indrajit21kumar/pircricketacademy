import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Trophy, QrCode, FileText, MessageCircle, BarChart3, CheckCircle, ArrowRight, Video } from "lucide-react";

const pathway = ["Beginner","Foundation","Development","Competitive","Elite","District Aspirant","State Aspirant"];
const tech = [
  {icon:QrCode,title:"QR Attendance",desc:"Every session tracked digitally. Parents get instant WhatsApp alerts when child is absent."},
  {icon:FileText,title:"Monthly Report Cards",desc:"Batting, bowling, fielding, fitness ratings every month. PDF available for download."},
  {icon:Video,title:"Video Analysis",desc:"Coach-annotated video clips of technique. Player video timeline from Day 1."},
  {icon:BarChart3,title:"Performance Tracking",desc:"Every skill rating logged and charted. Clear progress visible over time."},
];
const parent = ["Monthly attendance reports","Skill ratings — batting, bowling, fielding, fitness","Coach comments every month","WhatsApp alerts for attendance and fees","Digital receipts for every payment","Parent portal with real-time updates"];

export default function WhyPIR() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-16 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.span initial={{opacity:0}} animate={{opacity:1}} className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-6">Why Choose PIR?</motion.span>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="font-display text-5xl md:text-6xl font-bold mb-5 leading-tight">
            More Than Coaching.<br /><span className="text-secondary">A Complete Journey.</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="text-muted-foreground text-lg mb-8">From Beginner to State Aspirant — structured, tracked, supported every step.</motion.p>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions" className="bg-secondary text-secondary-foreground font-bold uppercase px-8 py-4 rounded-xl hover:bg-secondary/90 transition-all text-base">Apply for Founding Batch</Link>
            <Link href="/" className="border border-border text-foreground font-bold uppercase px-8 py-4 rounded-xl hover:border-secondary/40 transition-all text-base">Book a Trial Session</Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Structured Development Pathway</h2>
            <p className="text-muted-foreground text-lg">We don't just coach cricket. We develop cricketers.</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {pathway.map((s,i)=>(
              <div key={s} className="flex items-center gap-2">
                <motion.span initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}} className="bg-secondary/10 border border-secondary/30 text-secondary font-bold text-sm rounded-lg px-4 py-2">{s}</motion.span>
                {i<pathway.length-1&&<ArrowRight className="h-4 w-4 text-secondary/40 shrink-0"/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
              <div className="inline-flex items-center gap-2 bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-widest mb-5"><Trophy className="h-4 w-4"/>Founded by a Ranji Trophy Cricketer</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Learn From Experience. Train For Excellence.</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">PIR Cricket Academy is founded by <strong className="text-foreground">Indrajit Kumar</strong>, a former Bihar Ranji Trophy cricketer. Every training method, curriculum, and development pathway has been designed from first-hand professional experience.</p>
              <p className="text-muted-foreground leading-relaxed">This is not generic coaching. This is professional cricket knowledge passed directly to the next generation of Bihar cricketers.</p>
            </motion.div>
            <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="bg-card border border-secondary/20 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-secondary/10 border-2 border-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trophy className="h-10 w-10 text-secondary"/></div>
              <p className="font-display font-bold text-2xl">Indrajit Kumar</p>
              <p className="text-secondary font-semibold text-sm uppercase tracking-wider mt-1">Founder & Mentor</p>
              <div className="mt-5 space-y-2 text-left">
                {["Bihar's First Double Centurion in Ranji Trophy (Post 2018 BCCI Affiliation)","Former Bihar Ranji Trophy Cricketer — State Level","Expert in Structured Player Development","Curriculum Designed from First-Hand Professional Experience"].map(i=>(
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-secondary shrink-0"/>{i}</div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Technology-Enabled Coaching</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">PIR is one of the very few academies in Bihar with full digital coaching infrastructure.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {tech.map(({icon:Icon,title,desc},i)=>(
              <motion.div key={title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="bg-card border border-border rounded-xl p-6 flex gap-4 hover:border-secondary/40 transition-colors">
                <div className="bg-secondary/10 rounded-lg p-3 shrink-0"><Icon className="h-6 w-6 text-secondary"/></div>
                <div><p className="font-bold mb-1">{title}</p><p className="text-muted-foreground text-sm leading-relaxed">{desc}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Full Transparency for Parents</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">No surprises. No guessing. Full visibility at every step.</p>
              <ul className="space-y-3">{parent.map(f=><li key={f} className="flex items-center gap-3 text-sm"><CheckCircle className="h-4 w-4 text-secondary shrink-0"/>{f}</li>)}</ul>
            </motion.div>
            <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="bg-card border border-border rounded-2xl p-8">
              <MessageCircle className="h-10 w-10 text-secondary mb-4"/>
              <p className="font-display font-bold text-xl mb-2">Parent Portal</p>
              <p className="text-muted-foreground text-sm mb-5">Log in from your phone. See attendance, performance, fees — all in one place.</p>
              {["Attendance calendar","Monthly report cards","Fee status & payment","WhatsApp notifications"].map(i=>(
                <div key={i} className="flex items-center gap-2 text-sm bg-secondary/5 rounded-lg px-3 py-2 mb-2"><CheckCircle className="h-4 w-4 text-secondary shrink-0"/>{i}</div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Give Your Child the Best Start in Cricket</h2>
            <p className="text-muted-foreground text-lg mb-8">Founding Batch 2026 — Early Admissions Now Open. Seats Limited.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admissions" className="bg-secondary text-secondary-foreground font-bold uppercase px-8 py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.25)] text-base">Apply for Founding Batch 2026</Link>
              <Link href="/" className="border border-border text-foreground font-bold uppercase px-8 py-4 rounded-xl hover:border-secondary/40 transition-all text-base">Book a Trial Session</Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
