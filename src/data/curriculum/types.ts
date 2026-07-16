export type PhaseColor = "emerald" | "blue" | "purple" | "yellow" | "orange" | "red";

export interface MonthPlan {
  month: string;           // e.g. "Sep 2026"
  shortMonth: string;      // e.g. "Sep"
  phase: string;           // e.g. "Phase 1 — Assessment"
  phaseColor: PhaseColor;
  focus: string;           // one-line session focus
  objectives: string[];    // 4–6 key objectives
  weeklyBreakdown: string; // what each week covers
  globalStandard: string;  // ICC/BCCI/ECB alignment note
}

export interface WeekDay {
  day: string;
  rest?: boolean;
  focus: string;
  activities: string[];
  keySkill: string;
}

export interface AgeGroupData {
  id: "foundation" | "junior" | "youth" | "senior";
  label: string;
  tag: string;           // "U10" etc.
  ageRange: string;
  accentColor: string;   // tailwind color name
  desc: string;
  sessionsPerWeek: string;
  sessionLength: string;
  months: MonthPlan[];
  weeklySchedule: WeekDay[];
}
