import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, DollarSign, Bell, QrCode, CheckCircle, XCircle, Clock, AlertCircle, Star, IndianRupee } from "lucide-react";
import QRCode from "qrcode";

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (data: any) => void }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`/api/student-portal?phone=${encodeURIComponent(phone.trim())}`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Not found"); }
      onLogin(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-bold text-yellow-400 text-2xl">PIR</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Student Portal</h1>
          <p className="text-gray-400 text-sm">PIRcricketHub</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Registered Phone Number</label>
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-yellow-500"
              placeholder="+91 98765 43210" />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60">
            {loading ? "Searching..." : "View My Progress"}
          </button>
        </form>
        <p className="text-center text-gray-600 text-xs mt-6">
          Use the phone number registered with the academy.<br />
          <a href="https://wa.me/918936061688" target="_blank" rel="noreferrer" className="text-yellow-500 hover:text-yellow-400">Contact academy</a> if you need help.
        </p>
      </motion.div>
    </div>
  );
}

// ─── QR Card ─────────────────────────────────────────────────────────────────
function QRCard({ student }: { student: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && student.qrToken) {
      QRCode.toCanvas(canvasRef.current, student.qrToken, {
        width: 220, margin: 2,
        color: { dark: "#0a0f1e", light: "#ffffff" },
      });
    }
  }, [student.qrToken]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${student.name.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bg-[#0a0f1e] border border-gray-800 rounded-2xl p-6 text-center">
      <div className="flex items-center gap-2 justify-center mb-4">
        <QrCode className="h-5 w-5 text-yellow-400" />
        <p className="font-bold text-white">My Attendance QR</p>
      </div>
      <p className="text-xs text-gray-500 mb-4">Show this to your coach at the start of each session</p>
      <div className="flex justify-center mb-4">
        <canvas ref={canvasRef} className="rounded-xl" />
      </div>
      <p className="text-xs font-mono text-gray-600 mb-4 break-all">{student.qrToken}</p>
      <button onClick={download}
        className="w-full flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold py-2.5 rounded-xl hover:bg-yellow-500/20 text-sm transition-colors">
        <QrCode className="h-4 w-4" /> Download QR
      </button>
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────
function AttendanceTab({ attendance, stats }: { attendance: any[]; stats: any }) {
  const icon: Record<string,any> = {
    present: <CheckCircle className="h-4 w-4 text-green-400" />,
    late:    <Clock className="h-4 w-4 text-yellow-400" />,
    absent:  <XCircle className="h-4 w-4 text-red-400" />,
  };
  const color: Record<string,string> = { present:"text-green-400", late:"text-yellow-400", absent:"text-red-400" };
  const pctColor = stats.attendancePct >= 75 ? "text-green-400" : "text-red-400";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold ${pctColor}`}>{stats.attendancePct}%</p>
          <p className="text-xs text-gray-500 mt-1">Attendance</p>
        </div>
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.presentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </div>
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
      </div>
      {stats.attendancePct < 75 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div><p className="font-bold text-red-400 text-sm">Low Attendance</p><p className="text-xs text-gray-400 mt-0.5">Below 75%. Please attend regularly.</p></div>
        </div>
      )}
      {attendance.length === 0
        ? <div className="text-center py-10 text-gray-500"><Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No records yet.</p></div>
        : <div className="space-y-2">
            {attendance.map(a => (
              <div key={a.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon[a.status] || icon.absent}
                  <div>
                    <p className="text-sm font-bold text-white">{a.sessionDate}</p>
                    <p className="text-xs text-gray-500">Marked by {a.markedBy}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold capitalize ${color[a.status] || "text-gray-400"}`}>{a.status}</span>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ─── Fees Tab ─────────────────────────────────────────────────────────────────
function FeesTab({ fees, stats }: { fees: any[]; stats: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">₹{stats.paidFees.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total Paid</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">₹{stats.pendingFees.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Pending</p>
        </div>
      </div>
      {stats.pendingFees > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-400">Fee Due</p>
            <p className="text-xs text-gray-400">Please clear pending fees.</p>
            <a href="https://wa.me/918936061688?text=Hi%2C+I+want+to+pay+fees." target="_blank" rel="noreferrer"
              className="inline-block mt-2 text-xs font-bold text-green-400 hover:text-green-300">Pay via WhatsApp →</a>
          </div>
        </div>
      )}
      {fees.length === 0
        ? <div className="text-center py-8 text-gray-500">No fee records yet.</div>
        : <div className="space-y-2">
            {fees.map(f => (
              <div key={f.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white capitalize">{f.feeType} — {f.month}</p>
                  {f.dueDate && <p className="text-xs text-gray-500">Due: {f.dueDate}</p>}
                  {f.receiptNo && <p className="text-xs text-gray-500">Receipt: {f.receiptNo}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">₹{f.amount.toLocaleString()}</p>
                  <span className={`text-xs font-bold ${f.paid?"text-green-400":"text-red-400"}`}>{f.paid?`Paid ${f.paidDate||""}`:f.paidAmount>0?"Partial":"Pending"}</span>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ─── Performance Tab ──────────────────────────────────────────────────────────
function PerformanceTab({ ratings }: { ratings: any[] }) {
  if (ratings.length === 0) return (
    <div className="text-center py-12 text-gray-500"><Star className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No ratings yet.</p></div>
  );
  return (
    <div className="space-y-4">
      {ratings.map(r => {
        const vals = [r.batting, r.bowling, r.fielding, r.fitness, r.attitude].filter(Boolean) as number[];
        const avg = vals.length ? (vals.reduce((a,b) => a+b,0)/vals.length).toFixed(1) : "-";
        const color = parseFloat(avg)>=8?"text-green-400":parseFloat(avg)>=6?"text-yellow-400":"text-red-400";
        return (
          <div key={r.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div><p className="font-bold text-white text-sm">{r.sessionDate}</p><p className="text-xs text-gray-500">by {r.coachName}</p></div>
              <div className="text-center"><p className={`text-2xl font-bold ${color}`}>{avg}</p><p className="text-xs text-gray-500">avg</p></div>
            </div>
            <div className="space-y-1.5">
              {[["Batting",r.batting],["Bowling",r.bowling],["Fielding",r.fielding],["Fitness",r.fitness],["Attitude",r.attitude]].map(([k,v]) =>
                v != null && (
                  <div key={k as string} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">{k}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-yellow-500" style={{width:`${((v as number)/10)*100}%`}} />
                    </div>
                    <span className="text-xs font-bold text-white w-5">{v}</span>
                  </div>
                )
              )}
            </div>
            {r.notes && <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-800 pt-2">{r.notes}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Portal ──────────────────────────────────────────────────────────────
const TABS = [
  { id:"overview",    label:"Overview",    icon:TrendingUp },
  { id:"qr",         label:"My QR",       icon:QrCode },
  { id:"attendance",  label:"Attendance",  icon:Calendar },
  { id:"fees",        label:"Fees",        icon:IndianRupee },
  { id:"performance", label:"Performance", icon:Star },
  { id:"notices",    label:"Notices",     icon:Bell },
];

export default function Student() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab]   = useState("overview");

  if (!data) return <LoginScreen onLogin={setData} />;

  const { student, batch, stats, attendance, fees, ratings, notices } = data;

  return (
    <div className="min-h-screen bg-[#0d1529] text-white pb-24">
      {/* Header */}
      <div className="bg-[#0a0f1e] border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Student Portal</p>
            <h1 className="font-bold text-white text-lg">{student.name}</h1>
            <p className="text-xs text-yellow-400">{batch?.name || "No batch"} · {student.ageGroup}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-yellow-400 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">← Home</Link>
            <button onClick={() => setData(null)} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {tab === "overview" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-xl font-bold ${stats.attendancePct>=75?"text-green-400":"text-red-400"}`}>{stats.attendancePct}%</p>
                <p className="text-xs text-gray-500 mt-1">Attendance</p>
              </div>
              <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-yellow-400">{student.ageGroup}</p>
                <p className="text-xs text-gray-500 mt-1">Level</p>
              </div>
              <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-xl font-bold ${stats.pendingFees>0?"text-red-400":"text-green-400"}`}>
                  {stats.pendingFees>0?"Due":"Clear"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Fees</p>
              </div>
            </div>
            <QRCard student={student} />
            {notices.length > 0 && (
              <div className="bg-[#0a0f1e] border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2"><Bell className="h-4 w-4 text-yellow-400" /><p className="text-sm font-bold text-yellow-400">Latest Notice</p></div>
                <p className="text-sm font-bold text-white">{notices[0].title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{notices[0].message}</p>
              </div>
            )}
          </motion.div>
        )}
        {tab === "qr"          && <motion.div initial={{opacity:0}} animate={{opacity:1}}><QRCard student={student} /></motion.div>}
        {tab === "attendance"  && <motion.div initial={{opacity:0}} animate={{opacity:1}}><AttendanceTab attendance={attendance} stats={stats} /></motion.div>}
        {tab === "fees"        && <motion.div initial={{opacity:0}} animate={{opacity:1}}><FeesTab fees={fees} stats={stats} /></motion.div>}
        {tab === "performance" && <motion.div initial={{opacity:0}} animate={{opacity:1}}><PerformanceTab ratings={ratings} /></motion.div>}
        {tab === "notices"     && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
            {notices.length === 0
              ? <div className="text-center py-10 text-gray-500"><Bell className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No notices.</p></div>
              : notices.map((n: any) => (
                  <div key={n.id} className="bg-[#0a0f1e] border border-yellow-500/20 rounded-xl p-4">
                    <p className="font-bold text-white mb-1">{n.title}</p>
                    <p className="text-sm text-gray-300">{n.message}</p>
                    <p className="text-xs text-gray-600 mt-2">{new Date(n.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                ))
            }
          </motion.div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1e] border-t border-gray-800 px-2 py-2 z-10">
        <div className="max-w-lg mx-auto flex justify-around">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${tab===id?"text-yellow-400":"text-gray-600 hover:text-gray-400"}`}>
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
