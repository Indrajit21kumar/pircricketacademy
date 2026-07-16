import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  ClipboardList, Star, QrCode, BookOpen, Users,
  CheckCircle, ChevronRight, Plus, X, Save, LogIn, AlertCircle
} from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];
const inp = "w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500";
const lbl = "block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5";
const COACH_TOKEN_KEY = "pir_coach_token";
const COACH_USER_KEY  = "pir_coach_user";

// ─── JWT helpers ──────────────────────────────────────────────────────────────
function getCoachToken() { return localStorage.getItem(COACH_TOKEN_KEY); }
function getCoachUser(): { name: string; username: string } | null {
  try { return JSON.parse(localStorage.getItem(COACH_USER_KEY) || "null"); } catch { return null; }
}
function clearCoach() { localStorage.removeItem(COACH_TOKEN_KEY); localStorage.removeItem(COACH_USER_KEY); }

// ─── Login Screen ─────────────────────────────────────────────────────────────
function CoachLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user.role !== "coach") throw new Error("This login is for coaches only. Use Admin Login for admin access.");
      localStorage.setItem(COACH_TOKEN_KEY, data.token);
      localStorage.setItem(COACH_USER_KEY, JSON.stringify({ name: data.user.name, username: data.user.username }));
      onLogin(data.user.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">← Home</Link>
        </div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Coach Portal</h1>
          <p className="text-gray-400 text-sm">PIRcricketHub — Staff Login</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={lbl}>Username</label>
            <input required className={inp} value={username} onChange={e => setUsername(e.target.value)} placeholder="coach.ravi" autoComplete="username" />
          </div>
          <div>
            <label className={lbl}>Password</label>
            <input required type="password" className={inp} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" />{loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-gray-600 text-xs mt-6">
          Coach accounts are created by the Admin.<br />
          Contact <a href="https://wa.me/918936061688" className="text-yellow-500 hover:text-yellow-400">Admin</a> if you need access.
        </p>
      </div>
    </div>
  );
}

