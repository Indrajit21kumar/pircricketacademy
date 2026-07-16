import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, CheckCircle, Globe, Shield, BookOpen, Dumbbell, Target, Users } from "lucide-react";
import {
  ALL_GROUPS, STANDARDS, PHASE_COLORS, ACCENT_CLASSES, ACADEMIC_YEAR,
} from "@/data/curriculum";
import type { AgeGroupData } from "@/data/curriculum";

// ─── Auth gate ────────────────────────────────────────────────────────────────
function getRole(): string | null {
  try {
    if (localStorage.getItem("pir_admin_token"))      return "admin";
    if (localStorage.getItem("pir_coach_token"))      return "coach";
    if (localStorage.getItem("pir_reception_token"))  return "receptionist";
    if (sessionStorage.getItem("pir_student_session")) return "student";
  } catch { /* storage blocked */ }
  return null;
}

function NotLoggedIn() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="h-7 w-7 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Members Only</h1>
        <p className="text-gray-400 text-sm mb-6">
          This curriculum is for enrolled students, coaches, and academy staff. Please log in to view it.
        </p>
        <div className="flex flex-col gap-3">
          <a href="/student" className="bg-yellow-500 text-black font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider">Student Login</a>
          <a href="/coach"   className="bg-white/10 text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider hover:bg-white/20">Coach Login</a>
          <a href="/admin"   className="bg-white/10 text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider hover:bg-white/20">Admin Login</a>
          <Link href="/" className="text-gray-500 text-xs mt-1 hover:text-gray-300">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

