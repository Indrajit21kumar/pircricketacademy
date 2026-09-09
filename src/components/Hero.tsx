import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, ChevronRight, BookOpen, Award, Calendar, Users, MapPin, Phone } from "lucide-react";

export default function Hero() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const [stats, setStats] = useState({ students: 0, batches: 0 });
  useEffect(() => {
    // Animate counters
    const target = { students: 40, batches: 4 };
    let frame = 0;
    const total = 60;
    const id = setInterval(() => {
      frame++;
      setStats({
        students: Math.round((target.students * frame) / total),
        batches: Math.round((target.batches * frame) / total),
      });
      if (frame >= total) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/pir-facility-collage.png" alt="" className="w-full h-full object-cover object-left" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 10% 90%, #eab308 0%, transparent 40%), radial-gradient(circle at 90% 10%, #1e3a8a 0%, transparent 40%)" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl">

        {/* Partner badges */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="mb-6 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 border border-secondary/30 bg-black/40 text-white/80 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-lg">
            Under the Aegis of S.P Sports & Cultural Foundation
          </span>
          <span className="inline-flex items-center gap-1.5 border border-secondary/30 bg-black/40 text-white/80 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-lg">
            Powered by Savera Cancer Hospital
          </span>
        </motion.div>

        {/* "Now Open" badge */}
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.5,delay:0.1}} className="mb-5">
          <span className="inline-flex items-center gap-2 bg-green-500 text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-[0_0_24px_rgba(34,197,94,0.5)]">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block"/>
            Now Open — Patna, Bihar
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.15}}
          className="font-display text-5xl md:text-7xl font-bold text-white leading-tight tracking-tighter mb-4"
          style={{ textShadow: "0 4px 24px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)" }}
        >
          Forge Your Legacy
          <br />
          <span className="text-secondary" style={{ textShadow: "0 4px 24px rgba(234,179,8,0.5), 0 2px 8px rgba(0,0,0,0.9)" }}>
            on the Pitch.
          </span>
        </motion.h1>

        {/* Quote */}
        <motion.p
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.25}}
          className="text-white/80 italic text-base md:text-lg mb-5 font-medium"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
        >
          "From the Soil of Bihar, to the Stadiums of India"
        </motion.p>

        {/* Feature pills */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.28}} className="flex flex-wrap justify-center gap-2 mb-6">
          {["Expert BCCI Coaches", "HD Video Analysis", "Strength & Fitness", "Bowling Machine", "Night Practice Available"].map(f => (
            <span key={f} className="bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
              {f}
            </span>
          ))}
        </motion.div>

        {/* Curriculum card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32 }}
          className="mb-7"
        >
          <div className="relative inline-block w-full max-w-2xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-secondary via-yellow-300 to-secondary opacity-60 blur-sm" />
            <div className="relative bg-black/80 backdrop-blur-md rounded-2xl border border-secondary/50 px-5 py-4 shadow-[0_0_40px_rgba(234,179,8,0.25)]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Award className="h-4 w-4 text-secondary fill-secondary/30" />
                <span className="text-secondary font-extrabold text-xs uppercase tracking-[0.2em]">★ First in Bihar ★</span>
                <Award className="h-4 w-4 text-secondary fill-secondary/30" />
              </div>
              <p className="text-white font-bold text-base md:text-lg mb-3 leading-tight">
                Bihar's First Globally-Benchmarked<br />
                <span className="text-secondary">Structured Cricket Curriculum</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {[
                  { icon: Users,    val: "4",    sub: "Age Groups",    detail: "U8 · U12 · U16 · U19+" },
                  { icon: Calendar, val: "12",   sub: "Months",        detail: "Sep 2026 – Aug 2027" },
                  { icon: BookOpen, val: "3–4",  sub: "Sessions/Week", detail: "Structured & documented" },
                  { icon: Trophy,   val: "ICC+", sub: "Benchmarked",   detail: "BCCI · ECB · Cricket Australia" },
                ].map(({ icon: Icon, val, sub, detail }) => (
                  <div key={sub} className="flex flex-col items-center bg-secondary/10 border border-secondary/30 rounded-xl px-2 py-2">
                    <Icon className="h-4 w-4 text-secondary mb-1" />
                    <span className="text-secondary font-extrabold text-xl leading-none">{val}</span>
                    <span className="text-white/90 font-semibold text-[10px] mt-0.5 uppercase tracking-wide">{sub}</span>
                    <span className="text-white/50 text-[9px] mt-0.5 text-center">{detail}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-[11px] mb-3">
                Every session is documented — coaches follow the same plan so your child's training is consistent, transparent, and progressive.
              </p>
              <Link
                href="/curriculum"
                className="inline-flex items-center gap-1.5 bg-secondary text-black font-bold uppercase tracking-widest text-xs px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
              >
                <BookOpen className="h-3.5 w-3.5" />
                View Full Curriculum <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.5}} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/admissions" className="bg-secondary text-black font-bold uppercase tracking-wide text-base px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)]">
            Apply for Admission — Free
          </Link>
          <button onClick={() => go("fees")} className="border-2 border-white/50 text-white font-bold uppercase tracking-wide text-base px-8 py-4 rounded-xl hover:bg-white/15 hover:border-white/80 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
            View Fee Structure <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Address + Phone strip */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}} className="flex flex-wrap justify-center gap-3">
          <div className="inline-flex items-center gap-2 bg-black/50 border border-white/20 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg">
            <MapPin className="h-4 w-4 text-secondary shrink-0" />
            <span className="text-white font-semibold text-sm tracking-wide" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
              Sector-A, Police Colony, Anisabad, Patna – 800002
            </span>
          </div>
          <a href="tel:+918936061688" className="inline-flex items-center gap-2 bg-black/50 border border-white/20 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg hover:border-secondary/50 transition-colors">
            <Phone className="h-4 w-4 text-secondary shrink-0" />
            <span className="text-white font-semibold text-sm tracking-wide">+91 89360 61688</span>
          </a>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-white/40 text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <motion.div animate={{y:["-100%","200%"]}} transition={{repeat:Infinity,duration:1.5,ease:"linear"}} className="absolute inset-0 bg-secondary" />
        </div>
      </motion.div>
    </section>
  );
}
