import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    role: "Parent of Aryan, 12 yrs — Junior Batch",
    avatar: "RK",
    color: "bg-blue-500",
    stars: 5,
    quote: "Before PIR, my son had coaching from three different coaches and every coach had a different style. Here the curriculum is fixed — every session has a plan. In 6 months his batting technique improved so much that his school team selected him as opener.",
  },
  {
    name: "Priya Singh",
    role: "Parent of Riya, 9 yrs — Foundation Batch",
    avatar: "PS",
    color: "bg-purple-500",
    stars: 5,
    quote: "I was worried about my daughter joining cricket — a sport usually dominated by boys. The coaches here are so encouraging. She comes home excited after every session. The soft-ball approach for U10 is exactly right — she is building confidence, not fear.",
  },
  {
    name: "Amit Verma",
    role: "Parent of Rohit, 16 yrs — Youth Batch",
    avatar: "AV",
    color: "bg-emerald-500",
    stars: 5,
    quote: "My son was bowling wrong for 3 years — no coach ever corrected him. Within 2 months at PIR, the bowling action was completely fixed using video analysis. The BCCI-aligned curriculum and HD video review is something I never expected in Patna. Truly world-class.",
  },
  {
    name: "Sunita Jha",
    role: "Parent of Vivek, 14 yrs — Junior Batch",
    avatar: "SJ",
    color: "bg-orange-500",
    stars: 5,
    quote: "The QR attendance system, the student portal, progress reports shared digitally — this is not just a coaching academy, this is a professionally run sports institution. My son can see his own attendance and performance online. That accountability has made him more serious.",
  },
  {
    name: "Deepak Mishra",
    role: "Parent of Karan, 18 yrs — Senior Batch",
    avatar: "DM",
    color: "bg-red-500",
    stars: 5,
    quote: "Karan was already playing district level but needed elite training. The strength & conditioning programme, wearable sensor analysis, and sports psychology sessions here are on par with what I have read about state academies. He has improved his pace by 8 kph since joining.",
  },
  {
    name: "Meena Pandey",
    role: "Parent of Sachin, 11 yrs — Junior Batch",
    avatar: "MP",
    color: "bg-yellow-500",
    stars: 5,
    quote: "The founding batch experience has been wonderful. Indrajit sir personally knows every student's name and their specific weaknesses. The fee structure is very fair for the quality of training provided. I have already recommended PIR to 4 other families in our colony.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIdx(i => (i + 1) % TESTIMONIALS.length);
  const t = TESTIMONIALS[idx];

  return (
    <section className="py-20 bg-gradient-to-b from-card/30 to-background" id="testimonials">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            Parent Reviews
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            What <span className="text-secondary">Families Say</span>
          </h2>
          <p className="text-muted-foreground mt-2">Real feedback from parents of enrolled students</p>
        </motion.div>

        <div className="relative">
          {/* Main testimonial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-3xl p-8 md:p-12 relative"
            >
              <Quote className="absolute top-6 right-8 h-16 w-16 text-secondary/8" />
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl ${t.color} flex items-center justify-center font-black text-white text-lg shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                  <Stars count={t.stars} />
                </div>
              </div>
              <p className="text-foreground/90 text-lg leading-relaxed italic">"{t.quote}"</p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={prev}
              className="w-11 h-11 rounded-xl border border-border bg-card hover:border-secondary/40 hover:bg-secondary/5 flex items-center justify-center transition-all">
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "bg-secondary w-6" : "bg-border w-2 hover:bg-secondary/40"}`} />
              ))}
            </div>

            <button onClick={next}
              className="w-11 h-11 rounded-xl border border-border bg-card hover:border-secondary/40 hover:bg-secondary/5 flex items-center justify-center transition-all">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mini cards row */}
        <div className="hidden md:grid grid-cols-3 gap-4 mt-8">
          {TESTIMONIALS.slice(0, 3).map((item, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`text-left p-4 rounded-2xl border transition-all ${i === idx ? "border-secondary/50 bg-secondary/5" : "border-border bg-card/50 hover:border-border/60"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center font-bold text-white text-xs`}>{item.avatar}</div>
                <div>
                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                  <Stars count={item.stars} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">"{item.quote}"</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
