import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, ChevronRight, Zap } from "lucide-react";

const LAUNCH = new Date("2026-08-20T00:00:00+05:30");

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

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/images/pir-facility-collage.png" alt="" className="w-full h-full object-cover object-left" />
        {/* Multi-layer overlay for depth + readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0,0,0,0.55) 0%, transparent 100%)" }} />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 10% 90%, #eab308 0%, transparent 40%), radial-gradient(circle at 90% 10%, #1e3a8a 0%, transparent 40%)" }} />
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
          className="text-white/80 italic text-base md:text-lg mb-4 font-medium"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
        >
          "From the Soil of Bihar, to the Stadiums of India"
        </motion.p>

        {/* Feature pills */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.3}} className="flex flex-wrap justify-center gap-2 mb-5">
          {["Expert BCCI Coaches", "HD Video Analysis", "Strength & Fitness", "Bowling Machine", "Night Practice Available"].map(f => (
            <span key={f} className="bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
              {f}
            </span>
          ))}
        </motion.div>

        {/* Discount highlight strip */}
        {!done && (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.32}} className="mb-6">
            <div className="inline-block bg-black/60 backdrop-blur-md border border-secondary/50 rounded-2xl px-5 py-3 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-secondary fill-secondary" />
                <span className="text-secondary font-bold text-xs uppercase tracking-widest">Founding Batch Exclusive Savings</span>
                <Zap className="h-4 w-4 text-secondary fill-secondary" />
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {[
                  { label: "3-Month Pack", pct: "35%", sub: "25% + 10%" },
                  { label: "6-Month Pack", pct: "40%", sub: "25% + 15%" },
                  { label: "12-Month Pack", pct: "45%", sub: "25% + 20%" },
                ].map(({ label, pct, sub }) => (
                  <div key={label} className="flex flex-col items-center bg-secondary/10 border border-secondary/30 rounded-xl px-4 py-2">
                    <span className="text-secondary font-bold text-xl leading-none">{pct} OFF</span>
                    <span className="text-white/60 text-[10px] mt-0.5">{sub} on tuition</span>
                    <span className="text-white/50 text-[10px]">{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-[10px] text-center mt-2">Discounts apply on monthly tuition only · Reg ₹5,000 &amp; Kit ₹2,000 are fixed · Max 2 discounts per student</p>
            </div>
          </motion.div>
        )}

        {/* Sub-text */}
        <motion.p
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.35}}
          className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
        >
          {done
            ? "PIR Cricket Academy is now open. Enrol today."
            : "Coming Soon in Patna, Bihar. Early Admissions Now Open — Founding Batch Seats Limited."}
        </motion.p>

        {/* Countdown */}
        {!done && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.4}} className="mb-10">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-4 font-semibold">Academy Opening In</p>
            <div className="inline-flex items-start gap-2 md:gap-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 shadow-2xl">
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

        {/* CTA buttons */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.5}} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/admissions" className="bg-secondary text-black font-bold uppercase tracking-wide text-base px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)]">
            Apply for Admission — Free
          </Link>
          <button onClick={() => go("founding-batch")} className="border-2 border-white/50 text-white font-bold uppercase tracking-wide text-base px-8 py-4 rounded-xl hover:bg-white/15 hover:border-white/80 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
            Founding Batch Benefits <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Address strip */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9}} className="mt-8 inline-flex items-center gap-2 bg-black/50 border border-white/20 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary shrink-0" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.218-4.402 3.218-6.853C19.5 6.351 16.165 3 12 3s-7.5 3.351-7.5 7.47c0 2.45 1.274 4.773 3.218 6.853a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742z" clipRule="evenodd" /></svg>
          <span className="text-white font-semibold text-sm tracking-wide" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
            Sector-A, Police Colony, Anisabad, Patna – 800002, Bihar
          </span>
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
