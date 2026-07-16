import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Download, ChevronDown, Trophy, Dumbbell, Target, Users, Video, Clock,
  Globe, BookOpen, Star, Shield, CheckCircle, Calendar
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGE_GROUPS = [
  { id: "foundation", label: "Foundation", age: "Ages 6–10", tag: "U10", accent: "emerald",
    desc: "Fun first. Skills next. Confidence always.", color: "#10b981" },
  { id: "junior",     label: "Junior",     age: "Ages 11–14", tag: "U14", accent: "blue",
    desc: "Building the technical foundations of a proper cricketer.", color: "#3b82f6" },
  { id: "youth",      label: "Youth",      age: "Ages 15–17", tag: "U17", accent: "purple",
    desc: "Technical mastery and competitive application.", color: "#a855f7" },
  { id: "senior",     label: "Senior / Elite", age: "Ages 18+", tag: "U19+", accent: "red",
    desc: "High-performance preparation for serious players.", color: "#ef4444" },
] as const;

type GroupId = "foundation" | "junior" | "youth" | "senior";

interface DayPlan {
  day: string; rest?: boolean; focus: string;
  icon: React.FC<{ className?: string }>;
  activities: string[]; keySkill: string;
}

const WEEKLY: Record<GroupId, DayPlan[]> = {
  foundation: [
    { day: "Sunday",    rest: true, focus: "Rest & Recovery", icon: Clock,
      activities: ["Light stretching at home", "Watch cricket highlight videos", "Active play outdoors"],
      keySkill: "Physical recovery" },
    { day: "Monday",    focus: "Fun Fitness & Movement", icon: Dumbbell,
      activities: ["Agility ladder games", "Relay races & sprints", "Skipping & jumping drills", "Basic stretching routine", "Team balance games"],
      keySkill: "Motor development & coordination" },
    { day: "Tuesday",   focus: "Batting Fundamentals", icon: Target,
      activities: ["Correct grip with soft ball", "Basic stance & balance", "Ball-tracking eye-focus drills", "Straight drive — underarm feed", "Hit & run pairs game"],
      keySkill: "Grip, stance & ball-tracking" },
    { day: "Wednesday", focus: "Bowling Basics", icon: Target,
      activities: ["Straight-arm bowling action", "Underarm target bowling", "Step-and-bowl rhythm drill", "'Ball in bucket' accuracy game", "Mini cricket bowling match"],
      keySkill: "Basic bowling action & accuracy" },
    { day: "Thursday",  focus: "Catching & Fielding", icon: Users,
      activities: ["Two-hand catching drills", "Ground fielding — stop the ball", "Underarm throwing to target", "'Hot potato' catching game", "Team catching circle"],
      keySkill: "Hand-eye coordination" },
    { day: "Friday",    focus: "Mini Match Day 🏏", icon: Trophy,
      activities: ["Kwik cricket / pairs cricket", "All roles rotation (bat/bowl/field)", "Modified over-cricket format", "Fun game scenarios with scoring", "Team celebration & coach feedback"],
      keySkill: "Game awareness & enjoyment" },
    { day: "Saturday",  focus: "Open Nets & Review", icon: Video,
      activities: ["Free batting with soft ball", "Coach demonstration session", "Parent observation open session", "Q&A with coach", "Next week preview & goals"],
      keySkill: "Confidence building" },
  ],
  junior: [
    { day: "Sunday",    rest: true, focus: "Rest & Recovery", icon: Clock,
      activities: ["Active rest — light jog or swim", "Mental relaxation", "Cricket video study (1 hour)", "Nutrition check with family"],
      keySkill: "Recovery & mindset" },
    { day: "Monday",    focus: "Fitness & Conditioning", icon: Dumbbell,
      activities: ["Sprint intervals: 10m / 20m / 30m", "Core circuit: planks, crunches, sit-ups", "Agility ladder patterns", "Flexibility & full body stretch", "Shoulder & rotator cuff warm-up"],
      keySkill: "Base fitness & agility" },
    { day: "Tuesday",   focus: "Batting Technique", icon: Target,
      activities: ["Forward defensive shot drills", "Cover drive — off front foot", "Pull shot technique (tennis ball)", "Shadow batting: footwork patterns", "Throw-down: facing pace on length"],
      keySkill: "Footwork & shot range" },
    { day: "Wednesday", focus: "Bowling Skills", icon: Target,
      activities: ["Bowling grip: seam position & off-spin", "Run-up alignment & gather drill", "Line & length target chalked on pitch", "Load & release action check", "Pair bowling accuracy competition"],
      keySkill: "Bowling action & control" },
    { day: "Thursday",  focus: "Fielding & Wicket-Keeping", icon: Users,
      activities: ["Slip catching with cradle", "Overarm throwing — hit the stumps", "Ground fielding: long barrier technique", "WK stance & basic glove movement", "Reaction drill with rebound board"],
      keySkill: "Throwing accuracy & WK basics" },
    { day: "Friday",    focus: "Match Simulation", icon: Trophy,
      activities: ["10-over internal match", "Batting partnerships — rotating strike", "Bowling spell: 2 overs each", "Fielding positions in live play", "Post-match debrief & individual feedback"],
      keySkill: "Applied game understanding" },
    { day: "Saturday",  focus: "Nets & Skill Assessment", icon: Video,
      activities: ["Structured nets: 20 min per batter", "Individual coach technical corrections", "Bowling rhythm & control nets", "Weekly skill assessment checklist", "Personal improvement target set"],
      keySkill: "Technique measurement & refinement" },
  ],
  youth: [
    { day: "Sunday",    rest: true, focus: "Rest & Recovery", icon: Clock,
      activities: ["Complete rest — no structured training", "Foam rolling & mobility work", "Mental skill journaling", "Study opposition / match videos"],
      keySkill: "Recovery & mental prep" },
    { day: "Monday",    focus: "Strength & Conditioning", icon: Dumbbell,
      activities: ["Gym: Squat, Deadlift, Bench (periodized)", "Explosive power: box jumps & bounds", "Cricket-specific sprint mechanics", "Rotational power: medicine ball throws", "Injury prevention & prehab protocols"],
      keySkill: "Strength, power & injury prevention" },
    { day: "Tuesday",   focus: "Advanced Batting", icon: Target,
      activities: ["Shot selection vs pace & spin scenarios", "Off-side: cover drive, square cut, late cut", "Leg-side: flick, pull, sweep & slog-sweep", "Running between wickets — calling drills", "T20 pressure net: 1 ball = 1 over simulation"],
      keySkill: "Shot range & decision making" },
    { day: "Wednesday", focus: "Bowling Mastery", icon: Target,
      activities: ["Seam: away-swing & in-swing variations", "Cutters: off-cutter & leg-cutter", "Off-spin: flight, dip, arm ball, turn", "Leg-spin: leg break, googly intro", "Death bowling: yorker accuracy & slower balls"],
      keySkill: "Variations & accuracy under pressure" },
    { day: "Thursday",  focus: "Fielding Excellence", icon: Users,
      activities: ["Boundary fielding — diving saves", "Circle fielding — cut off singles", "Throwing accuracy: long barrier & stump hit", "Wicket-keeping: standing up to spin", "Pressure fielding — score & wickets scenario"],
      keySkill: "Specialist fielding & WK depth" },
    { day: "Friday",    focus: "T20 Match Simulation", icon: Trophy,
      activities: ["20-over internal match (captained)", "Game scenarios: 40 off 5, 8 off last over", "Tactical field placements in play", "Post-match: individual batting/bowling analysis", "Mindset check: response to pressure moments"],
      keySkill: "Competitive pressure & tactics" },
    { day: "Saturday",  focus: "HD Video Analysis", icon: Video,
      activities: ["Individual HD video review session", "Coach-led technique correction (30 min each)", "Batting net: post-analysis corrections applied", "Bowling rhythm refinement from video cues", "Weekly performance report issued to player"],
      keySkill: "Data-driven individual improvement" },
  ],
  senior: [
    { day: "Sunday",    rest: true, focus: "Rest & Recovery", icon: Clock,
      activities: ["Complete rest or active recovery swim", "Ice bath / contrast therapy session", "Sports nutrition audit & plan", "Pre-week mental preparation"],
      keySkill: "Elite-level recovery" },
    { day: "Monday",    focus: "Elite Conditioning", icon: Dumbbell,
      activities: ["Full gym: periodized strength block", "Explosive power: plyometrics & sprint drills", "Cricket-specific endurance run intervals", "Core stability & functional movement", "Nutrition tracking & supplement check"],
      keySkill: "Peak physical conditioning" },
    { day: "Tuesday",   focus: "Power Batting & Strategy", icon: Target,
      activities: ["Power hitting: ramp, scoop, slog-sweep", "Batting scenarios: Powerplay & Death overs", "Chase simulation: 50 off 25, 30 off 18", "Fast bowling machine: 130+ kph face-up", "Video-guided technical refinement session"],
      keySkill: "Match-winning batting" },
    { day: "Wednesday", focus: "Elite Bowling", icon: Target,
      activities: ["Full spell under fatigue (bowl 8 overs)", "Cutters, knuckle ball, arm ball at pace", "Spin: deception, flight, turning wicket plan", "Powerplay & Death bowling analysis", "Bowling biomechanics review: wearable sensor"],
      keySkill: "Mastery under physical pressure" },
    { day: "Thursday",  focus: "Match Fielding & WK", icon: Users,
      activities: ["Full wicket-keeping session: all scenarios", "Pressure fielding: score-on-board drills", "Specialist positions: slip, gully, mid-on", "Run-out drill: throw on the move accuracy", "Captain fielding placement exercise"],
      keySkill: "Match-day specialist excellence" },
    { day: "Friday",    focus: "Full Match / Pressure Practice", icon: Trophy,
      activities: ["Full 20-over or red-ball practice match", "Specific game plans applied vs opponents", "Leadership: rotating captains side", "Mental reset: technique post-failure drills", "Day/evening transition condition adaption"],
      keySkill: "Competition readiness" },
    { day: "Saturday",  focus: "HD Analysis & Strategy", icon: Video,
      activities: ["Full HD video analysis review session", "Individual meeting: batting & bowling plan", "Opposition scouting: strengths & weaknesses", "Team strategy board session", "Tournament or trial prep logistics review"],
      keySkill: "Professional match preparation" },
  ],
};

