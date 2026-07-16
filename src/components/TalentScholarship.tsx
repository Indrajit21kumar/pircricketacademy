import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Star, ShieldCheck, Phone, CheckCircle, Flame } from "lucide-react";

const steps = [
  { icon: Phone,       step: "01", title: "Contact Us",         desc: "Call or WhatsApp us. Tell us about the child — age, location, situation. No paperwork needed at this stage." },
  { icon: Star,        step: "02", title: "Free Trial Session",  desc: "The child attends one free trial session. Our coaches assess natural talent, attitude, and desire to learn." },
  { icon: ShieldCheck, step: "03", title: "Scholarship Decision",desc: "If selected, PIR Academy covers 100% of training fees — zero cost to the family for the full season." },
  { icon: Heart,       step: "04", title: "Full Support",        desc: "Scholarship players receive the same coaching, curriculum, and attention as every other student — no difference." },
];

const criteria = [
  "Family income below the BPL threshold or documented financial hardship",
  "Age between 6 and 19 years",
  "Genuine passion and interest in cricket — desire matters more than current skill",
  "Available to attend scheduled sessions consistently",
  "Recommended by a teacher, community leader, or self-referred",
];

export default function TalentScholarship() {
  return (
    <section className="py-20 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
            <Heart className="h-3.5 w-3.5 fill-emerald-400/40" /> PIR Talent Scholarship
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Talent Has No <span className="text-secondary">Price Tag.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            If a child has the fire to play cricket but the family cannot afford the fees —
            <strong className="text-white"> PIR Cricket Academy will sponsor them 100%.</strong><br />
            No cost. No compromise. Same world-class training.
          </p>
        </motion.div>

        {/* Hero callout card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden mb-14"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-slate-900 to-secondary/10 border border-emerald-500/20 rounded-3xl" />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 w-28 h-28 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <Flame className="h-10 w-10 text-emerald-400 mb-1" />
              <span className="text-emerald-400 font-black text-2xl leading-none">100%</span>
              <span className="text-emerald-400/70 text-[10px] font-bold uppercase tracking-wider">Free</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                Full-Season Scholarship — Zero Fees
              </h3>
              <p className="text-white/70 text-base mb-4 leading-relaxed">
                Selected scholarship players pay <strong className="text-emerald-400">₹0 in training fees</strong> for the entire season.
                We believe Bihar's next Ranji Trophy star might be practising with a tape ball in a gully right now.
                We want to find that player and give them a real chance.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {["Training Fees Waived", "Same Coaches", "Same Curriculum", "Same Facilities"].map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="mb-14"
        >
          <h3 className="font-display text-2xl font-bold text-white text-center mb-8">How the Scholarship Works</h3>
          <div className="grid md:grid-cols-4 gap-5">
            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div key={step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative bg-card border border-border rounded-2xl p-5 hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-emerald-400/40 font-black text-4xl absolute top-4 right-5 leading-none">{step}</span>
                <p className="font-bold text-white text-sm mb-1">{title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Eligibility + CTA side by side */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Eligibility */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-7"
          >
            <h3 className="font-display text-lg font-bold text-white mb-5 uppercase tracking-wide">Who Can Apply</h3>
            <ul className="space-y-3">
              {criteria.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground text-xs mt-5 border-t border-border pt-4">
              Scholarships are limited each season. Applications reviewed on a rolling basis by the coaching panel.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/25 rounded-2xl p-7 flex flex-col justify-between"
          >
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-3 uppercase tracking-wide">Know a Talented Child?</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-5">
                If you know a child with real talent and a real need — a neighbour's child, a student, someone in your community —
                please reach out. One call could change a life.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-5">
                <p className="text-emerald-400 font-bold text-sm mb-0.5">Direct WhatsApp for Scholarship Enquiries</p>
                <p className="text-white font-black text-xl">+91 89360 61688</p>
                <p className="text-white/50 text-xs mt-1">Message "SCHOLARSHIP" — we respond within 24 hours</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/918936061688?text=Hi%2C+I+want+to+enquire+about+the+PIR+Talent+Scholarship+for+an+economically+weaker+section+player"
                target="_blank" rel="noreferrer"
                className="w-full bg-emerald-500 text-white font-black uppercase tracking-wider py-4 rounded-xl hover:bg-emerald-400 transition-all text-sm text-center shadow-[0_0_25px_rgba(16,185,129,0.35)]"
              >
                Apply for Scholarship via WhatsApp
              </a>
              <Link
                href="/admissions"
                className="w-full border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-emerald-500/10 transition-all text-sm text-center"
              >
                Fill Online Application
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="text-center mt-12 text-white/50 italic text-base max-w-xl mx-auto border-t border-border pt-8"
        >
          "A child's economic background should never determine their cricketing future.
          If they have talent and the will to work, PIR will take care of the rest."
          <br />
          <span className="not-italic font-bold text-white/70 text-sm mt-2 block">— Indrajit Kumar, Founder, PIR Cricket Academy</span>
        </motion.blockquote>

      </div>
    </section>
  );
}
