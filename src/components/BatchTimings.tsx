import { motion } from "framer-motion";
import { Clock, Sun, Sunset, Users, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const BATCHES = [
  {
    time: "6:00 AM – 7:30 AM",
    slot: "Early Morning",
    icon: Sun,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Foundation U10", "Junior U14"],
    seats: 8,
    color: "border-yellow-500/30 bg-yellow-500/5",
    badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    iconColor: "text-yellow-400",
  },
  {
    time: "7:30 AM – 9:30 AM",
    slot: "Morning",
    icon: Sun,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Youth U17", "Senior U19+"],
    seats: 6,
    color: "border-orange-500/30 bg-orange-500/5",
    badge: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    iconColor: "text-orange-400",
  },
  {
    time: "4:00 PM – 5:30 PM",
    slot: "Evening",
    icon: Sunset,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Foundation U10", "Junior U14"],
    seats: 10,
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    iconColor: "text-blue-400",
  },
  {
    time: "5:30 PM – 7:30 PM",
    slot: "Late Evening",
    icon: Sunset,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Youth U17", "Senior U19+"],
    seats: 5,
    color: "border-purple-500/30 bg-purple-500/5",
    badge: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    iconColor: "text-purple-400",
  },
  {
    time: "8:00 AM – 11:00 AM",
    slot: "Weekend Intensive",
    icon: Clock,
    days: "Saturday & Sunday",
    groups: ["All age groups", "Match simulation day"],
    seats: 20,
    color: "border-emerald-500/30 bg-emerald-500/5",
    badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    iconColor: "text-emerald-400",
  },
];

export default function BatchTimings() {
  return (
    <section className="py-20 bg-background" id="timings">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            2026–27 Schedule
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Batch <span className="text-secondary">Timings</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Choose a batch that fits your schedule. Limited seats per batch ensure every student gets individual attention.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BATCHES.map((b, i) => (
            <motion.div
              key={b.slot}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border p-6 ${b.color} flex flex-col gap-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <b.icon className={`h-4 w-4 ${b.iconColor}`} />
                    <span className={`text-xs font-black uppercase tracking-wider ${b.iconColor}`}>{b.slot}</span>
                  </div>
                  <p className="text-xl font-black text-white">{b.time}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.days}</p>
                </div>
                <div className={`text-center px-3 py-1.5 rounded-xl border text-xs font-bold ${b.badge}`}>
                  <p className="text-lg font-black">{b.seats}</p>
                  <p className="text-[10px] leading-tight">seats left</p>
                </div>
              </div>

              <div>
                {b.groups.map(g => (
                  <div key={g} className="flex items-center gap-2 text-sm text-foreground/80 mb-1">
                    <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${b.iconColor}`} />
                    {g}
                  </div>
                ))}
              </div>

              <Link href="/admissions"
                className="mt-auto w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Book This Slot
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="h-4 w-4 text-secondary" />
            Max 15 students per batch · Individual attention guaranteed
          </div>
          <span className="hidden sm:block text-border">·</span>
          <a href="https://wa.me/918936061688?text=Hi%2C+I+want+to+know+about+batch+availability+at+PIR+Cricket+Academy"
            target="_blank" rel="noreferrer"
            className="text-secondary font-bold text-sm hover:underline">
            WhatsApp to check availability →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
