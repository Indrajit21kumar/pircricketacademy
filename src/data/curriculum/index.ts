export { foundation } from "./foundation";
export { junior }    from "./junior";
export { youth }     from "./youth";
export { senior }    from "./senior";
export type { AgeGroupData, MonthPlan, WeekDay, PhaseColor } from "./types";

import { foundation } from "./foundation";
import { junior }     from "./junior";
import { youth }      from "./youth";
import { senior }     from "./senior";

export const ALL_GROUPS = [foundation, junior, youth, senior] as const;

export const ACADEMIC_YEAR = "Sep 2026 – Aug 2027";

export const STANDARDS = [
  { org: "ICC",  full: "International Cricket Council", color: "blue",
    detail: "Long Term Player Development (LTAD) — Learn to Play → Learn to Train → Train to Compete → Train to Perform" },
  { org: "BCCI", full: "Board of Control for Cricket in India", color: "emerald",
    detail: "NCA age-group curriculum — Foundation, Junior, Youth & Senior stages with L1/L2 coach certification" },
  { org: "ECB",  full: "England & Wales Cricket Board", color: "purple",
    detail: "Batting Shot Pathway, Talent Pathway 2024, Physical Literacy & Fast Bowling Guidelines" },
  { org: "CA",   full: "Cricket Australia", color: "yellow",
    detail: "Cricket Blast → Community → Pathway → First Class player development adapted for Indian junior cricket" },
] as const;

export const PHASE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  emerald: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  blue:    { text: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30" },
  purple:  { text: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/30" },
  yellow:  { text: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/30" },
  orange:  { text: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/30" },
  red:     { text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30" },
};

export const ACCENT_CLASSES: Record<string, { tab: string; active: string; glow: string }> = {
  emerald: { tab: "border-emerald-500 bg-emerald-500/10 text-emerald-400", active: "bg-emerald-500/15 border-emerald-500 text-white", glow: "shadow-emerald-500/20" },
  blue:    { tab: "border-blue-500 bg-blue-500/10 text-blue-400",          active: "bg-blue-500/15 border-blue-500 text-white",    glow: "shadow-blue-500/20" },
  purple:  { tab: "border-purple-500 bg-purple-500/10 text-purple-400",    active: "bg-purple-500/15 border-purple-500 text-white",  glow: "shadow-purple-500/20" },
  red:     { tab: "border-red-500 bg-red-500/10 text-red-400",             active: "bg-red-500/15 border-red-500 text-white",      glow: "shadow-red-500/20" },
};
