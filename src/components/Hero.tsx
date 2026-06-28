import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, ChevronRight } from "lucide-react";

const LAUNCH = new Date("2026-08-01T00:00:00+05:30");

function pad(n: number) { return String(n).padStart(2, "0"); }

function useCountdown() {
  const calc = () => {
    const d = LAUNCH.getTime() - Date.now();
    if (d <= 0) return { days:0, hours:0, minutes:0, seconds:0, done:true };
    return { days: Math.floor(d/86400000), hours: Math.floor(d/3600000)%24, minutes: Math.floor(d/60000)%60, seconds: Math.floor(d/1000)%60, done:false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}

function Box({ val, label }: { val: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/60 backdrop-blur-sm border border-secondary/40 rounded-xl w-[72px] h-[72px] md:w-[88px] md:h-[88px] flex items-center justify-center">
        <span className="text-3xl md:text-4xl font-display font-bold text-secondary tabular-nums">{pad(val)}</span>
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-widest text-white/50 font-semibold">{label}</span>
    </div>
  );
}

export default function Hero() {
  const { days, hours, minutes, seconds, done } = useCountdown();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/images/indrajit-century.jpeg" alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-950/90 to-slate-900/95" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #eab308 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1e40af 0%, transparent 50%)" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl">

        {/* Partner badge */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="mb-4 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 border border-white/20 bg-white/5 text-white/60 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            Under the Aegis of S.P Sports & Cultural Foundation
          </span>
          <span className="inline-flex items-center gap-1.5 border border-white/20 bg-white/5 text-white/60 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            Powered by Savera Cancer Hospital
          </span>
        </motion.div>

        {/* Founder badge */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.1}} className="mb-5">
          <span className="inline-flex items-center gap-2 border border-secondary/40 bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
            <Trophy className="h-4 w-4" /> Bihar's First Double Centurion in Ranji Trophy
          </span>
        </motion.div>

        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.15}} className="font-display text-5xl md:text-7xl font-bold text-white leading-tight tracking-tighter mb-3">
          Forge Your Legacy
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-200">on the Pitch.</span>
        </motion.h1>

        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.22}} className="text-white/50 italic text-base md:text-lg mb-3">
          "From the Soil of Bihar, to the Stadiums of India"
        </motion.p>

        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.25}} className="text-secondary/90 font-semibold uppercase tracking-widest text-sm mb-3">
          Expert BCCI Coaches • Video Analysis • Strength & Fitness
        </motion.p>

        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.3}} className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          {done ? "PIR Cricket Academy is now open. Enrol today." : "Opening August/September 2026 in Patna, Bihar. Early Admissions Now Open — Founding Batch Seats Limited."}
        </motion.p>

        {!done && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.4}} className="mb-10">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Academy Opening In</p>
            <div className="flex items-start justify-center gap-3 md:gap-4">
              <Box val={days} label="Days" />
              <span className="text-secondary text-2xl font-bold mt-5">:</span>
              <Box val={hours} label="Hours" />
              <span className="text-secondary text-2xl font-bold mt-5">:</span>
              <Box val={minutes} label="Mins" />
              <span className="text-secondary text-2xl font-bold mt-5">:</span>
              <Box val={seconds} label="Secs" />
            </div>
          </motion.div>
        )}

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.5}} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/admissions" className="bg-secondary text-secondary-foreground font-bold uppercase tracking-wide text-base px-8 py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)]">
            Apply for Admission — Free
          </Link>
          <button onClick={() => go("founding-batch")} className="border border-white/30 text-white font-bold uppercase tracking-wide text-base px-8 py-4 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
            Founding Batch Benefits <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Address strip */}
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}} className="mt-8 text-white/30 text-xs uppercase tracking-widest">
          Sector-A, Police Colony, Anisabad, Patna – 800002, Bihar
        </motion.p>
      </div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-white/30 text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <motion.div animate={{y:["-100%","200%"]}} transition={{repeat:Infinity,duration:1.5,ease:"linear"}} className="absolute inset-0 bg-secondary" />
        </div>
      </motion.div>
    </section>
  );
}
