import { motion } from "framer-motion";
import { Trophy, CheckCircle, Quote, Shield, Star, Heart, Lightbulb } from "lucide-react";

const indrajitStats = [
  { label: "FC Matches", value: "13" },
  { label: "FC Runs", value: "738" },
  { label: "Highest Score", value: "222*" },
  { label: "Batting Avg", value: "43.41" },
  { label: "Centuries", value: "2" },
  { label: "Fifties", value: "2" },
];

const founders = [
  {
    initials: "IK",
    name: "Indrajit Kumar",
    role: "Founder & Mentor",
    roleColor: "text-secondary",
    photo: "/images/indrajit-portrait.jpeg",
    highlight: "Bihar's First Double Centurion in Ranji Trophy (Post 2018 BCCI Affiliation)",
    credentials: [
      "Right-hand Bat · Right-arm Medium · Bihar",
      "Born: October 21, 1987 · Patna, Bihar",
      "Academy vision, curriculum & player development",
    ],
    showStats: true,
  },
  {
    initials: "PM",
    name: "Pankaj Mishra",
    role: "Co-Founder & Head Coach",
    roleColor: "text-secondary",
    photo: null,
    highlight: "BCCI Level A Certified Coach, Bihar Cricket Association",
    credentials: [
      "BCCI Level A Certified Coach",
      "Bihar Cricket Association affiliate",
      "Technical training & player assessment",
    ],
  },
  {
    initials: "RR",
    name: "Ritesh Ranjan",
    role: "Co-Founder & Coach",
    roleColor: "text-secondary",
    photo: null,
    highlight: "Patna University Cricket Player & Sports Promoter, Bihar",
    credentials: [
      "Patna University Cricket Player",
      "Sports Promoter, Bihar",
      "Ground operations & player welfare",
    ],
  },
];

