import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, Dumbbell, Video, Brain, Stethoscope, Users, Trophy, Layers, Zap, Target } from "lucide-react";

const worldClass = [
  { icon: Layers,      label: "Professional Turf Wicket",    desc: "Premium turf surface — near-match conditions for batting & bowling practice." },
  { icon: Video,       label: "HD Video Analysis",           desc: "Coach-annotated HD video clips of every session. Player timeline from Day 1." },
  { icon: Dumbbell,    label: "Strength & Fitness Centre",   desc: "Dedicated S&C zone with equipment tailored for cricketers at every level." },
  { icon: Zap,         label: "Bowling Machine Facility",     desc: "Professional bowling machine for pace, spin, and line-length training at all skill levels." },
  { icon: Target,      label: "Throw Ball Practice",         desc: "Dedicated throw-down sessions with trained throw-ball specialists for reflex and timing drills." },
  { icon: Brain,       label: "Mental Conditioning",         desc: "Sports psychology sessions to build focus, pressure handling and match mindset." },
  { icon: Stethoscope, label: "Sports Physio & Medical",     desc: "On-site physiotherapy and medical support to keep players fit and injury-free." },
  { icon: Users,       label: "Expert BCCI Coaches",         desc: "Certified BCCI coaches leading every session — structured, accountable, progressive." },
  { icon: Trophy,      label: "Tournament Exposure",         desc: "Regular inter-academy, district, and state-level tournament participation." },
];

const bookable = [
  { id:"box",    name:"Box Cricket Arena",   emoji:"🏟️",
    desc:"Fully enclosed box cricket arena with professional flooring, LED lighting, and safety netting.",
    pricing:[{slot:"Weekday",price:"₹1,500/hr"},{slot:"Weekend",price:"₹1,800/hr"},{slot:"Night",price:"₹2,200/hr"}],
    features:["Professional flooring","LED floodlights","Safety netting","Seating area","Change rooms"] },
  { id:"turf",   name:"Professional Turf Wicket", emoji:"🏏",
    desc:"Premium artificial turf wicket for realistic batting and bowling practice in near-match conditions.",
    pricing:[{slot:"Weekday",price:"₹800/hr"},{slot:"Weekend",price:"₹1,000/hr"}],
    features:["Artificial turf surface","Full pitch length","Bowling machine compatible","Practice nets","Coach available"] },
  { id:"cement", name:"Cement Wicket",       emoji:"⚡",
    desc:"Traditional cement wicket for pace and bounce training — essential for technique against fast bowling.",
    pricing:[{slot:"Weekday",price:"₹500/hr"},{slot:"Weekend",price:"₹700/hr"}],
    features:["Hard surface","True bounce","Pace development","Economical option","Available daily"] },
];

export default function Facilities() {
  return (
    <section id="facilities" className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">World-Class Facilities</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Everything a Champion<br /><span className="text-secondary">Needs, in Patna.</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">8 professional facilities under one roof — built to match the infrastructure of India's best cricket academies.</p>
        </motion.div>

        {/* 8 World-Class Facility tiles */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {worldClass.map(({ icon: Icon, label, desc }, i) => (
            <motion.div key={label} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.06}}
              className="bg-card border border-border rounded-xl p-5 hover:border-secondary/40 transition-colors group">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                <Icon className="h-5 w-5 text-secondary" />
              </div>
              <p className="font-bold text-sm mb-1.5">{label}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookable facilities */}
        <div className="text-center mb-10">
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">Book a Facility by the Hour</h3>
          <p className="text-muted-foreground">Transparent pricing. No hidden charges. Instant confirmation.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {bookable.map((f, i) => (
            <motion.div key={f.id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-secondary/40 transition-colors group">
              <div className="bg-gradient-to-br from-secondary/15 to-secondary/5 p-6 text-center">
                <span className="text-5xl mb-3 block">{f.emoji}</span>
                <h3 className="font-display font-bold text-xl text-foreground">{f.name}</h3>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{f.desc}</p>
                <div className="space-y-2 mb-5">
                  {f.pricing.map(p => (
                    <div key={p.slot} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{p.slot}</span>
                      <span className="font-bold text-secondary">{p.price}</span>
                    </div>
                  ))}
                </div>
                <ul className="space-y-1.5">
                  {f.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />{feat}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center">
          <Link href="/booking" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold uppercase tracking-wide px-8 py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.25)] text-base">
            <Calendar className="h-5 w-5" /> Book a Facility Now
          </Link>
          <p className="text-muted-foreground text-sm mt-3">Instant booking · Secure payment</p>
        </motion.div>
      </div>
    </section>
  );
}
