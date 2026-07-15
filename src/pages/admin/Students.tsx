import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Users, Plus, QrCode, Download, Search, X, ChevronLeft } from "lucide-react";
import QRCode from "qrcode";

const AGE_GROUPS = ["U8","U10","U12","U14","U16","U19","Elite"];

type Student = {
  student: {
    id: number; name: string; dob: string; ageGroup: string;
    parentName: string; phone: string; email: string | null;
    bloodGroup: string | null; qrToken: string; status: string;
    batchId: number | null;
  };
  batch: { id: number; name: string } | null;
};

function QRModal({ student, onClose }: { student: Student["student"]; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, student.qrToken, {
        width: 200, margin: 2,
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1529] border border-yellow-500/20 rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-lg">QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-yellow-400 font-bold text-xl mb-1">{student.name}</p>
        <p className="text-gray-400 text-sm mb-6">{student.ageGroup} · {student.phone}</p>
        <div className="flex justify-center mb-6">
          <canvas ref={canvasRef} className="rounded-xl" />
        </div>
        <button onClick={download} className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
          <Download className="h-4 w-4" /> Download QR
        </button>
      </div>
    </div>
  );
}

function AddStudentModal({ batches, onClose, onSaved }: { batches: any[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: "", dob: "", ageGroup: "U12", batchId: "", parentName: "",
    phone: "", email: "", bloodGroup: "", status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, batchId: form.batchId ? parseInt(form.batchId) : null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-[#0a0f1e] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500";
  const lbl = "block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0d1529] border border-yellow-500/20 rounded-2xl p-6 max-w-lg w-full my-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-white text-lg">Add Student</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Student Name *</label><input required className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Arjun Kumar" /></div>
            <div><label className={lbl}>Date of Birth *</label><input required type="date" className={inp} value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Age Group *</label>
              <select required className={inp} value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>
                {AGE_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Batch</label>
              <select className={inp} value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })}>
                <option value="">No batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Parent Name *</label><input required className={inp} value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} placeholder="Ramesh Kumar" /></div>
            <div><label className={lbl}>Phone *</label><input required className={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Email</label><input type="email" className={inp} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className={lbl}>Blood Group</label><input className={inp} value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} placeholder="O+" /></div>
          </div>
          <div><label className={lbl}>Status</label>
            <select className={inp} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Add Student"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [qrStudent, setQrStudent] = useState<Student["student"] | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, b] = await Promise.all([fetch("/api/students").then(r => r.json()), fetch("/api/batches").then(r => r.json())]);
    setStudents(s);
    setBatches(b);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    s.student.name.toLowerCase().includes(search.toLowerCase()) ||
    s.student.phone.includes(search) ||
    s.student.parentName.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    active: "bg-green-500/15 text-green-400",
    trial: "bg-yellow-500/15 text-yellow-400",
    inactive: "bg-gray-500/15 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-8">
      {qrStudent && <QRModal student={qrStudent} onClose={() => setQrStudent(null)} />}
      {showAdd && <AddStudentModal batches={batches} onClose={() => setShowAdd(false)} onSaved={load} />}

      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors mb-6"><ChevronLeft className="h-4 w-4" /> Dashboard</Link>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">Students</h1>
              <p className="text-gray-400 text-sm">{students.length} registered</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-yellow-400 transition-colors text-sm">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input className="w-full bg-[#0d1529] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="Search by name, phone, or parent..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading students...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{search ? "No students match your search." : "No students yet. Add your first student!"}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(({ student, batch }) => (
              <div key={student.id} className="bg-[#0d1529] border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center font-bold text-yellow-400 text-sm shrink-0">
                    {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{student.name}</p>
                    <p className="text-gray-400 text-xs">{student.parentName} · {student.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden md:block text-xs text-gray-400">{batch?.name || "No batch"}</span>
                  <span className="hidden md:block text-xs text-gray-400">{student.ageGroup}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[student.status] || statusColor.inactive}`}>{student.status}</span>
                  <button onClick={() => setQrStudent(student)} className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="View QR">
                    <QrCode className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