const MONTHS = [
  { m: 1,  name: "Assessment & Introduction",     phase: "Phase 1 — Foundation",       pc: "emerald",
    icon: "🎯", emoji: "📋",
    objectives: ["Initial skill assessment for all students", "Safety education & equipment familiarisation", "Basic rules and formats of cricket (T20/ODI/Test)", "Fundamental movement skill evaluation", "Team building & PIR Academy orientation"],
    weekly: ["Wk 1: Orientation, benchmark assessment", "Wk 2: Safety, equipment, cricket rules", "Wk 3: Basic movement drills, coordination games", "Wk 4: Team bonding games, end-of-month mini match"],
    standard: "ICC LTAD: Learn-to-Play Stage. BCCI Foundation Programme. ECB Early Engagement." },
  { m: 2,  name: "Physical Foundation",           phase: "Phase 1 — Foundation",       pc: "emerald",
    icon: "💪", emoji: "🏃",
    objectives: ["Fitness benchmark testing (5 key tests)", "Core strength & stability introduction", "Flexibility & daily mobility routine", "Hand-eye coordination skill games", "Basic agility & ladder patterns"],
    weekly: ["Wk 1: 5 fitness benchmark tests run", "Wk 2: Core & flexibility basics", "Wk 3: Agility patterns & coordination", "Wk 4: Re-test, individual improvement plans issued"],
    standard: "ICC Physical Literacy Guidelines. ECB Early Engagement Framework. CA Cricket Blast Movement." },
  { m: 3,  name: "Batting Foundations",           phase: "Phase 2 — Skill Building",   pc: "blue",
    icon: "🏏", emoji: "🎯",
    objectives: ["Correct grip, stance & guard (off/leg/middle)", "Forward defensive shot — fundamental technique", "Back foot defence — balance & weight transfer", "Straight drive — timing & follow-through", "Front & back foot footwork patterns"],
    weekly: ["Wk 1: Grip, stance, guard — mirror drills", "Wk 2: Forward & back defence depth", "Wk 3: Straight drive timing, throw-downs", "Wk 4: Footwork patterns, full net practice"],
    standard: "BCCI Batting Technical Standards L1. ECB Batting Shot Pathway. ICC Junior Coaching Framework." },
  { m: 4,  name: "Bowling & Fielding Basics",    phase: "Phase 2 — Skill Building",   pc: "blue",
    icon: "⚡", emoji: "🎳",
    objectives: ["Age-appropriate basic bowling action", "Grip introduction: seam position & off-spin", "Ground fielding: stop, pick up, return throw", "Overarm throwing mechanics & safety", "Basic catching: two-hand, waist & knee height"],
    weekly: ["Wk 1: Basic bowling action, rhythm & run-up", "Wk 2: Grip types: seam vs off-spin", "Wk 3: Ground fielding & overarm throw form", "Wk 4: Catching drills, combined skills practice"],
    standard: "ICC Bowling Pathway Standards. BCCI Junior Fielding Module. ECB Youth Bowling Guidelines." },
  { m: 5,  name: "Batting Expansion",             phase: "Phase 3 — Refinement",       pc: "purple",
    icon: "🏏", emoji: "⚔️",
    objectives: ["Off-side shots: cover drive, cut, square drive", "Leg-side shots: flick, pull, hook technique", "Running between wickets & calling system", "Playing pace bowling confidently", "Playing spin — footwork & soft hands"],
    weekly: ["Wk 1: Off-side shot expansion", "Wk 2: Leg-side shots — pull & flick", "Wk 3: Running between wickets, calling drills", "Wk 4: Facing pace & spin adaptations"],
    standard: "ECB Batting Shot Pathway. BCCI Junior Technical Module. ICC Coaching L1." },
  { m: 6,  name: "Advanced Bowling & Fielding",   phase: "Phase 3 — Refinement",       pc: "purple",
    icon: "⚡", emoji: "🌀",
    objectives: ["Seam & swing bowling introduction", "Spin bowling: off-break, leg-break technique", "Fielding positions knowledge in live play", "Boundary fielding: approach, diving & return", "Wicket-keeping: footwork & glove positioning"],
    weekly: ["Wk 1: Seam & swing fundamentals", "Wk 2: Spin bowling control drills", "Wk 3: Fielding positions in live match play", "Wk 4: WK full session, combined skills review"],
    standard: "ICC Coaching L1 Bowling Standards. BCCI Fielding Excellence Module. ECB Spin Bowling Framework." },
  { m: 7,  name: "Match Practice & Application",  phase: "Phase 4 — Game Application", pc: "yellow",
    icon: "🏆", emoji: "🎮",
    objectives: ["Batting in real match conditions with pressure", "Bowling full spells in match conditions", "Fielding positions implemented in live matches", "Batting partnership building & communication", "Pressure training: specific scenario practice"],
    weekly: ["Wk 1: Internal T20 match series (video captured)", "Wk 2: Batting partnership & communication focus", "Wk 3: Bowling plans & spell management", "Wk 4: Full match with coach review + scorecard"],
    standard: "ICC Match Practice Guidelines. BCCI Age Group Tournament Prep. ECB Competition Readiness." },
  { m: 8,  name: "Tactics & Decision Making",     phase: "Phase 4 — Game Application", pc: "yellow",
    icon: "🧠", emoji: "♟️",
    objectives: ["Reading match situations: score, wickets, overs", "Batting strategies: T20 vs 50-over approach", "Bowling plans, field placement decisions", "Mental toughness & concentration training", "Team tactics, communication & game awareness"],
    weekly: ["Wk 1: Game situation scenario drills", "Wk 2: Format-specific batting strategies", "Wk 3: Bowling tactics & field setting practicals", "Wk 4: Mental skills, resilience & pressure drills"],
    standard: "ICC Mental Conditioning Framework. ECB Tactical Cricket Programme. BCCI Game Intelligence Module." },
  { m: 9,  name: "Video Analysis & Advanced Skills", phase: "Phase 5 — Advanced",     pc: "red",
    icon: "📹", emoji: "🔬",
    objectives: ["HD video analysis session for every student", "Individual technique correction action plan", "Advanced batting: sweeps, ramps, power shots", "Bowling: cutters, slower balls, mystery spin", "Sports psychology: focus, confidence, reset routines"],
    weekly: ["Wk 1: Full HD video analysis per student", "Wk 2: Individual correction plans implemented", "Wk 3: Advanced batting & bowling drills", "Wk 4: Mental skills sessions & visualisation"],
    standard: "ICC Elite Performance Analysis Framework. BCCI NCA Video Analysis Approach. CA Performance Program." },
  { m: 10, name: "Leadership & Mental Skills",    phase: "Phase 5 — Advanced",         pc: "red",
    icon: "🧠", emoji: "👑",
    objectives: ["Captaincy & leadership skill development", "Team communication & culture building", "Pre-match preparation routines & rituals", "Performing under adversity & pressure", "Goal setting & self-assessment journaling"],
    weekly: ["Wk 1: Leadership games & assigned responsibilities", "Wk 2: Team culture workshop & communication", "Wk 3: Pressure scenarios & mental reset drill", "Wk 4: Individual goal-setting review sessions"],
    standard: "ICC Leadership in Sport Programme. BCCI Player Mindset Module. Sports Psychology Best Practice." },
  { m: 11, name: "Tournament Preparation",        phase: "Phase 6 — Competition",      pc: "orange",
    icon: "🏆", emoji: "⚔️",
    objectives: ["Full match simulations with scorecards & analysis", "Opponent scouting & detailed game planning", "Physical peak conditioning block", "Tournament logistics, kit & equipment checks", "Tournament mindset: routines & rituals"],
    weekly: ["Wk 1: Full match simulations (video captured)", "Wk 2: Opponent analysis & tactical game plans", "Wk 3: Peak conditioning & sharpening phase", "Wk 4: Pre-tournament trial matches"],
    standard: "BCCI Age Group Tournament Framework. ICC Competition Readiness Standards. ECB Talent Pathway." },
  { m: 12, name: "Review, Assessment & Planning", phase: "Phase 6 — Competition",      pc: "orange",
    icon: "📋", emoji: "🎓",
    objectives: ["Season-end individual skill assessment", "Annual achievement recognition ceremony", "Next year pathway planning per student", "Parent–coach consultation meetings", "Certificate & grading presentation day"],
    weekly: ["Wk 1: Final skill assessment tests (benchmark re-run)", "Wk 2: Parent consultation sessions", "Wk 3: Next year planning & batch assignments", "Wk 4: Annual Day — certificates & celebration"],
    standard: "ICC LTAD Review Framework. BCCI Progress Assessment Guidelines. ECB Annual Review Protocol." },
];