export default function Founder() {
  return (
    <section id="founder" className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">The Minds Behind the Academy</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Built by Cricketers,<br /><span className="text-secondary">For Cricketers.</span></h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">Three partners. One mission — to build Bihar's finest cricket development academy from the ground up.</p>
        </motion.div>

        {/* Founder cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {founders.map(({ initials, name, role, roleColor, photo, highlight, credentials, showStats }: any, i: number) => (
            <motion.div key={name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="bg-card border border-secondary/20 rounded-2xl overflow-hidden flex flex-col">
              {/* Photo / Avatar */}
              {photo ? (
                <div className="relative h-56 overflow-hidden">
                  <img src={photo} alt={name} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-56 bg-secondary/5 flex items-center justify-center border-b border-border">
                  <div className="w-24 h-24 bg-secondary/15 border-2 border-secondary/40 rounded-full flex items-center justify-center font-display font-bold text-secondary text-3xl">{initials}</div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-3.5 w-3.5 text-secondary fill-secondary" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${roleColor}`}>{role}</span>
                </div>
                <p className="font-display font-bold text-xl text-foreground mb-2">{name}</p>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4 italic">"{highlight}"</p>
                {showStats && (
                  <div className="grid grid-cols-3 gap-1.5 mb-4 bg-secondary/5 rounded-xl p-3 border border-secondary/15">
                    {indrajitStats.map(s => (
                      <div key={s.label} className="text-center">
                        <p className="font-display font-bold text-secondary text-sm leading-none">{s.value}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5 leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <ul className="space-y-2 mt-auto">
                  {credentials.map((c: string) => (
                    <li key={c} className="flex items-start gap-2 text-xs text-foreground/70">
                      <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Advisory Panel */}
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-14">
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest">Advisory & Support</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Dr. V.P. Singh */}
            <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
              className="bg-card border border-red-500/20 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-red-900/30 to-red-950/10">
                {true ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-red-500/15 border-2 border-red-500/30 rounded-full flex items-center justify-center">
                      <Heart className="h-10 w-10 text-red-400" />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">Powered by Savera</span>
                </div>
                <p className="font-display font-bold text-lg text-foreground mb-1">Dr. V.P. Singh</p>
                <p className="text-red-400 text-xs font-semibold mb-3">Director, Savera Cancer & Multi Speciality Hospital</p>
                <ul className="space-y-1.5 mt-auto">
                  {["Savera Cancer & Multi Speciality Hospital", "Health · Healing · Hope", "Medical support partner for PIR Academy"].map(c => (
                    <li key={c} className="flex items-start gap-2 text-xs text-foreground/70">
                      <CheckCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Nikhil Singh */}
            <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.2}}
              className="bg-card border border-blue-500/20 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-900/30 to-blue-950/10">
                <div className="h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-500/15 border-2 border-blue-500/30 rounded-full flex items-center justify-center">
                    <Lightbulb className="h-10 w-10 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Technical Adviser</span>
                </div>
                <p className="font-display font-bold text-lg text-foreground mb-1">Nikhil Singh</p>
                <p className="text-blue-400 text-xs font-semibold mb-3">Technical Adviser, PIR Cricket Academy</p>
                <ul className="space-y-1.5 mt-auto">
                  {["Strategic & technical advisory", "Sports infrastructure development", "Growth & outreach planning"].map(c => (
                    <li key={c} className="flex items-start gap-2 text-xs text-foreground/70">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* Founder story + photos */}
        <div className="grid md:grid-cols-2 gap-12 items-start mb-10">
          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
            <div className="inline-flex items-center gap-2 bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-widest mb-5">
              <Trophy className="h-4 w-4" /> The Story Behind PIR
            </div>
            <p className="text-muted-foreground text-base leading-relaxed mb-4">
              PIR Cricket Academy was born from a shared conviction among three cricket professionals — that Bihar's young talent deserves a world-class environment to grow, be tracked, and be developed into champions.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-5">
              <strong className="text-foreground">Indrajit Kumar</strong>, Bihar's First Double Centurion in Ranji Trophy, brings the professional playing experience and vision. <strong className="text-foreground">Pankaj Mishra</strong>, BCCI Level A Certified Coach, brings elite coaching methodology. <strong className="text-foreground">Ritesh Ranjan</strong>, Patna University cricketer and sports promoter, drives operations and outreach.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              Together they are building the kind of academy none of them had access to when they were starting out.
            </p>

            {/* Partners strip */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-secondary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Partners & Affiliations</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-foreground/70 bg-secondary/5 rounded-lg px-3 py-2">
                  <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Under the Aegis of</strong> S.P Sports & Cultural Foundation</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-foreground/70 bg-secondary/5 rounded-lg px-3 py-2">
                  <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Powered by</strong> Savera Cancer & Multi Speciality Hospital</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-foreground/70 bg-secondary/5 rounded-lg px-3 py-2">
                  <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Technical Adviser:</strong> Nikhil Singh</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="space-y-4">
            {/* Century photo */}
            <div className="rounded-2xl overflow-hidden border border-secondary/20 relative">
              <img src="/images/indrajit-century.jpeg" alt="Indrajit Kumar celebrating his double century" className="w-full h-64 object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-sm">Bihar's First Double Centurion</p>
                <p className="text-secondary text-xs font-semibold">Ranji Trophy — Post 2018 BCCI Affiliation</p>
              </div>
            </div>

            {/* Ranji award photo */}
            <div className="rounded-2xl overflow-hidden border border-border relative">
              <img src="/images/ranji-award.jpeg" alt="Ranji Trophy 2019-20 award ceremony" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-sm">Ranji Trophy 2019–20</p>
                <p className="text-white/60 text-xs">Award Ceremony, Balurghat Stadium</p>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Quote className="h-8 w-8 text-secondary mb-3" />
              <p className="text-foreground/80 text-base leading-relaxed italic">
                "We didn't just build an academy. We built the system we wish we had — structured, transparent, and built to take Bihar's best to the national stage."
              </p>
              <p className="text-secondary font-bold text-sm mt-3 uppercase tracking-wide">— The PIR Founding Partners</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
