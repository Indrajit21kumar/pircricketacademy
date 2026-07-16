export type PhaseColor = "emerald" | "blue" | "purple" | "yellow" | "orange" | "red";

export interface Session {
  number: number;
  day: string;           // "Monday"
  label: string;         // "Batting & Fitness"
  duration: string;      // "75 min"
  warmUp: string[];      // 2–3 warm-up activities
  mainWork: string[];    // 4–5 main drills with instructions
  gamePlay: string;      // applied game / match activity
  coachFocus: string;    // key teaching point for coach
}

export interface MonthPlan {
  month: string;         // "Sep 2026"
  shortMonth: string;    // "Sep"
  phase: string;         // "Phase 1 — Assessment"
  phaseColor: PhaseColor;
  monthGoal: string;     // one-line goal for the month
  sessions: Session[];   // 3 or 4 sessions that repeat each week this month
  assessment: string;    // what to measure / check at month end
  globalStandard: string;
}

export interface AgeGroupData {
  id: "foundation" | "junior" | "youth" | "senior";
  label: string;
  tag: string;
  ageRange: string;
  accentColor: string;
  desc: string;
  trainingDays: string[];   // e.g. ["Monday","Wednesday","Friday"]
  sessionsPerWeek: number;
  sessionLength: string;
  months: MonthPlan[];
}