// ─── Weekly Sessions Tab ───────────────────────────────────────────────────────
function WeeklyTab({ group }: { group: AgeGroupData }) {
  const [openMonth, setOpenMonth] = useState(0);
  const month = group.months[openMonth];
  const pc = PHASE_COLORS[month.phaseColor] ?? PHASE_COLORS.blue;
  const acc = ACCENT_CLASSES[group.accentColor] ?? ACCENT_CLASSES.blue;

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex flex-wrap gap-2">
        {group.months.map((m, i) => (
          <button key={m.shortMonth} onClick={() => setOpenMonth(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              openMonth === i ? `${acc.active} border-2` : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
            }`}>
            {m.shortMonth}
          </button>
        ))}
      </div>

      {/* Phase badge + goal */}
      <div className={`rounded-2xl border p-4 ${pc.bg} ${pc.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border ${pc.text} ${pc.bg} ${pc.border}`}>
            {openMonth + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">{month.month}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pc.text} ${pc.bg} ${pc.border}`}>{month.phase}</span>
            </div>
            <p className="text-sm text-gray-300">{month.monthGoal}</p>
          </div>
        </div>
      </div>

      {/* Sessions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {month.sessions.map(s => (
          <div key={s.number} className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${pc.text} ${pc.bg} ${pc.border}`}>
                S{s.number}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{s.day}</p>
                <p className="text-xs text-muted-foreground">{s.label} · {s.duration}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                <Dumbbell className="h-3 w-3" /> Warm-Up
              </p>
              <ul className="space-y-1">
                {s.warmUp.map(w => (
                  <li key={w} className="text-xs text-gray-400 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                <BookOpen className="h-3 w-3" /> Main Work
              </p>
              <ul className="space-y-1.5">
                {s.mainWork.map(w => (
                  <li key={w} className="flex items-start gap-2 text-xs text-gray-300">
                    <CheckCircle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${pc.text}`} />
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-border/40 space-y-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <Target className="h-3 w-3" /> Game / Match Play
                </p>
                <p className="text-xs text-secondary font-semibold">{s.gamePlay}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <Users className="h-3 w-3" /> Coach Focus
                </p>
                <p className="text-xs text-gray-400 italic">{s.coachFocus}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment + standard */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Month-End Assessment</p>
          <p className="text-sm text-gray-300">{month.assessment}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Global Standard
          </p>
          <p className="text-sm text-gray-300">{month.globalStandard}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Monthly Plan Tab ──────────────────────────────────────────────────────────
function MonthlyTab({ group }: { group: AgeGroupData }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {group.months.map((m, i) => {
        const pc = PHASE_COLORS[m.phaseColor] ?? PHASE_COLORS.blue;
        const isOpen = openIdx === i;
        return (
          <div key={m.month} className={`rounded-2xl border overflow-hidden ${pc.border} ${isOpen ? "shadow-lg" : ""}`}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${pc.text} ${pc.bg} ${pc.border} border`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{m.month}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pc.text} ${pc.bg} ${pc.border}`}>{m.phase}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{m.monthGoal}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6 pt-2 border-t border-border/30 space-y-5">
                    {/* Sessions summary */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> {m.sessions.length} Sessions This Month
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {m.sessions.map(s => (
                          <div key={s.number} className={`rounded-xl border p-3 ${pc.bg} ${pc.border}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-black ${pc.text}`}>Session {s.number}</span>
                              <span className="text-xs text-muted-foreground">· {s.day} · {s.duration}</span>
                            </div>
                            <p className="text-sm font-semibold text-white mb-2">{s.label}</p>
                            <ul className="space-y-1">
                              {s.mainWork.slice(0, 3).map(w => (
                                <li key={w} className="flex items-start gap-1.5 text-xs text-gray-400">
                                  <CheckCircle className={`h-3 w-3 mt-0.5 shrink-0 ${pc.text}`} />
                                  {w}
                                </li>
                              ))}
                              {s.mainWork.length > 3 && (
                                <li className="text-xs text-muted-foreground pl-4">+{s.mainWork.length - 3} more drills</li>
                              )}
                            </ul>
                            <div className="mt-2 pt-2 border-t border-border/30">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Game Play</p>
                              <p className="text-xs text-secondary font-semibold mt-0.5 line-clamp-2">{s.gamePlay}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assessment + standard */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Month-End Assessment</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{m.assessment}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" /> Global Standard
                        </h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{m.globalStandard}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Curriculum() {
  const role = getRole();
  const [activeId, setActiveId] = useState<AgeGroupData["id"]>("foundation");
  const [view, setView] = useState<"monthly" | "weekly">("monthly");

  if (!role) return <NotLoggedIn />;

  const group = ALL_GROUPS.find(g => g.id === activeId)!;
  const acc = ACCENT_CLASSES[group.accentColor] ?? ACCENT_CLASSES.blue;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-28 pb-12 bg-gradient-to-b from-[#050b1a] to-background overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "radial-gradient(circle at 15% 55%, #eab308 0%, transparent 45%), radial-gradient(circle at 85% 45%, #1e40af 0%, transparent 45%)"
        }} />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {STANDARDS.map(s => {
                const pc = PHASE_COLORS[s.color] ?? PHASE_COLORS.blue;
                return (
                  <span key={s.org} className={`text-xs font-bold px-3 py-1 rounded-full border ${pc.text} ${pc.bg} ${pc.border}`}>
                    {s.org} Aligned
                  </span>
                );
              })}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3">
              Annual Practice <span className="text-secondary">Curriculum</span>
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto mb-2">
              Globally-benchmarked 12-month training plan · {ACADEMIC_YEAR}
            </p>
            <p className="text-gray-600 text-sm mb-6">ICC · BCCI · ECB · Cricket Australia frameworks delivered by certified coaches</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-6xl space-y-10">

        {/* Age Group Selector */}
        <div className="flex flex-wrap gap-3 justify-center">
          {ALL_GROUPS.map(g => {
            const a = ACCENT_CLASSES[g.accentColor] ?? ACCENT_CLASSES.blue;
            const active = g.id === activeId;
            return (
              <button key={g.id} onClick={() => setActiveId(g.id)}
                className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${active ? a.active + " shadow-lg" : a.tab}`}>
                {g.label} <span className="opacity-70 font-normal ml-1">{g.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Group info bar */}
        <motion.div key={activeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`rounded-2xl border p-5 md:p-6 ${PHASE_COLORS[group.accentColor]?.border ?? "border-border"}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">{group.label} <span className="text-muted-foreground font-normal text-base">· {group.tag} · {group.ageRange}</span></h2>
              <p className="text-muted-foreground text-sm mt-0.5">{group.desc}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Training days: {group.trainingDays.join(" · ")}</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-secondary font-black">{group.sessionsPerWeek}</p>
                <p className="text-xs text-muted-foreground">Sessions/week</p>
              </div>
              <div>
                <p className="text-secondary font-black">{group.sessionLength}</p>
                <p className="text-xs text-muted-foreground">Per session</p>
              </div>
              <div>
                <p className="text-secondary font-black">12</p>
                <p className="text-xs text-muted-foreground">Months</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* View switcher */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
          {(["monthly", "weekly"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${view === v ? "bg-secondary text-black" : "text-muted-foreground hover:text-foreground"}`}>
              {v === "monthly" ? "Monthly Overview" : "Session Detail"}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={`${activeId}-${view}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {view === "monthly" ? <MonthlyTab group={group} /> : <WeeklyTab group={group} />}
          </motion.div>
        </AnimatePresence>

        {/* Global Standards */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-6 text-center">Globally-Benchmarked Standards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {STANDARDS.map(s => {
              const pc = PHASE_COLORS[s.color] ?? PHASE_COLORS.blue;
              return (
                <div key={s.org} className={`rounded-2xl border p-6 ${pc.bg} ${pc.border}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-black text-base shrink-0 ${pc.text} ${pc.bg} ${pc.border}`}>
                      {s.org}
                    </div>
                    <div>
                      <p className="font-bold text-white">{s.full}</p>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{s.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


      </div>
      <Footer />
    </div>
  );
}
