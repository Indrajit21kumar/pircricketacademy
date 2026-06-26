import { useState, useEffect, useRef } from "react";
import { QrCode, CheckCircle, AlertCircle, Camera, Users } from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

type ScanResult = {
  success: boolean;
  message: string;
  studentName?: string;
  status?: string;
};

export default function ScanPage() {
  const [coachName, setCoachName] = useState(localStorage.getItem("coachName") || "");
  const [manualToken, setManualToken] = useState("");
  const [date, setDate] = useState(TODAY);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/attendance?date=${TODAY}`)
      .then(r => r.json())
      .then(data => setTodayCount(Array.isArray(data) ? data.length : 0));
  }, [result]);

  const markAttendance = async (token: string) => {
    if (!coachName.trim()) { setResult({ success: false, message: "Please enter your name first." }); return; }
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: token.trim(), markedBy: coachName, sessionDate: date, status: "present" }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setResult({ success: true, message: "Attendance marked!", studentName: data.student?.name, status: "present" });
      } else if (res.status === 409) {
        setResult({ success: false, message: `Already marked for today`, studentName: data.student?.name, status: data.student?.status });
      } else {
        setResult({ success: false, message: data.error || "Error marking attendance" });
      }
    } catch {
      setResult({ success: false, message: "Network error. Try again." });
    } finally {
      setLoading(false);
      setManualToken("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const saveCoach = () => { localStorage.setItem("coachName", coachName); };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold mb-1">QR Attendance</h1>
          <p className="text-gray-400 text-sm">PIR Cricket Academy</p>
        </div>

        {/* Today counter */}
        <div className="bg-[#0d1529] border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Today's Attendance</p>
              <p className="font-bold text-white">{date}</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-yellow-400">{todayCount}</span>
        </div>

        {/* Coach name */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Your Name (Coach)</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500"
              value={coachName} onChange={e => setCoachName(e.target.value)}
              placeholder="Coach Pankaj Mishra"
            />
            <button onClick={saveCoach} className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl text-sm font-bold hover:bg-yellow-500/20">Save</button>
          </div>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Session Date</label>
          <input type="date" className="w-full bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500"
            value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* QR Scan input — auto-focuses for USB/Bluetooth scanners */}
        <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="h-4 w-4 text-yellow-400" />
            <p className="text-sm font-bold text-yellow-400">Scan QR Code</p>
          </div>
          <p className="text-gray-400 text-xs mb-4">Point your phone/scanner at the student's QR code. The token will auto-fill below.</p>
          <input
            ref={inputRef}
            autoFocus
            className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono"
            value={manualToken}
            onChange={e => setManualToken(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") markAttendance(manualToken); }}
            placeholder="Token auto-fills on scan..."
          />
          <button
            disabled={loading || !manualToken.trim()}
            onClick={() => markAttendance(manualToken)}
            className="w-full mt-3 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Marking..." : "Mark Present"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 flex items-start gap-3 ${result.success ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
            {result.success
              ? <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              : <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
            <div>
              {result.studentName && <p className="font-bold text-white">{result.studentName}</p>}
              <p className={`text-sm ${result.success ? "text-green-400" : "text-red-400"}`}>{result.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