// ─── Session Notes Tab ───────────────────────────────────────────────
function SessionNotesTab({ coachName, batches }: { coachName: string; batches: any[] }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ batchId: "", sessionDate: TODAY, drills: "", highlights: "", improvements: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/session-notes", { headers: { Authorization: `Bearer ${getCoachToken()}` } })
      .then(r => r.json()).then(data => setNotes(Array.isArray(data) ? data.reverse() : []));

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/session-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getCoachToken()}` },
      body: JSON.stringify({ ...form, batchId: form.batchId ? parseInt(form.batchId) : null, coachName }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ batchId: "", sessionDate: TODAY, drills: "", highlights: "", improvements: "", notes: "" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Session Notes</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400">
          <Plus className="h-4 w-4" /> Add Note
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0a0f1e] border border-yellow-500/30 rounded-2xl p-5 mb-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Batch</label>
                <select className={inp} value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })}>
                  <option value="">All / General</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Session Date</label>
                <input type="date" required className={inp} value={form.sessionDate} onChange={e => setForm({ ...form, sessionDate: e.target.value })} />
              </div>
            </div>
            <div><label className={lbl}>Drills Practiced</label>
              <input className={inp} value={form.drills} onChange={e => setForm({ ...form, drills: e.target.value })} placeholder="e.g. Cover drives, pull shots, slip catching" />
            </div>
            <div><label className={lbl}>Highlights</label>
              <textarea rows={2} className={inp} value={form.highlights} onChange={e => setForm({ ...form, highlights: e.target.value })} placeholder="Who performed well, any breakthroughs..." />
            </div>
            <div><label className={lbl}>Areas to Improve</label>
              <textarea rows={2} className={inp} value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })} placeholder="Focus areas for next session..." />
            </div>
            <div><label className={lbl}>General Notes</label>
              <textarea rows={2} className={inp} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any other observations..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-400 disabled:opacity-60">
                <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Note"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-700 text-gray-400 rounded-xl text-sm hover:border-gray-500">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No session notes yet.</p></div>
      ) : (
        <div className="space-y-4">
          {notes.map(({ note, batch }) => (
            <div key={note.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{note.sessionDate}</p>
                  <p className="text-xs text-gray-400">{batch?.name || "General"} · {note.coachName}</p>
                </div>
              </div>
              {note.drills && <div className="mb-2"><span className="text-xs font-bold text-yellow-400 uppercase">Drills: </span><span className="text-sm text-gray-300">{note.drills}</span></div>}
              {note.highlights && <div className="mb-2"><span className="text-xs font-bold text-green-400 uppercase">Highlights: </span><span className="text-sm text-gray-300">{note.highlights}</span></div>}
              {note.improvements && <div className="mb-2"><span className="text-xs font-bold text-orange-400 uppercase">Improve: </span><span className="text-sm text-gray-300">{note.improvements}</span></div>}
              {note.notes && <p className="text-sm text-gray-400 mt-2">{note.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Player Ratings Tab ──────────────────────────────────────────────
function RatingSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const color = value >= 8 ? "text-green-400" : value >= 6 ? "text-yellow-400" : "text-red-400";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
        <span className={`text-sm font-bold ${color}`}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-yellow-500" />
    </div>
  );
}

function PlayerRatingsTab({ coachName, batches }: { coachName: string; batches: any[] }) {
  const [students, setStudents] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "", batchId: "", sessionDate: TODAY,
    batting: 5, bowling: 5, fielding: 5, fitness: 5, attitude: 5, notes: "",
  });

  const load = () => {
    const h = { Authorization: `Bearer ${getCoachToken()}` };
    fetch("/api/students", { headers: h }).then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
    fetch("/api/player-ratings", { headers: h }).then(r => r.json()).then(d => setRatings(Array.isArray(d) ? d.reverse() : []));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) return;
    setSaving(true);
    await fetch("/api/player-ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getCoachToken()}` },
      body: JSON.stringify({ ...form, studentId: parseInt(form.studentId), batchId: form.batchId ? parseInt(form.batchId) : null, coachName }),
    });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const avg = (r: any) => {
    const vals = [r.batting, r.bowling, r.fielding, r.fitness, r.attitude].filter(Boolean);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "-";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Player Ratings</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400">
          <Plus className="h-4 w-4" /> Rate Player
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0a0f1e] border border-yellow-500/30 rounded-2xl p-5 mb-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Student *</label>
                <select required className={inp} value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">Select student</option>
                  {students.map(({ student }) => <option key={student.id} value={student.id}>{student.name}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Date</label>
                <input type="date" required className={inp} value={form.sessionDate} onChange={e => setForm({ ...form, sessionDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-4 bg-[#0d1529] rounded-xl p-4">
              <RatingSlider label="Batting" value={form.batting} onChange={v => setForm({ ...form, batting: v })} />
              <RatingSlider label="Bowling" value={form.bowling} onChange={v => setForm({ ...form, bowling: v })} />
              <RatingSlider label="Fielding" value={form.fielding} onChange={v => setForm({ ...form, fielding: v })} />
              <RatingSlider label="Fitness" value={form.fitness} onChange={v => setForm({ ...form, fitness: v })} />
              <RatingSlider label="Attitude" value={form.attitude} onChange={v => setForm({ ...form, attitude: v })} />
            </div>
            <div><label className={lbl}>Coach Notes</label>
              <textarea rows={2} className={inp} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Specific feedback for this player..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-400 disabled:opacity-60">
                <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Rating"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-700 text-gray-400 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {ratings.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><Star className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No ratings yet.</p></div>
      ) : (
        <div className="space-y-3">
          {ratings.map(({ rating, student }) => {
            const average = avg(rating);
            const avgNum = parseFloat(average);
            const color = avgNum >= 8 ? "text-green-400 border-green-500/30" : avgNum >= 6 ? "text-yellow-400 border-yellow-500/30" : "text-red-400 border-red-500/30";
            return (
              <div key={rating.id} className={`bg-[#0a0f1e] border rounded-xl p-4 flex items-center justify-between ${color}`}>
                <div>
                  <p className="font-bold text-white">{student?.name}</p>
                  <p className="text-xs text-gray-400">{rating.sessionDate} · {rating.coachName}</p>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {[["Bat", rating.batting], ["Bowl", rating.bowling], ["Field", rating.fielding], ["Fit", rating.fitness], ["Att", rating.attitude]].map(([k, v]) =>
                      v != null && <span key={k as string} className="text-xs text-gray-400">{k}: <span className="text-white font-bold">{v}</span></span>
                    )}
                  </div>
                  {rating.notes && <p className="text-xs text-gray-500 mt-1 italic">{rating.notes}</p>}
                </div>
                <div className={`text-2xl font-bold ${color.split(" ")[0]}`}>{average}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Batches Tab ─────────────────────────────────────────────────────
function BatchesTab({ batches, onRefresh }: { batches: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", ageGroup: "U12", schedule: "", coachName: "", maxStudents: 25 });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getCoachToken()}` },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", ageGroup: "U12", schedule: "", coachName: "", maxStudents: 25 });
    onRefresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Batches</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400">
          <Plus className="h-4 w-4" /> Add Batch
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0a0f1e] border border-yellow-500/30 rounded-2xl p-5 mb-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Batch Name *</label><input required className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Morning Batch A" /></div>
              <div><label className={lbl}>Age Group *</label>
                <select required className={inp} value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>
                  {["U8","U10","U12","U14","U16","U19","Elite"].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div><label className={lbl}>Schedule *</label><input required className={inp} value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} placeholder="Mon Wed Fri · 6:00–8:00 AM" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Coach Name *</label><input required className={inp} value={form.coachName} onChange={e => setForm({ ...form, coachName: e.target.value })} placeholder="Pankaj Mishra" /></div>
              <div><label className={lbl}>Max Students</label><input type="number" className={inp} value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: parseInt(e.target.value) })} /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-yellow-500 text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-400 disabled:opacity-60">{saving ? "Saving..." : "Create Batch"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-700 text-gray-400 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {batches.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><Users className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No batches yet.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {batches.map(b => (
            <div key={b.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{b.name}</p>
                  <p className="text-xs text-yellow-400 font-semibold">{b.ageGroup}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${b.isActive ? "bg-green-500/15 text-green-400" : "bg-gray-500/15 text-gray-400"}`}>{b.isActive ? "Active" : "Inactive"}</span>
              </div>
              <p className="text-sm text-gray-300 mb-1">📅 {b.schedule}</p>
              <p className="text-sm text-gray-400">👤 {b.coachName}</p>
              <p className="text-xs text-gray-500 mt-2">Max {b.maxStudents} students</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Coach Portal ────────────────────────────────────────────────
const TABS = [
  { id: "batches", label: "Batches", icon: Users },
  { id: "notes", label: "Session Notes", icon: BookOpen },
  { id: "ratings", label: "Ratings", icon: Star },
];

export default function CoachPortal() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("batches");
  const [coachName, setCoachName] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    const user = getCoachUser();
    const token = getCoachToken();
    if (user && token) setCoachName(user.name);
  }, []);

  const loadBatches = () =>
    fetch("/api/batches", { headers: { Authorization: `Bearer ${getCoachToken()}` } })
      .then(r => r.json()).then(d => setBatches(Array.isArray(d) ? d : []));

  useEffect(() => { if (coachName) loadBatches(); }, [coachName]);

  const logout = () => { clearCoach(); setCoachName(null); };

  if (!coachName) return <CoachLogin onLogin={name => { setCoachName(name); }} />;

  return (
    <div className="min-h-screen bg-[#0d1529] text-white">
      {/* Top bar */}
      <div className="bg-[#0a0f1e] border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="font-bold text-white">Coach Portal</h1>
              <p className="text-xs text-gray-400">PIRcricketHub</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-white font-bold">{coachName}</span>
            </div>
            <button onClick={() => navigate("/coach/scan")} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold px-3 py-2 rounded-xl text-xs hover:bg-yellow-500/20">
              <QrCode className="h-4 w-4" /> Scan QR
            </button>
            <Link href="/" className="text-xs text-gray-500 hover:text-yellow-400 border border-gray-700 px-3 py-2 rounded-xl transition-colors">← Home</Link>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-2 rounded-xl flex items-center gap-1">
              <X className="h-3 w-3" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#0a0f1e] border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${tab === id ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-2xl p-5">
          {tab === "batches" && <BatchesTab batches={batches} onRefresh={loadBatches} />}
          {tab === "notes" && <SessionNotesTab coachName={coachName} batches={batches} />}
          {tab === "ratings" && <PlayerRatingsTab coachName={coachName} batches={batches} />}
        </div>

      </div>
    </div>
  );
}
