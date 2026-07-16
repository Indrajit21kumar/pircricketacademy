import { motion } from "framer-motion";
import { Clock, Sun, Sunset, Users, CheckCircle } from "lucide-react";

const BATCHES = [
  {
    time: "6:00 AM – 7:30 AM",
    slot: "Early Morning",
    icon: Sun,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Foundation U8", "Junior U12"],
    color: "border-yellow-500/30 bg-yellow-500/5",
    iconColor: "text-yellow-400",
  },
  {
    time: "7:30 AM – 9:30 AM",
    slot: "Morning",
    icon: Sun,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Youth U16", "Senior U19+"],
    color: "border-orange-500/30 bg-orange-500/5",
    iconColor: "text-orange-400",
  },
  {
    time: "4:00 PM – 5:30 PM",
    slot: "Evening",
    icon: Sunset,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Foundation U8", "Junior U12"],
    color: "border-blue-500/30 bg-blue-500/5",
    iconColor: "text-blue-400",
  },
  {
    time: "5:30 PM – 7:30 PM",
    slot: "Late Evening",
    icon: Sunset,
    days: "Mon · Tue · Wed · Thu · Fri",
    groups: ["Youth U16", "Senior U19+"],
    color: "border-purple-500/30 bg-purple-500/5",
    iconColor: "text-purple-400",
  },
  {
    time: "8:00 AM – 11:00 AM",
    slot: "Weekend Intensive",
    icon: Clock,
    days: "Saturday & Sunday",
    groups: ["All age groups", "Match simulation day"],
    color: "border-emerald-500/30 bg-emerald-500/5",
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
          className="text-center mb-4"
        >
          <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            2026–27 Schedule
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Batch <span className="text-secondary">Timings</span>
          </h2>
        </motion.div>

        {/* PIR allocates batches notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-10 bg-secondary/8 border border-secondary/25 rounded-xl px-5 py-4 text-center"
        >
          <p className="text-secondary font-bold text-sm mb-0.5 uppercase tracking-wide">Batch Allocation is PIR's Decision</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            After admission, our coaching team reviews each student's age, skill level, and schedule to assign the most suitable batch.
            This ensures balanced groups and the best training environment for every player.
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
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <b.icon className={`h-4 w-4 ${b.iconColor}`} />
                  <span className={`text-xs font-black uppercase tracking-wider ${b.iconColor}`}>{b.slot}</span>
                </div>
                <p className="text-xl font-black text-white">{b.time}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.days}</p>
              </div>

              <div>
                {b.groups.map(g => (
                  <div key={g} className="flex items-center gap-2 text-sm text-foreground/80 mb-1">
                    <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${b.iconColor}`} />
                    {g}
                  </div>
                ))}
              </div>
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
          <a href="https://wa.me/918936061688?text=Hi%2C+I+want+to+enquire+about+batch+details+at+PIR+Cricket+Academy"
            target="_blank" rel="noreferrer"
            className="text-secondary font-bold text-sm hover:underline">
            WhatsApp for batch enquiries →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