const STANDARDS = [
  { org: "ICC", full: "International Cricket Council", color: "blue",
    detail: "Long Term Player Development (LTAD) framework — Learn to Play → Learn to Train → Train to Compete → Train to Perform stages" },
  { org: "BCCI", full: "Board of Control for Cricket in India", color: "green",
    detail: "NCA age-group curriculum aligned — Foundation, Junior, Youth & Senior academy stages with coach certification L1/L2" },
  { org: "ECB", full: "England & Wales Cricket Board", color: "red",
    detail: "Batting Shot Pathway, Talent Pathway Action Plan 2024, Physical Literacy & Fast Bowling Guidelines incorporated" },
  { org: "CA", full: "Cricket Australia", color: "yellow",
    detail: "Cricket Blast → Community → Pathway → First Class player development model adapted for Indian junior cricket context" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const accentClasses: Record<string, { tab: string; active: string; badge: string; card: string; border: string; glow: string }> = {
  emerald: {
    tab: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
    active: "bg-emerald-500/15 border-emerald-500/60 text-emerald-300",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    card: "bg-emerald-400/5",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  blue: {
    tab: "border-blue-500 bg-blue-500/10 text-blue-400",
    active: "bg-blue-500/15 border-blue-500/60 text-blue-300",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    card: "bg-blue-400/5",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
  },
  purple: {
    tab: "border-purple-500 bg-purple-500/10 text-purple-400",
    active: "bg-purple-500/15 border-purple-500/60 text-purple-300",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    card: "bg-purple-400/5",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
  },
  red: {
    tab: "border-red-500 bg-red-500/10 text-red-400",
    active: "bg-red-500/15 border-red-500/60 text-red-300",
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
    card: "bg-red-400/5",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
  },
};

const phaseColors: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  blue:    "text-blue-400 bg-blue-400/10 border-blue-400/30",
  purple:  "text-purple-400 bg-purple-400/10 border-purple-400/30",
  yellow:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  red:     "text-red-400 bg-red-400/10 border-red-400/30",
  orange:  "text-orange-400 bg-orange-400/10 border-orange-400/30",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Curriculum() {
  const [activeGroup, setActiveGroup] = useState<GroupId>("foundation");
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const todayIdx = new Date().getDay(); // 0 = Sun
  const todayName = DAY_NAMES[todayIdx];

  const group = AGE_GROUPS.find(g => g.id === activeGroup)!;
  const schedule = WEEKLY[activeGroup];
  const cls = accentClasses[group.accent];
  const todayPlan = schedule.find(d => d.day === todayName);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative pt-28 pb-14 overflow-hidden bg-gradient-to-b from-[#050b1a] to-background">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "radial-gradient(circle at 15% 55%, #eab308 0%, transparent 45%), radial-gradient(circle at 85% 45%, #1e40af 0%, transparent 45%)"
        }} />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {STANDARDS.map(s => (
                <span key={s.org} className={`text-xs font-bold px-3 py-1 rounded-full border ${phaseColors[s.color]}`}>
                  {s.org} Aligned
                </span>
              ))}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              Annual Practice <span className="text-secondary">Curriculum</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-3">
              A globally-benchmarked 12-month training plan for every age group —
              ICC, BCCI, ECB & Cricket Australia standards delivered by certified coaches.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              This curriculum is what drives every session at PIR Cricket Academy. Not coach intuition — proven global frameworks.
            </p>
            <a
              href="/pir-cricket-academy-curriculum.pdf"
              download
              className="inline-flex items-center gap-2 bg-secondary text-black font-bold px-7 py-3.5 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_25px_rgba(234,179,8,0.35)] text-sm uppercase tracking-wide"
            >
              <Download className="h-4 w-4" /> Download Full Curriculum PDF
            </a>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-6xl space-y-20">

        {/* ── Today's Schedule Banner ── */}
        {todayPlan && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-secondary/5 border border-secondary/30 rounded-2xl p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-secondary font-bold text-xs uppercase tracking-widest">Today — {todayName}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">What's on at the Academy Today?</h2>
                  <p className="text-muted-foreground text-sm mt-1">Select your age group below to see today's full session</p>
                </div>
                <Calendar className="h-10 w-10 text-secondary/40 shrink-0" />
              </div>

              {/* Age group quick-switch for today */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AGE_GROUPS.map(g => {
                  const todayForGroup = WEEKLY[g.id].find(d => d.day === todayName)!;
                  const c = accentClasses[g.accent];
                  const isActive = activeGroup === g.id;
                  return (
                    <button key={g.id}
                      onClick={() => setActiveGroup(g.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${isActive ? c.tab + " shadow-lg" : "border-border bg-card hover:border-border/80"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${c.badge}`}>{g.tag}</span>
                        <todayForGroup.icon className={`h-4 w-4 ${isActive ? "" : "text-muted-foreground"}`} />
                      </div>
                      <p className="text-xs font-bold text-white leading-snug">{todayForGroup.focus.replace(" 🏏", "")}</p>
                      <p className={`text-xs mt-1 font-medium ${isActive ? "text-white/80" : "text-muted-foreground"}`}>{g.age}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Age Group Tabs ── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">Weekly Training Schedule</h2>
            <p className="text-muted-foreground">Select your age group to see the full 6-day training plan</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {AGE_GROUPS.map(g => {
              const c = accentClasses[g.accent];
              const isActive = activeGroup === g.id;
              return (
                <button key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-bold text-sm transition-all ${isActive ? c.tab : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  <span>{g.tag}</span>
                  <span className="hidden sm:inline text-xs font-normal opacity-75">{g.age}</span>
                </button>
              );
            })}
          </div>

          {/* Group description */}
          <AnimatePresence mode="wait">
            <motion.div key={activeGroup} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={`text-center mb-8 p-4 rounded-xl border ${cls.card} ${cls.border}`}>
                <p className="font-bold text-white">{group.label} Programme <span className="text-muted-foreground font-normal">— {group.age}</span></p>
                <p className={`text-sm mt-1 ${cls.tab.split(" ").find(c => c.startsWith("text-"))}`}>{group.desc}</p>
              </div>

              {/* Schedule grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {schedule.map((day, i) => {
                  const isToday = day.day === todayName;
                  return (
                    <motion.div key={day.day}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`relative rounded-2xl border p-5 transition-all ${
                        isToday
                          ? `${cls.active} shadow-xl ${cls.glow} shadow-lg border-2`
                          : day.rest
                          ? "border-border/40 bg-background/40 opacity-70"
                          : "border-border bg-card hover:border-border/70"
                      }`}
                    >
                      {isToday && (
                        <div className="absolute -top-2.5 left-4">
                          <span className="bg-secondary text-black text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider">Today</span>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className={`text-xs font-black uppercase tracking-wider mb-0.5 ${isToday ? "text-white" : "text-muted-foreground"}`}>{day.day}</p>
                          <p className="text-sm font-bold text-white leading-snug">{day.focus}</p>
                        </div>
                        {!day.rest && <day.icon className={`h-5 w-5 shrink-0 ml-2 mt-0.5 ${isToday ? "text-white/80" : "text-muted-foreground"}`} />}
                      </div>
                      {!day.rest && (
                        <>
                          <ul className="space-y-1.5 mb-3">
                            {day.activities.map(a => (
                              <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-secondary/60" />
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                          <div className={`mt-auto pt-2 border-t ${isToday ? "border-white/20" : "border-border/40"}`}>
                            <p className="text-xs font-bold text-muted-foreground">Key Skill Focus</p>
                            <p className={`text-xs font-semibold mt-0.5 ${cls.tab.split(" ").find(c => c.startsWith("text-"))}`}>{day.keySkill}</p>
                          </div>
                        </>
                      )}
                      {day.rest && (
                        <p className="text-xs text-muted-foreground mt-1">Rest is part of the training plan. Recovery = performance.</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── 12-Month Annual Plan ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-2">12-Month Annual Curriculum</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every month has a defined purpose, objectives, and global standard. Click any month to see the full breakdown.
            </p>
          </div>

          {/* Phase timeline */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-10">
            {[
              { label: "Foundation",   months: "Jan–Feb", color: "emerald" },
              { label: "Skill Build",  months: "Mar–Apr", color: "blue" },
              { label: "Refinement",   months: "May–Jun", color: "purple" },
              { label: "Application",  months: "Jul–Aug", color: "yellow" },
              { label: "Advanced",     months: "Sep–Oct", color: "red" },
              { label: "Competition",  months: "Nov–Dec", color: "orange" },
            ].map(ph => (
              <div key={ph.label} className={`rounded-xl border px-3 py-2.5 text-center ${phaseColors[ph.color]}`}>
                <p className="text-xs font-black uppercase tracking-wider">{ph.label}</p>
                <p className="text-xs font-semibold opacity-70 mt-0.5">{ph.months}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {MONTHS.map(m => {
              const isOpen = expandedMonth === m.m;
              return (
                <motion.div key={m.m} layout className={`rounded-2xl border overflow-hidden transition-all ${phaseColors[m.pc].split(" ")[2]} ${isOpen ? "shadow-lg" : ""}`}>
                  <button
                    onClick={() => setExpandedMonth(isOpen ? null : m.m)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${phaseColors[m.pc]} border`}>
                      {m.m}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{MONTH_NAMES[m.m - 1]}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${phaseColors[m.pc]}`}>{m.phase}</span>
                      </div>
                      <p className="font-bold text-white text-sm mt-0.5">{m.icon} {m.name}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 grid md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5" /> Month Objectives
                            </h4>
                            <ul className="space-y-2">
                              {m.objectives.map(o => (
                                <li key={o} className="flex items-start gap-2 text-sm text-gray-300">
                                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-secondary/70" />
                                  <span>{o}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> Weekly Breakdown
                            </h4>
                            <ul className="space-y-2">
                              {m.weekly.map(w => (
                                <li key={w} className="flex items-start gap-2 text-sm text-gray-300">
                                  <Star className="h-3.5 w-3.5 mt-0.5 shrink-0 text-secondary/60" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5" /> Global Standard
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{m.standard}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Global Standards Section ── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">Globally-Benchmarked Standards</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our curriculum is not invented by one coach. It draws from the world's leading cricket development organisations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {STANDARDS.map(s => (
              <div key={s.org} className={`rounded-2xl border p-6 ${phaseColors[s.color].split(" ")[2]}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 font-black text-lg ${phaseColors[s.color]}`}>
                    {s.org}
                  </div>
                  <div>
                    <p className="font-bold text-white">{s.full}</p>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What makes PIR different ── */}
        <section className="bg-card border border-border rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
                <Shield className="h-3.5 w-3.5" /> Our Commitment to Parents
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                Curriculum-Led, <br />Not Coach-Led
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At PIR Cricket Academy, every session follows a documented, globally-researched curriculum. Your child's training is consistent regardless of which coach is present, because the plan comes first.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Coaches at PIR are certified (BCCI L1/L2) and trained to deliver this curriculum — not to freelance it. This ensures every student in the same age group receives the same quality, structured development.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BookOpen, label: "Documented curriculum", sub: "12-month, weekly, daily" },
                { icon: Globe,    label: "4 global frameworks",   sub: "ICC · BCCI · ECB · CA" },
                { icon: Video,    label: "HD Video analysis",     sub: "Monthly individual review" },
                { icon: Star,     label: "BCCI certified coaches", sub: "L1 & L2 qualified" },
                { icon: Target,   label: "Age-specific plans",    sub: "U10 · U14 · U17 · U19+" },
                { icon: Trophy,   label: "Tournament prep",       sub: "Phase 6 competition ready" },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-3 p-4 rounded-xl bg-background/40 border border-border/50">
                  <f.icon className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white leading-snug">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Download CTA ── */}
        <section className="text-center bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 rounded-3xl p-10 md:p-14">
          <Download className="h-12 w-12 text-secondary mx-auto mb-4 opacity-80" />
          <h2 className="font-display text-3xl font-bold text-white mb-3">Take the Curriculum Home</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Download the complete 12-month curriculum PDF — perfect for parents, students and coaches to review offline.
          </p>
          <a
            href="/pir-cricket-academy-curriculum.pdf"
            download
            className="inline-flex items-center gap-2.5 bg-secondary text-black font-black uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] text-sm"
          >
            <Download className="h-5 w-5" /> Download Full Curriculum PDF
          </a>
          <p className="text-xs text-muted-foreground mt-4">A4 format · Suitable for printing · Updated annually</p>
        </section>

      </div>
      <Footer />
    </div>
  );
}
