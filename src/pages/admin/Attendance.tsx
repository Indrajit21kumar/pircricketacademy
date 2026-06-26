import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle, Clock, Users } from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

export default function AttendancePage() {
  const [date, setDate] = useState(TODAY);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/attendance?date=${date}`);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [date]);

  const present = records.filter(r => r.attendance.status === "present").length;
  const late = records.filter(r => r.attendance.status === "late").length;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <CalendarDays className="h-7 w-7 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">Attendance</h1>
            <p className="text-gray-400 text-sm">Daily session records</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="flex-1 min-w-[140px] bg-[#0d1529] border border-green-500/20 rounded-xl p-4 text-center">
            <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-400">{present}</p>
            <p className="text-gray-400 text-xs">Present</p>
          </div>
          <div className="flex-1 min-w-[140px] bg-[#0d1529] border border-yellow-500/20 rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-400">{late}</p>
            <p className="text-gray-400 text-xs">Late</p>
          </div>
          <div className="flex-1 min-w-[140px] bg-[#0d1529] border border-gray-700 rounded-xl p-4 text-center">
            <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{present + late}</p>
            <p className="text-gray-400 text-xs">Total</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Select Date</label>
          <input type="date" className="bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500"
            value={date} onChange={e => setDate(e.target.value)} max={TODAY} />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No attendance recorded for this date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.attendance.id} className="bg-[#0d1529] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xs">
                    {r.student?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{r.student?.name}</p>
                    <p className="text-gray-400 text-xs">{r.batch?.name || "No batch"} · Marked by {r.attendance.markedBy}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${r.attendance.status === "present" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                  {r.attendance.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
