import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Star, Award, CalendarCheck, MapPin } from "lucide-react";

interface Stat {
  icon: React.FC<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  sub: string;
  color: string;
}

const STATS: Stat[] = [
  { icon: Users,        value: 120, suffix: "+", label: "Students Enrolled",    sub: "Across all age groups",        color: "text-blue-400" },
  { icon: Award,        value: 4,   suffix: "",  label: "Certified Coaches",    sub: "BCCI L1 & L2 qualified",       color: "text-yellow-400" },
  { icon: CalendarCheck,value: 12,  suffix: "",  label: "Months Curriculum",    sub: "ICC · BCCI · ECB · CA aligned", color: "text-emerald-400" },
  { icon: Star,         value: 4,   suffix: "",  label: "Age Group Batches",    sub: "U8 · U12 · U16 · U19+",       color: "text-purple-400" },
  { icon: Trophy,       value: 98,  suffix: "%", label: "Parent Satisfaction",  sub: "Based on quarterly feedback",   color: "text-orange-400" },
  { icon: MapPin,       value: 1,   suffix: "",  label: "World-Class Facility", sub: "Anisabad, Patna — Bihar",       color: "text-red-400" },
];

function useCounter(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1600;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [active, target]);
  return count;
}

function StatCard({ stat, index, active }: { stat: Stat; index: number; active: boolean }) {
  const count = useCounter(stat.value, active);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <stat.icon className={`h-5 w-5 ${stat.color}`} />
      </div>
      <p className={`text-4xl font-black mb-1 ${stat.color}`}>
        {count}{stat.suffix}
      </p>
      <p className="font-bold text-foreground text-sm mb-1">{stat.label}</p>
      <p className="text-xs text-muted-foreground">{stat.sub}</p>
    </motion.div>
  );
}

export default function StatsCounter() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            PIR by the Numbers
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Why Families <span className="text-secondary">Trust PIR</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} active={active} />)}
        </div>
      </div>
    </section>
  );
}
