import { motion } from "framer-motion";

const programs = [
  { age:"U8", name:"Fun & Fundamentals", color:"from-emerald-500/20 to-emerald-500/5", border:"border-emerald-500/30", badge:"bg-emerald-500/20 text-emerald-400",
    sessions:["Movement & Coordination","Basic Batting","Fielding & Throwing","Mini Match"],
    desc:"Building love for the game through fun activities and basic skills." },
  { age:"U12", name:"Skill Building", color:"from-blue-500/20 to-blue-500/5", border:"border-blue-500/30", badge:"bg-blue-500/20 text-blue-400",
    sessions:["Batting Foundation","Bowling & Fielding","Fitness & Running","Match Simulation"],
    desc:"Developing core cricket skills with structured drills and match practice." },
  { age:"U16", name:"Advanced Development", color:"from-purple-500/20 to-purple-500/5", border:"border-purple-500/30", badge:"bg-purple-500/20 text-purple-400",
    sessions:["Advanced Batting","Advanced Bowling","Strength & Conditioning","Match Scenarios"],
    desc:"Serious development for competitive cricketers aiming for district selection." },
  { age:"U19", name:"Performance Cricket", color:"from-orange-500/20 to-orange-500/5", border:"border-orange-500/30", badge:"bg-orange-500/20 text-orange-400",
    sessions:["Elite Batting","Elite Bowling","Athletic Development","Competitive Match"],
    desc:"High-level preparation for state-level and professional pathways." },
  { age:"Elite", name:"High Performance", color:"from-secondary/20 to-secondary/5", border:"border-secondary/30", badge:"bg-secondary/20 text-secondary",
    sessions:["Technical Training","Role-Based Training","Conditioning","High Performance Simulation"],
    desc:"For aspiring district and state players requiring professional-level coaching." },
];

export default function Programs() {
  return (
    <section id="programs" className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">Training Programs</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">4 Sessions Per Week<br /><span className="text-secondary">For Every Age Group</span></h2>
          <p className="text-muted-foreground text-lg">Every batch trains 4 days a week with a structured curriculum designed from professional cricket experience.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((p,i) => (
            <motion.div key={p.age} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className={`bg-gradient-to-b ${p.color} border ${p.border} rounded-2xl p-6 hover:scale-[1.02] transition-transform`}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`${p.badge} font-display font-bold text-2xl rounded-lg px-3 py-1`}>{p.age}</span>
                <div><p className="font-bold text-foreground">{p.name}</p></div>
              </div>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{p.desc}</p>
              <div className="space-y-2">
                {p.sessions.map((s,j) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary font-bold text-xs flex items-center justify-center shrink-0">{j+1}</span>
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* CTA card */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.4}}
            className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-4">
            <p className="font-display font-bold text-xl text-foreground">Not sure which program?</p>
            <p className="text-muted-foreground text-sm">Book a free trial session. Our coach will assess and recommend the right batch for your child.</p>
            <button onClick={() => document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})} className="bg-secondary text-secondary-foreground font-bold uppercase text-sm px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors w-full">
              Book Free Trial
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
