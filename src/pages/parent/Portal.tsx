import { useState } from "react";
import {
  Phone, CheckCircle, XCircle, Clock, IndianRupee,
  Star, Bell, CalendarDays, BookOpen, TrendingUp, AlertCircle
} from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

type PortalData = {
  students: { student: any; batch: any }[];
  attendance: any[];
  fees: any[];
  ratings: any[];
  notifications: any[];
  sessionNotes: { note: any; batch: any }[];
  stats: {
    totalSessions: number; presentCount: number; attendancePct: number;
    pendingFees: number; paidFees: number; avgRating: string | null;
  };
};

const TABS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "fees", label: "Fees", icon: IndianRupee },
  { id: "performance", label: "Performance", icon: Star },
  { id: "notices", label: "Notices", icon: Bell },
];

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className={`bg-[#0a0f1e] border rounded-xl p-4 text-center ${color}`}>
      <Icon className="h-5 w-5 mx-auto mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function AttendanceTab({ attendance }: { attendance: any[] }) {
  const statusIcon: Record<string, any> = {
    present: <CheckCircle className="h-4 w-4 text-green-400" />,
    late: <Clock className="h-4 w-4 text-yellow-400" />,
    absent: <XCircle className="h-4 w-4 text-red-400" />,
  };
  const statusColor: Record<string, string> = {
    present: "text-green-400",
    late: "text-yellow-400",
    absent: "text-red-400",
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Attendance History</h2>
      {attendance.length === 0 ? (
        <div className="text-center py-10 text-gray-500"><CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No records yet.</p></div>
      ) : (
        <div className="space-y-2">
          {attendance.map((a) => (
            <div key={a.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {statusIcon[a.status] || statusIcon.absent}
                <div>
                  <p className="text-sm font-bold text-white">{a.sessionDate}</p>
                  <p className="text-xs text-gray-500">Marked by {a.markedBy}</p>
                </div>
              </div>
              <span className={`text-xs font-bold capitalize ${statusColor[a.status] || "text-gray-400"}`}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeesTab({ fees, pendingFees, paidFees }: { fees: any[]; pendingFees: number; paidFees: number }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Fee Status</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">₹{paidFees.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total Paid</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">₹{pendingFees.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Pending</p>
        </div>
      </div>

      {pendingFees > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-400">Fee Due</p>
            <p className="text-xs text-gray-400">Please clear pending fees. Contact the academy for payment.</p>
            <a href="https://wa.me/918936061688?text=Hi%2C%20I%20want%20to%20pay%20fees%20for%20my%20child." target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-green-400 hover:text-green-300">
              Pay via WhatsApp →
            </a>
          </div>
        </div>
      )}

      {fees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No fee records yet.</div>
      ) : (
        <div className="space-y-2">
          {fees.reverse().map((f) => (
            <div key={f.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{f.month}</p>
                {f.receiptNo && <p className="text-xs text-gray-500">Receipt: {f.receiptNo}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-white">₹{f.amount.toLocaleString()}</p>
                <span className={`text-xs font-bold ${f.paid ? "text-green-400" : "text-red-400"}`}>{f.paid ? `Paid ${f.paidDate || ""}` : "Pending"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerformanceTab({ ratings, sessionNotes }: { ratings: any[]; sessionNotes: any[] }) {
  const ratingBar = (val: number | null) => {
    if (!val) return null;
    const pct = (val / 10) * 100;
    const color = val >= 8 ? "bg-green-500" : val >= 6 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-800 rounded-full h-2">
          <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-bold text-white w-6">{val}</span>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Performance</h2>

      {ratings.length === 0 ? (
        <div className="text-center py-8 text-gray-500"><Star className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No ratings yet.</p></div>
      ) : (
        <div className="space-y-4 mb-8">
          {ratings.map((r) => {
            const vals = [r.batting, r.bowling, r.fielding, r.fitness, r.attitude].filter(Boolean) as number[];
            const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "-";
            return (
              <div key={r.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-bold text-white text-sm">{r.sessionDate}</p>
                    <p className="text-xs text-gray-500">by {r.coachName}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{avg}</p>
                    <p className="text-xs text-gray-500">avg</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[["Batting", r.batting], ["Bowling", r.bowling], ["Fielding", r.fielding], ["Fitness", r.fitness], ["Attitude", r.attitude]].map(([k, v]) => (
                    <div key={k as string} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-16">{k}</span>
                      <div className="flex-1">{ratingBar(v as number)}</div>
                    </div>
                  ))}
                </div>
                {r.notes && <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-800 pt-2">{r.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {sessionNotes.length > 0 && (
        <>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Session Notes</h3>
          <div className="space-y-3">
            {sessionNotes.map(({ note, batch }) => (
              <div key={note.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">{note.sessionDate} · {batch?.name || "General"}</p>
                {note.drills && <p className="text-sm text-gray-300 mb-1"><span className="text-yellow-400 font-bold">Drills:</span> {note.drills}</p>}
                {note.highlights && <p className="text-sm text-gray-300"><span className="text-green-400 font-bold">Highlights:</span> {note.highlights}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NoticesTab({ notifications }: { notifications: any[] }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Notices & Announcements</h2>
      {notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-500"><Bell className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No notices yet.</p></div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="bg-[#0a0f1e] border border-yellow-500/20 rounded-xl p-4">
              <p className="font-bold text-white mb-1">{n.title}</p>
              <p className="text-sm text-gray-300 mb-2">{n.message}</p>
              <p className="text-xs text-gray-600">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (phone: string, data: PortalData) => void }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/parent?phone=${encodeURIComponent(phone.trim())}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Not found");
      }
      const data = await res.json();
      onLogin(phone.trim(), data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Parent Portal</h1>
          <p className="text-gray-400 text-sm">PIRcricketHub</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Your Registered Phone Number</label>
            <input
              required type="tel"
              className="w-full bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-yellow-500"
              value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60 text-base">
            {loading ? "Searching..." : "View My Child's Progress"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Enter the phone number you registered with.<br />
          <a href="https://wa.me/918936061688" target="_blank" rel="noreferrer" className="text-yellow-500 hover:text-yellow-400">Contact academy</a> if you need help.
        </p>
      </div>
    </div>
  );
}

// ─── Main Portal ──────────────────────────────────────────────────────
export default function ParentPortal() {
  const [data, setData] = useState<PortalData | null>(null);
  const [phone, setPhone] = useState("");
  const [tab, setTab] = useState("overview");

  if (!data) return <LoginScreen onLogin={(p, d) => { setPhone(p); setData(d); }} />;

  const { students, stats } = data;
  const child = students[0]?.student;
  const batch = students[0]?.batch;

  return (
    <div className="min-h-screen bg-[#0d1529] text-white">
      {/* Header */}
      <div className="bg-[#0a0f1e] border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Welcome back</p>
            <h1 className="font-bold text-white text-lg">{child?.name}</h1>
            <p className="text-xs text-yellow-400">{batch?.name || "No batch"} · {child?.ageGroup}</p>
          </div>
          <button onClick={() => setData(null)} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* Overview stats */}
        {tab === "overview" && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={CalendarDays} label="Attendance" value={`${stats.attendancePct}%`}
                color={stats.attendancePct >= 75 ? "border-green-500/20 text-green-400" : "border-red-500/20 text-red-400"} />
              <StatCard icon={CheckCircle} label="Sessions Present" value={`${stats.presentCount}/${stats.totalSessions}`}
                color="border-yellow-500/20 text-yellow-400" />
              <StatCard icon={IndianRupee} label="Fees Pending" value={`₹${stats.pendingFees.toLocaleString()}`}
                color={stats.pendingFees > 0 ? "border-red-500/20 text-red-400" : "border-green-500/20 text-green-400"} />
              <StatCard icon={Star} label="Latest Rating" value={stats.avgRating || "N/A"}
                color="border-blue-500/20 text-blue-400" />
            </div>

            {stats.attendancePct < 75 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-400 text-sm">Low Attendance</p>
                  <p className="text-gray-400 text-xs mt-0.5">Attendance below 75%. Regular practice is key to improvement.</p>
                </div>
              </div>
            )}

            {data.notifications.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-400">Latest Notice</p>
                </div>
                <p className="text-sm font-bold text-white">{data.notifications[0].title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{data.notifications[0].message}</p>
              </div>
            )}

            {data.sessionNotes.length > 0 && (
              <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <p className="text-sm font-bold text-blue-400">Latest Session</p>
                </div>
                <p className="text-xs text-gray-400">{data.sessionNotes[0].note.sessionDate}</p>
                {data.sessionNotes[0].note.drills && <p className="text-sm text-gray-300 mt-1"><span className="text-yellow-400 font-bold">Drills:</span> {data.sessionNotes[0].note.drills}</p>}
                {data.sessionNotes[0].note.highlights && <p className="text-sm text-gray-300 mt-1"><span className="text-green-400 font-bold">Highlights:</span> {data.sessionNotes[0].note.highlights}</p>}
              </div>
            )}
          </div>
        )}

        {tab === "attendance" && <AttendanceTab attendance={data.attendance} />}
        {tab === "fees" && <FeesTab fees={data.fees} pendingFees={stats.pendingFees} paidFees={stats.paidFees} />}
        {tab === "performance" && <PerformanceTab ratings={data.ratings} sessionNotes={data.sessionNotes} />}
        {tab === "notices" && <NoticesTab notifications={data.notifications} />}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1e] border-t border-gray-800 px-2 py-2 z-10">
        <div className="max-w-lg mx-auto flex justify-around">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${tab === id ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"}`}>
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
