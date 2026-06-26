import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, Clock,
  MapPin, Users, Trash2, Filter, AlertTriangle, Trophy,
  Sun, CloudRain, Dumbbell, BookOpen
} from "lucide-react";
import { Link } from "wouter";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CalEvent {
  event: {
    id: number; title: string; type: string; date: string;
    startTime: string | null; endTime: string | null;
    batchId: number | null; venue: string | null;
    description: string | null; createdBy: string; createdAt: string;
  };
  batch: { id: number; name: string } | null;
}
interface Batch { id: number; name: string; ageGroup: string; coachName: string; }

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  practice:      { label: "Practice",       color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30",   Icon: Dumbbell },
  match:         { label: "Match",           color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", Icon: Trophy },
  tournament:    { label: "Tournament",      color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", Icon: Trophy },
  holiday:       { label: "Holiday",         color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/30",  Icon: Sun },
  cancellation:  { label: "Cancellation",    color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30",    Icon: CloudRain },
  ground_booking:{ label: "Ground Booking",  color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", Icon: MapPin },
  other:         { label: "Other",           color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border", Icon: BookOpen },
};

const DOT_COLOR: Record<string, string> = {
  practice: "bg-blue-400", match: "bg-yellow-400", tournament: "bg-orange-400",
  holiday: "bg-green-400", cancellation: "bg-red-400", ground_booking: "bg-purple-400", other: "bg-muted-foreground",
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function pad(n: number) { return String(n).padStart(2,"0"); }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}`; }

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
function EventModal({ onClose, onSave, batches, initial }: {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  batches: Batch[];
  initial?: { date?: string };
}) {
  const today = new Date();
  const defaultDate = initial?.date ?? toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const [form, setForm] = useState({
    title: "", type: "practice", date: defaultDate,
    startTime: "", endTime: "", batchId: "", venue: "", description: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      batchId: form.batchId ? parseInt(form.batchId) : null,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      venue: form.venue || null,
      description: form.description || null,
    });
    setSaving(false);
  };

  const cfg = TYPE_CONFIG[form.type] || TYPE_CONFIG.other;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Add Event</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Event Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_CONFIG).map(([k, c]) => (
                <button key={k} type="button" onClick={() => setForm(f => ({ ...f, type: k }))}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${form.type === k ? `${c.bg} ${c.border} ${c.color}` : "border-border text-muted-foreground hover:border-border/80"}`}>
                  <c.Icon className="h-3.5 w-3.5 mx-auto mb-1" />
                  {c.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Title *</label>
            <input required value={form.title} onChange={set("title")}
              placeholder={`e.g. ${form.type === "practice" ? "Morning Practice" : form.type === "match" ? "U-16 Match vs DPS" : form.type === "holiday" ? "Diwali Break" : "Event title"}`}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" />
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Date *</label>
              <input required type="date" value={form.date} onChange={set("date")}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Start</label>
              <input type="time" value={form.startTime} onChange={set("startTime")}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">End</label>
              <input type="time" value={form.endTime} onChange={set("endTime")}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" />
            </div>
          </div>

          {/* Batch + Venue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Batch</label>
              <select value={form.batchId} onChange={set("batchId")}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors">
                <option value="">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Venue</label>
              <input value={form.venue} onChange={set("venue")} placeholder="Ground / location"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Notes</label>
            <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Optional details…"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-secondary text-secondary-foreground rounded-xl py-2.5 text-sm font-bold hover:bg-secondary/90 transition-all disabled:opacity-60">
              {saving ? "Saving…" : "Save Event"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Event Detail Drawer ───────────────────────────────────────────────────────
function EventDrawer({ ev, onClose, onDelete }: { ev: CalEvent; onClose: () => void; onDelete: (id: number) => void }) {
  const cfg = TYPE_CONFIG[ev.event.type] || TYPE_CONFIG.other;
  const fmt = (t: string | null) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${pad(m)} ${ampm}`;
  };
  const dateObj = new Date(ev.event.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.border} border`}>
              <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
              <h3 className="font-display text-lg font-bold leading-tight">{ev.event.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{dateStr}</span>
          </div>
          {(ev.event.startTime || ev.event.endTime) && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{fmt(ev.event.startTime)}{ev.event.endTime ? ` – ${fmt(ev.event.endTime)}` : ""}</span>
            </div>
          )}
          {ev.batch && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{ev.batch.name}</span>
            </div>
          )}
          {!ev.batch && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>All Batches</span>
            </div>
          )}
          {ev.event.venue && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{ev.event.venue}</span>
            </div>
          )}
          {ev.event.description && (
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-3 mt-2">{ev.event.description}</p>
          )}
        </div>

        <button
          onClick={() => { onDelete(ev.event.id); onClose(); }}
          className="w-full flex items-center justify-center gap-2 border border-red-400/30 text-red-400 hover:bg-red-400/10 rounded-xl py-2.5 text-sm font-semibold transition-colors"
        >
          <Trash2 className="h-4 w-4" /> Delete Event
        </button>
      </motion.div>
    </div>
  );
}

// ── Main Calendar Page ────────────────────────────────────────────────────────
export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clickDate, setClickDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");

  const monthStr = `${year}-${pad(month + 1)}`;
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, bRes] = await Promise.all([
        fetch(`/api/events?month=${monthStr}`),
        fetch("/api/batches"),
      ]);
      if (eRes.ok) setEvents(await eRes.json());
      if (bRes.ok) setBatches(await bRes.json());
    } finally { setLoading(false); }
  }, [monthStr]);

  useEffect(() => { load(); }, [load]);

  const addEvent = async (data: any) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, createdBy: "admin" }),
    });
    if (res.ok) { setShowModal(false); setClickDate(null); load(); }
  };

  const deleteEvent = async (id: number) => {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    load();
  };

  // Filter
  const filtered = events.filter(r => {
    if (filterType !== "all" && r.event.type !== filterType) return false;
    if (filterBatch !== "all" && String(r.event.batchId) !== filterBatch) return false;
    return true;
  });

  // Group events by date for calendar grid
  const byDate: Record<string, CalEvent[]> = {};
  filtered.forEach(r => {
    if (!byDate[r.event.date]) byDate[r.event.date] = [];
    byDate[r.event.date].push(r);
  });

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  // Today's events (for sidebar)
  const todayEvents = (byDate[todayStr] || []).sort((a, b) => (a.event.startTime || "").localeCompare(b.event.startTime || ""));

  // Upcoming 7 days
  const upcoming: CalEvent[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const ds = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
    if (byDate[ds]) upcoming.push(...byDate[ds]);
  }

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const fmt12 = (t: string | null) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${pad(m)}${h >= 12 ? "pm" : "am"}`;
  };

  // Stats for the current month
  const typeCounts = filtered.reduce((acc, r) => {
    acc[r.event.type] = (acc[r.event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Admin</Link>
            <span className="text-border">|</span>
            <span className="font-display text-secondary font-black text-xl">PIR</span>
            <span className="text-muted-foreground text-sm hidden sm:block">Calendar & Scheduling</span>
          </div>
          <button
            onClick={() => { setClickDate(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* Left: Calendar */}
          <div className="space-y-4">
            {/* Month nav + filters */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-muted/50 rounded-xl transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                <h2 className="font-display text-xl font-bold">{MONTHS[month]} {year}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-muted/50 rounded-xl transition-colors"><ChevronRight className="h-5 w-5" /></button>
              </div>

              {/* Type filter chips */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filterType === "all" ? "bg-secondary text-secondary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}>
                  All
                </button>
                {Object.entries(TYPE_CONFIG).map(([k, c]) => (
                  <button key={k} onClick={() => setFilterType(filterType === k ? "all" : k)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filterType === k ? `${c.bg} ${c.color}` : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar grid */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {DAYS.map(d => (
                  <div key={d} className="text-center py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  const ds = day ? toDateStr(year, month, day) : null;
                  const dayEvents = ds ? (byDate[ds] || []) : [];
                  const isToday = ds === todayStr;
                  const isPast = ds ? ds < todayStr : false;

                  return (
                    <div
                      key={i}
                      onClick={() => { if (ds) { setClickDate(ds); setShowModal(true); } }}
                      className={`min-h-[88px] p-1.5 border-b border-r border-border/50 transition-colors
                        ${day ? "cursor-pointer hover:bg-muted/20" : "opacity-0 pointer-events-none"}
                        ${i % 7 === 6 ? "border-r-0" : ""}
                        ${Math.floor(i / 7) === Math.floor((cells.length - 1) / 7) ? "border-b-0" : ""}
                      `}
                    >
                      {day && (
                        <>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors
                            ${isToday ? "bg-secondary text-secondary-foreground" : isPast ? "text-muted-foreground" : "text-foreground"}
                          `}>
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 3).map(r => {
                              const cfg = TYPE_CONFIG[r.event.type] || TYPE_CONFIG.other;
                              return (
                                <div
                                  key={r.event.id}
                                  onClick={e => { e.stopPropagation(); setSelected(r); }}
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate cursor-pointer ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}
                                >
                                  {r.event.title}
                                </div>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly stats */}
            {filtered.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{MONTHS[month]} Summary</h3>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(typeCounts).map(([type, count]) => {
                    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.other;
                    return (
                      <div key={type} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                        <cfg.Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        <span className={`text-xs font-bold ${cfg.color}`}>{count} {cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Today's Schedule */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <h3 className="font-bold text-sm">Today's Schedule</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {now.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              {todayEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No events today</p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(r => {
                    const cfg = TYPE_CONFIG[r.event.type] || TYPE_CONFIG.other;
                    return (
                      <button key={r.event.id} onClick={() => setSelected(r)}
                        className={`w-full text-left p-3 rounded-xl border ${cfg.border} ${cfg.bg} hover:opacity-80 transition-opacity`}>
                        <div className="flex items-center gap-2">
                          <cfg.Icon className={`h-3.5 w-3.5 ${cfg.color} shrink-0`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="font-semibold text-sm mt-1">{r.event.title}</p>
                        {(r.event.startTime || r.event.venue) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.event.startTime && fmt12(r.event.startTime)}
                            {r.event.startTime && r.event.venue && " · "}
                            {r.event.venue}
                          </p>
                        )}
                        {r.batch && <p className="text-xs text-muted-foreground">{r.batch.name}</p>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming 14 days */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4">Upcoming (14 days)</h3>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.slice(0, 12).map(r => {
                    const cfg = TYPE_CONFIG[r.event.type] || TYPE_CONFIG.other;
                    const d = new Date(r.event.date + "T00:00:00");
                    const isT = r.event.date === todayStr;
                    return (
                      <button key={r.event.id + r.event.date} onClick={() => setSelected(r)}
                        className="w-full text-left flex items-center gap-3 p-2 hover:bg-muted/30 rounded-xl transition-colors">
                        <div className="w-10 text-center shrink-0">
                          <p className="text-[10px] text-muted-foreground uppercase">{isT ? "Today" : d.toLocaleDateString("en-IN",{weekday:"short"})}</p>
                          <p className="text-base font-bold leading-tight">{d.getDate()}</p>
                        </div>
                        <div className={`w-1.5 h-8 rounded-full ${DOT_COLOR[r.event.type] || "bg-muted-foreground"} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{r.event.title}</p>
                          <p className="text-xs text-muted-foreground">{cfg.label}{r.event.startTime ? ` · ${fmt12(r.event.startTime)}` : ""}</p>
                        </div>
                      </button>
                    );
                  })}
                  {upcoming.length > 12 && <p className="text-xs text-muted-foreground text-center pt-1">+{upcoming.length - 12} more events</p>}
                </div>
              )}
            </div>

            {/* Quick tips */}
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Tips</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Click any date on the calendar to add an event</li>
                <li>• Use <span className="text-red-400 font-semibold">Cancellation</span> type for rain/wash-outs</li>
                <li>• Leave batch blank for academy-wide events</li>
                <li>• Holidays automatically show for all batches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <EventModal
            onClose={() => { setShowModal(false); setClickDate(null); }}
            onSave={addEvent}
            batches={batches}
            initial={clickDate ? { date: clickDate } : undefined}
          />
        )}
        {selected && (
          <EventDrawer ev={selected} onClose={() => setSelected(null)} onDelete={deleteEvent} />
        )}
      </AnimatePresence>
    </div>
  );
}
