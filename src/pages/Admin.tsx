import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import { Users, TrendingUp, DollarSign, Activity, BarChart3, Calendar, X, RefreshCw, ExternalLink, Tag, Plus, Pencil, Trash2, CheckCircle, XCircle, FileText, Send, Megaphone } from "lucide-react";
import { GroundTrackerContent } from "./admin/GroundTracker";

// ── Types ────────────────────────────────────────────────────────────────────
interface Admission { id:number; studentName:string; dob:string; ageGroup:string; school?:string|null; parentName:string; phone:string; email?:string|null; address?:string|null; bloodGroup?:string|null; createdAt:string; status:string; isTrial:boolean; paymentStatus:string; registrationFee:number; totalPaid:number; packageMonths?:number|null; packageDiscountPct?:number|null; eligibilityDiscountPct?:number|null; combinedDiscountPct?:number|null; razorpayPaymentId?:string; paidAt?:string; }
interface Booking   { id:number; ref:string; facilityName:string; date:string; slot:string; name:string; phone:string; total:number; discountPct?:number|null; discountedTotal?:number|null; discountNote?:string|null; status:string; refundAmount?:number|null; createdAt:string; }
interface Inquiry   { id:number; name:string; phone:string; childName:string; ageGroup:string; source:string; createdAt:string; status:string; }

// ── Auth helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = "pir_admin_token";
const getToken  = () => localStorage.getItem(TOKEN_KEY);
const setToken  = (t: string) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch("/api" + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...(opts.headers ?? {}) },
  });
  if (res.status === 401) { clearToken(); window.location.reload(); }
  return res;
}

const TABS = ["Dashboard","Ground Tracker","Inquiries","Admissions","Bookings","Fees","Students","Coaches","Discounts","Broadcast","Pricing"];

const MODULES = [
  { label: "Students & QR",   href: "/admin/students",        color: "text-blue-400",   bg: "bg-blue-400/10" },
  { label: "Attendance",      href: "/admin/attendance",      color: "text-green-400",  bg: "bg-green-400/10" },
  { label: "Lead CRM",        href: "/admin/crm",             color: "text-orange-400", bg: "bg-orange-400/10" },
  { label: "Communications",  href: "/admin/comms",           color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Calendar",        href: "/admin/calendar",        color: "text-secondary",  bg: "bg-secondary/10" },
  { label: "Ground Tracker",  href: "/admin/ground-tracker",  color: "text-teal-400",   bg: "bg-teal-400/10" },
];

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    new:"bg-secondary/10 text-secondary", contacted:"bg-blue-400/10 text-blue-400", converted:"bg-green-400/10 text-green-400",
    trial_scheduled:"bg-blue-400/10 text-blue-400", joined:"bg-green-400/10 text-green-400", rejected:"bg-red-400/10 text-red-400",
    confirmed:"bg-green-400/10 text-green-400", completed:"bg-muted text-muted-foreground", cancelled:"bg-red-400/10 text-red-400",
    cancellation_requested:"bg-orange-400/10 text-orange-400", refunded:"bg-purple-400/10 text-purple-400",
  };
  return <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${map[s] ?? "bg-muted text-muted-foreground"}`}>{s.replace("_"," ")}</span>;
}

// ── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onAuth, resetToken }: { onAuth: () => void; resetToken?: string }) {
  const [mode, setMode] = useState<"login"|"forgot"|"reset">(resetToken ? "reset" : "login");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setToken(data.token); onAuth();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(""); setMsg("");
    try {
      await fetch("/api/password-reset/request", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username }) });
      setMsg("Reset link sent to the admin email (if username exists).");
    } finally { setLoading(false); }
  };

  const confirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/password-reset/confirm", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ token: resetToken, password: newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setMsg("Password reset! You can now log in."); setMode("login");
      window.history.replaceState({}, "", "/admin");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors";
  const btnCls = "w-full bg-secondary text-secondary-foreground font-bold uppercase py-3.5 rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-60";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="bg-card border border-border rounded-2xl p-10 w-full max-w-sm">
        <div className="flex justify-start mb-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">← Home</Link>
        </div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/10 border-2 border-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-secondary text-2xl font-black">PIR</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">PIRcricketHub — Founder Login</p>
        </div>

        {mode === "login" && (
          <form onSubmit={login} className="space-y-4">
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Username</label><input value={username} onChange={e=>setUsername(e.target.value)} className={inputCls} placeholder="admin"/></div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className={inputCls} placeholder="••••••••" autoFocus/></div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {msg   && <p className="text-green-400 text-sm text-center">{msg}</p>}
            <button type="submit" disabled={loading} className={btnCls}>{loading?"Signing in…":"Sign In"}</button>
            <button type="button" onClick={()=>{setMode("forgot");setError("");setMsg("");}} className="w-full text-muted-foreground text-xs hover:text-foreground">Forgot password?</button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={requestReset} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-2">Enter your username and we'll email a reset link.</p>
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Username</label><input value={username} onChange={e=>setUsername(e.target.value)} className={inputCls} placeholder="admin" autoFocus/></div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {msg   && <p className="text-green-400 text-sm text-center">{msg}</p>}
            <button type="submit" disabled={loading} className={btnCls}>{loading?"Sending…":"Send Reset Link"}</button>
            <button type="button" onClick={()=>setMode("login")} className="w-full text-muted-foreground text-xs hover:text-foreground">← Back to login</button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={confirmReset} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-2">Set your new password</p>
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">New Password</label><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className={inputCls} placeholder="Min 8 characters" autoFocus minLength={8}/></div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Confirm Password</label><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={inputCls} placeholder="Repeat password"/></div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {msg   && <p className="text-green-400 text-sm text-center">{msg}</p>}
            <button type="submit" disabled={loading} className={btnCls}>{loading?"Resetting…":"Set New Password"}</button>
          </form>
        )}

        {mode === "login" && (
          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-muted-foreground text-xs mb-2">First time? Set up your admin account:</p>
            <SetupAdmin />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SetupAdmin() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState(""); const [msg, setMsg] = useState("");
  const setup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/setup", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ password: pw }) });
    const d = await res.json();
    setMsg(res.ok ? "✅ Admin created. Now log in." : "❌ " + d.error);
  };
  if (!open) return <button onClick={()=>setOpen(true)} className="text-secondary text-xs underline">First-time setup →</button>;
  return (
    <form onSubmit={setup} className="space-y-2 mt-2">
      <input value={pw} onChange={e=>setPw(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary" placeholder="Choose admin password (min 8 chars)" minLength={8}/>
      <button type="submit" className="w-full bg-secondary/20 text-secondary text-xs font-bold py-2 rounded-lg hover:bg-secondary/30">Create Admin Account</button>
      {msg && <p className="text-xs text-center mt-1">{msg}</p>}
    </form>
  );
}

// ── Main Admin ────────────────────────────────────────────────────────────────
export default function Admin() {
  const search = useSearch();
  const resetToken = new URLSearchParams(search).get("reset") || undefined;
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState("Dashboard");
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [inquiries,  setInquiries]  = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupMsg, setCleanupMsg] = useState("");
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [markPaidAdm, setMarkPaidAdm] = useState<Admission | null>(null);
  const [markPaidAmount, setMarkPaidAmount] = useState("");
  const [markPaidNote, setMarkPaidNote] = useState("");
  const [markPaidBooking, setMarkPaidBooking] = useState<Booking | null>(null);
  const [markPaidBookingNote, setMarkPaidBookingNote] = useState("");
  const [discountBooking, setDiscountBooking] = useState<Booking | null>(null);
  const [discountForm, setDiscountForm] = useState({ pct: 0, note: "" });
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailResult, setEmailResult] = useState<any>(null);
  const [trialModal, setTrialModal] = useState<{id:number;name:string;parentName:string} | null>(null);
  const [trialDate, setTrialDate] = useState("");
  const [trialSlot, setTrialSlot] = useState("06:00 AM");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, bRes, iRes, sRes] = await Promise.all([
        apiFetch("/admissions"), apiFetch("/bookings"), apiFetch("/inquiries"), apiFetch("/students"),
      ]);
      const adms: Admission[] = aRes.ok ? await aRes.json() : [];
      if (aRes.ok) setAdmissions(adms);
      if (bRes.ok) setBookings(await bRes.json());
      if (iRes.ok) setInquiries(await iRes.json());
      if (sRes.ok) {
        const studentRows: { student: { name: string; phone: string } }[] = await sRes.json();
        // Build a set of enrolled admission IDs by matching phone+name
        const enrolled = new Set<number>();
        adms.forEach(a => {
          const phone10 = a.phone.replace(/\D/g, "").slice(-10);
          const nameLower = a.studentName.trim().toLowerCase();
          const found = studentRows.some(r =>
            r.student.phone.replace(/\D/g, "").slice(-10) === phone10 &&
            r.student.name.trim().toLowerCase() === nameLower
          );
          if (found) enrolled.add(a.id);
        });
        setEnrolledIds(enrolled);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const enrollAsStudent = async (a: Admission) => {
    await apiFetch("/students", {
      method: "POST",
      body: JSON.stringify({
        name: a.studentName, dob: a.dob, ageGroup: a.ageGroup,
        parentName: a.parentName, phone: a.phone,
        email: a.email || undefined, address: a.address || undefined,
        bloodGroup: a.bloodGroup || undefined, status: "active",
      }),
    });
    setEnrolledIds(prev => new Set(prev).add(a.id));
  };

  const updateStatus = async (type: string, id: number, status: string) => {
    await apiFetch(`/${type}/${id}/status`, { method:"PATCH", body: JSON.stringify({ status }) });
    if (type === "admissions" && status === "joined") {
      const adm = admissions.find(a => a.id === id);
      if (adm) await enrollAsStudent(adm);
    }
    load();
  };

  const cleanupBookings = async () => {
    if (!confirm(`Delete all bookings older than ${cleanupDays} days? This cannot be undone.`)) return;
    setCleanupMsg("Deleting...");
    try {
      const res = await apiFetch(`/bookings/cleanup?days=${cleanupDays}`, { method: "DELETE" });
      const data = await res.json();
      setCleanupMsg(data.message || `Deleted ${data.deleted} bookings`);
      load();
    } catch {
      setCleanupMsg("Error — please try again.");
    }
  };

  if (!authed) return <LoginScreen onAuth={() => setAuthed(true)} resetToken={resetToken} />;

  // KPIs computed from real data
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const groundRevenue = confirmedBookings.reduce((s, b) => s + b.total, 0);
  const joinedStudents = admissions.filter(a => a.status === "joined");
  const paidAdmissions = admissions.filter(a => a.paymentStatus === "paid");
  const admissionRevenue = paidAdmissions.reduce((s, a) => s + (a.totalPaid || a.registrationFee || 5000), 0);
  const KPI = [
    { label:"Total Applications", value: String(admissions.length),        icon:Users,    color:"text-blue-400",   bg:"bg-blue-400/10",  tab:"Admissions" },
    { label:"Joined Students",    value: String(joinedStudents.length),     icon:Activity, color:"text-green-400",  bg:"bg-green-400/10", tab:"Admissions" },
    { label:"Ground Bookings",    value: String(confirmedBookings.length),  icon:Calendar, color:"text-purple-400", bg:"bg-purple-400/10",tab:"Bookings" },
    { label:"Ground Revenue",     value: `₹${groundRevenue.toLocaleString()}`, icon:DollarSign, color:"text-secondary", bg:"bg-secondary/10", tab:"Bookings" },
    { label:"Admission Revenue",  value: `₹${admissionRevenue.toLocaleString()}`, icon:TrendingUp, color:"text-green-400", bg:"bg-green-400/10", tab:"Admissions" },
    { label:"New Leads",          value: String(inquiries.filter(i=>i.status==="new").length), icon:BarChart3, color:"text-orange-400", bg:"bg-orange-400/10", href:"/admin/crm" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="font-display text-secondary font-black text-xl">PIR</span>
            <span className="text-muted-foreground text-sm">Admin Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors">
              <RefreshCw className={`h-3 w-3 ${loading?"animate-spin":""}`}/> Refresh
            </button>
            <span className="text-xs text-muted-foreground hidden sm:block">Indrajit Kumar — Founder</span>
            <Link href="/curriculum" className="text-xs text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 rounded-lg px-3 py-1.5 font-bold hover:bg-yellow-500/20 transition-colors">Curriculum</Link>
            <button onClick={()=>{clearToken();setAuthed(false);}} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors"><X className="h-3 w-3"/> Sign out</button>
          </div>
        </div>
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab===t?"border-secondary text-secondary":"border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Dashboard */}
        {tab==="Dashboard" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold">Founder Dashboard</h2>
              <p className="text-muted-foreground">Live data — PIRcricketHub, Patna</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {KPI.map(k => {
                const cardCls = "bg-card border border-border rounded-2xl p-5 text-left w-full hover:border-secondary/40 hover:bg-secondary/5 transition-all cursor-pointer group";
                const inner = <>
                  <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}><k.icon className={`h-5 w-5 ${k.color}`}/></div>
                  <p className={`text-2xl font-bold font-display ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors">{k.label} →</p>
                </>;
                return k.href
                  ? <Link key={k.label} href={k.href} className={cardCls}>{inner}</Link>
                  : <button key={k.label} onClick={()=>setTab((k as any).tab)} className={cardCls}>{inner}</button>;
              })}
            </div>
            {/* Email diagnostic */}
            <div className="mb-6 bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-sm">Email Diagnostics</h3>
                  <p className="text-xs text-muted-foreground">Send a test email to admin inbox to verify Resend is working</p>
                </div>
                <button
                  disabled={emailTesting}
                  onClick={async () => {
                    setEmailTesting(true); setEmailResult(null);
                    const r = await apiFetch("/debug-email");
                    setEmailResult(await r.json());
                    setEmailTesting(false);
                  }}
                  className="px-4 py-2 bg-secondary text-black font-bold text-xs rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >{emailTesting ? "Testing…" : "Send Test Email"}</button>
              </div>
              {emailResult && (
                <div className={`mt-3 p-3 rounded-lg text-xs font-mono border ${emailResult.ok ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(emailResult, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Module quick-links */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Management Modules</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {MODULES.map(m => (
                  <Link key={m.href} href={m.href}
                    className={`flex items-center justify-between gap-2 ${m.bg} border border-transparent hover:border-border rounded-2xl px-4 py-3 transition-all group`}>
                    <span className={`text-sm font-bold ${m.color}`}>{m.label}</span>
                    <ExternalLink className={`h-3.5 w-3.5 ${m.color} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Today's Bookings — prominent panel */}
            {(() => {
              const todayStr = new Date().toISOString().split("T")[0];
              const todayBookings = bookings.filter(b => b.date === todayStr && b.status === "confirmed");
              const todayRevenue = todayBookings.reduce((s,b) => s + b.total, 0);
              return (
                <div className="mb-6 bg-secondary/5 border border-secondary/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-secondary">Today's Ground Bookings</h3>
                      <p className="text-xs text-muted-foreground">{todayStr} · {todayBookings.length} booking{todayBookings.length!==1?"s":""} · ₹{todayRevenue.toLocaleString()} confirmed</p>
                    </div>
                    <Link href="/admin/ground-tracker" className="text-xs text-secondary border border-secondary/30 rounded-lg px-3 py-1.5 hover:bg-secondary/10 transition-colors flex items-center gap-1">
                      Full Tracker <ExternalLink className="h-3 w-3"/>
                    </Link>
                  </div>
                  {todayBookings.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No confirmed bookings today.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {todayBookings.map(b=>(
                        <div key={b.id} className="bg-card border border-secondary/20 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-bold text-sm">{b.name}</p>
                            <span className="text-secondary font-bold text-sm shrink-0">₹{b.total.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{b.facilityName}</p>
                          <p className="text-xs text-muted-foreground">{b.slot} · {b.ref}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Recent Applications</h3>
                  <button onClick={() => setTab("Admissions")} className="text-xs text-secondary hover:underline">View all →</button>
                </div>
                {admissions.length === 0 ? <p className="text-muted-foreground text-sm">No applications yet.</p> :
                  <div className="space-y-3">
                    {admissions.slice(0,5).map(a=>(
                      <div key={a.id} className="flex items-center justify-between gap-2 group">
                        <div><p className="font-semibold text-sm">{a.studentName}</p><p className="text-xs text-muted-foreground">{a.ageGroup} · {a.parentName}</p></div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge s={a.status} />
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete application for ${a.studentName}? This cannot be undone.`)) return;
                              await apiFetch(`/admissions/${a.id}`, { method: "DELETE" });
                              load();
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-xs border border-red-400/30 hover:border-red-400/60 px-2 py-0.5 rounded-lg"
                            title="Delete application"
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">All Bookings</h3>
                  <span className="text-xs text-muted-foreground">{bookings.filter(b=>b.status==="confirmed").length} confirmed</span>
                </div>
                {/* Cleanup old bookings */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-red-950/30 border border-red-500/20 rounded-xl">
                  <span className="text-xs text-muted-foreground shrink-0">Delete bookings older than</span>
                  <select value={cleanupDays} onChange={e=>setCleanupDays(Number(e.target.value))}
                    className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground">
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                  <button onClick={cleanupBookings}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0">
                    🗑 Delete
                  </button>
                  {cleanupMsg && <span className="text-xs text-green-400 truncate">{cleanupMsg}</span>}
                </div>
                {bookings.length === 0 ? <p className="text-muted-foreground text-sm">No bookings yet.</p> :
                  <div className="space-y-3">
                    {bookings.filter(b=>b.status==="confirmed").slice(0,6).map(b=>(
                      <div key={b.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{b.name} <span className="text-xs text-muted-foreground font-normal">· {b.facilityName}</span></p>
                          <p className="text-xs text-muted-foreground">{b.date} · {b.slot} · <span className="font-mono">{b.ref}</span></p>
                        </div>
                        <span className="text-secondary font-bold text-sm shrink-0">₹{b.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>
          </motion.div>
        )}

        {/* Ground Tracker */}
        {tab==="Ground Tracker" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold">Ground Tracker</h2>
              <p className="text-muted-foreground">Live slot availability — all facilities</p>
            </div>
            <GroundTrackerContent />
          </motion.div>
        )}

        {/* Inquiries */}
        {tab==="Inquiries" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="mb-6"><h2 className="font-display text-3xl font-bold">Inquiries</h2><p className="text-muted-foreground">{inquiries.length} total · {inquiries.filter(i=>i.status==="new").length} new</p></div>
            {inquiries.length===0 ? <p className="text-muted-foreground">No inquiries yet.</p> :
              <div className="space-y-3">
                {inquiries.map(i=>(
                  <div key={i.id} className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
                    <div>
                      <p className="font-bold">{i.name} <span className="text-xs text-muted-foreground font-normal">· {i.childName} ({i.ageGroup})</span></p>
                      <p className="text-sm text-muted-foreground">{i.phone}{i.source ? ` · via ${i.source}` : ""}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(i.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge s={i.status} />
                      {["new","contacted","converted"].map(s=>(
                        s !== i.status && <button key={s} onClick={()=>updateStatus("inquiries",i.id,s)} className="text-xs border border-border rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors">→ {s}</button>
                      ))}
                      <button
                        onClick={async()=>{
                          if(!confirm(`Delete inquiry from ${i.name} (${i.childName})? This cannot be undone.`)) return;
                          await apiFetch(`/inquiries/${i.id}`,{method:"DELETE"});
                          setInquiries(prev=>prev.filter(x=>x.id!==i.id));
                        }}
                        className="text-xs border border-red-500/30 rounded-lg px-2.5 py-1 text-red-400 hover:bg-red-500/10 transition-colors"
                      >Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </motion.div>
        )}

        {/* Admissions */}
        {tab==="Admissions" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="font-display text-3xl font-bold">Admissions</h2><p className="text-muted-foreground">{admissions.length} total · {admissions.filter(a=>a.status==="new").length} new</p></div>
              <Link href="/admin/scan-form" className="inline-flex items-center gap-2 bg-secondary text-black font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-secondary/90 transition-colors shrink-0">
                📷 Scan Paper Form
              </Link>
            </div>
            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-card border border-border rounded-xl p-4"><p className="text-xl font-bold font-display">{admissions.length}</p><p className="text-xs text-muted-foreground">Total Applications</p></div>
              <div className="bg-card border border-green-400/30 rounded-xl p-4"><p className="text-xl font-bold font-display text-green-400">{paidAdmissions.length}</p><p className="text-xs text-muted-foreground">Payment Paid</p></div>
              <div className="bg-card border border-yellow-400/30 rounded-xl p-4"><p className="text-xl font-bold font-display text-yellow-400">{admissions.filter(a=>a.paymentStatus==="pending").length}</p><p className="text-xs text-muted-foreground">Pending Payment</p></div>
              <div className="bg-card border border-secondary/30 rounded-xl p-4"><p className="text-xl font-bold font-display text-secondary">₹{admissionRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Revenue Collected</p></div>
            </div>
            {admissions.length===0 ? <p className="text-muted-foreground">No applications yet.</p> :
              <div className="space-y-3">
                {admissions.map(a => {
                  const isPaid = a.paymentStatus === "paid";
                  const amountPaid = a.totalPaid || a.registrationFee || 5000;
                  const stageColor = {
                    new: "bg-blue-400/10 text-blue-400 border-blue-400/20",
                    trial_scheduled: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
                    joined: "bg-green-400/10 text-green-400 border-green-400/20",
                    rejected: "bg-red-400/10 text-red-400 border-red-400/20",
                  }[a.status] || "bg-gray-400/10 text-gray-400 border-gray-400/20";
                  const stageLabel = { new:"New", trial_scheduled:"Trial Scheduled", joined:"Joined", rejected:"Rejected" }[a.status] || a.status;

                  return (
                    <div key={a.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                      {/* Top row — name + stage */}
                      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                        <div className="min-w-0">
                          <p className="font-bold text-base leading-tight truncate">{a.studentName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.ageGroup}{a.isTrial ? " · Trial" : ""} · {a.packageMonths ? `${a.packageMonths}-Month Pack` : "Registration Only"}</p>
                        </div>
                        <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${stageColor}`}>{stageLabel}</span>
                      </div>

                      {/* Detail row */}
                      <div className="px-5 pb-3 flex flex-wrap gap-x-6 gap-y-0.5 text-xs text-muted-foreground">
                        <span>👤 {a.parentName} · {a.phone}</span>
                        <span>📅 {new Date(a.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                        {(a.combinedDiscountPct ?? 0) > 0 && <span>🏷 {a.combinedDiscountPct}% discount</span>}
                        {a.razorpayPaymentId && <span className="font-mono">Ref: {a.razorpayPaymentId.slice(0,16)}…</span>}
                      </div>

                      {/* Action footer */}
                      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border/50 bg-muted/20 flex-wrap">
                        {/* Payment status */}
                        <span className={`text-sm font-bold ${isPaid ? "text-green-400" : "text-yellow-400"}`}>
                          {isPaid ? `₹${amountPaid.toLocaleString()} paid` : "Payment pending"}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Primary workflow action */}
                          {a.status === "new" && (
                            <button onClick={() => { setTrialModal({id:a.id,name:a.studentName,parentName:a.parentName}); setTrialDate(""); setTrialSlot("06:00 AM"); }}
                              className="text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 rounded-lg px-3 py-1.5 hover:bg-yellow-400/20 font-semibold transition-colors">
                              Schedule Trial →
                            </button>
                          )}
                          {a.status === "trial_scheduled" && <>
                            <button onClick={()=>updateStatus("admissions",a.id,"joined")}
                              className="text-xs bg-green-400/10 border border-green-400/30 text-green-400 rounded-lg px-3 py-1.5 hover:bg-green-400/20 font-semibold transition-colors">
                              Mark Joined ✓
                            </button>
                            <button onClick={() => { setTrialModal({id:a.id,name:a.studentName,parentName:a.parentName}); setTrialDate(""); setTrialSlot("06:00 AM"); }}
                              className="text-xs border border-border text-muted-foreground rounded-lg px-3 py-1.5 hover:text-foreground transition-colors">
                              Reschedule
                            </button>
                          </>}
                          {a.status === "joined" && (
                            enrolledIds.has(a.id)
                              ? <span className="text-xs text-green-400 font-semibold">✅ Enrolled in system</span>
                              : <button onClick={async () => { await enrollAsStudent(a); setEnrolledIds(prev => new Set(prev).add(a.id)); }}
                                  className="text-xs bg-blue-400/10 border border-blue-400/30 text-blue-400 rounded-lg px-3 py-1.5 hover:bg-blue-400/20 font-semibold transition-colors">
                                  👤 Enroll as Student
                                </button>
                          )}
                          {a.status === "rejected" && (
                            <button onClick={()=>updateStatus("admissions",a.id,"new")}
                              className="text-xs border border-border text-muted-foreground rounded-lg px-3 py-1.5 hover:text-foreground transition-colors">
                              ↩ Reconsider
                            </button>
                          )}

                          {/* Secondary: payment + reject + delete */}
                          {!isPaid && (
                            <button onClick={() => { setMarkPaidAdm(a); setMarkPaidAmount(String(amountPaid)); setMarkPaidNote(""); }}
                              className="text-xs border border-green-400/30 text-green-400 rounded-lg px-3 py-1.5 hover:bg-green-400/10 transition-colors">
                              Mark Paid
                            </button>
                          )}
                          {a.status === "new" && (
                            <button onClick={()=>updateStatus("admissions",a.id,"rejected")}
                              className="text-xs border border-border text-muted-foreground rounded-lg px-3 py-1.5 hover:text-red-400 hover:border-red-400/30 transition-colors">
                              Reject
                            </button>
                          )}
                          {a.status === "trial_scheduled" && (
                            <button onClick={()=>updateStatus("admissions",a.id,"rejected")}
                              className="text-xs border border-border text-muted-foreground rounded-lg px-3 py-1.5 hover:text-red-400 hover:border-red-400/30 transition-colors">
                              Reject
                            </button>
                          )}
                          {(a.status !== "joined" && a.status !== "trial_scheduled") && (
                            <button
                              onClick={async () => {
                                const warn = isPaid ? `\n\n⚠️ ₹${amountPaid.toLocaleString()} was already collected. This only removes the record.` : "";
                                if (!confirm(`Delete application for ${a.studentName}?${warn}\n\nThis cannot be undone.`)) return;
                                await apiFetch(`/admissions/${a.id}`, { method: "DELETE" });
                                load();
                              }}
                              className="text-xs border border-red-400/20 text-red-400/60 rounded-lg px-3 py-1.5 hover:text-red-400 hover:border-red-400/40 transition-colors">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </motion.div>
        )}

        {/* Bookings */}
        {tab==="Bookings" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
              <div><h2 className="font-display text-3xl font-bold">Bookings</h2><p className="text-muted-foreground">{bookings.length} total · ₹{bookings.filter(b=>b.status==="confirmed").reduce((s,b)=>s+b.total,0).toLocaleString()} revenue</p></div>
              <button onClick={()=>setTab("__block__")} className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-red-500/20 transition-colors">🚫 Block Bookings</button>
            </div>
            {bookings.length===0 ? <p className="text-muted-foreground">No bookings yet.</p> :
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="text-left p-4">Ref</th><th className="text-left p-4">Facility</th>
                      <th className="text-left p-4">Date / Time</th><th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Amount</th><th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Action</th>
                    </tr></thead>
                    <tbody>
                      {bookings.map((b,i)=>(
                        <tr key={b.id} className={`border-b border-border/50 hover:bg-muted/20 ${i===bookings.length-1?"border-0":""}`}>
                          <td className="p-4 font-mono text-xs text-secondary">{b.ref}</td>
                          <td className="p-4 font-semibold">{b.facilityName}</td>
                          <td className="p-4 text-muted-foreground text-xs">{b.date} · {b.slot}</td>
                          <td className="p-4">{b.name}</td>
                          <td className="p-4">
                            {(b.discountPct ?? 0) > 0 ? (
                              <div>
                                <span className="line-through text-muted-foreground text-xs">₹{b.total.toLocaleString()}</span>
                                <p className="font-bold text-green-400">₹{(b.discountedTotal ?? b.total).toLocaleString()}</p>
                                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded px-1.5 py-0.5">{b.discountPct}% off</span>
                              </div>
                            ) : (
                              <span className="font-bold text-secondary">₹{b.total.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="p-4"><StatusBadge s={b.status} /></td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {b.status === "pending_payment" && (
                                <button
                                  onClick={() => { setMarkPaidBooking(b); setMarkPaidBookingNote(""); }}
                                  className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg px-3 py-1.5 hover:bg-green-500/20 transition-colors font-semibold"
                                >✓ Mark Paid</button>
                              )}
                              {(b.status === "confirmed" || b.status === "pending_payment") && (
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Cancel booking ${b.ref} for ${b.name}?`)) return;
                                    await apiFetch(`/bookings/${b.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
                                    load();
                                  }}
                                  className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-3 py-1.5 hover:bg-red-500/20 transition-colors font-semibold"
                                >✕ Cancel</button>
                              )}
                              {b.status === "cancellation_requested" && (
                                <button
                                  onClick={async () => {
                                    const note = prompt(`Process refund for ${b.name}?\nRefund amount: ₹${(b.refundAmount ?? Math.floor(b.total*0.9)).toLocaleString()} (10% deducted)\n\nEnter optional note (e.g. UPI ref, bank transfer ID):`);
                                    if (note === null) return; // cancelled
                                    await apiFetch(`/bookings/${b.id}/process-refund`, { method: "PATCH", body: JSON.stringify({ refundNote: note || undefined }) });
                                    load();
                                  }}
                                  className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-lg px-3 py-1.5 hover:bg-orange-500/20 transition-colors font-semibold"
                                >💸 Refund ₹{(b.refundAmount ?? Math.floor(b.total*0.9)).toLocaleString()}</button>
                              )}
                              <button
                                onClick={() => { setDiscountBooking(b); setDiscountForm({ pct: b.discountPct ?? 0, note: b.discountNote ?? "" }); }}
                                className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-lg px-3 py-1.5 hover:bg-yellow-500/20 transition-colors font-semibold"
                              >🏷 Discount</button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Permanently delete booking ${b.ref}? This cannot be undone.`)) return;
                                  await apiFetch(`/bookings/${b.id}`, { method: "DELETE" });
                                  load();
                                }}
                                className="text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:text-red-400 hover:border-red-500/30 transition-colors"
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </motion.div>
        )}

        {/* Mark Paid Modal — Bookings */}
      {markPaidBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setMarkPaidBooking(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Mark Booking as Paid</h3>
            <p className="text-muted-foreground text-sm mb-1">{markPaidBooking.name} — {markPaidBooking.facilityName}</p>
            <p className="text-secondary font-bold text-lg mb-4">₹{markPaidBooking.total.toLocaleString()}</p>
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Reference / Note (optional)</label>
              <input
                value={markPaidBookingNote}
                onChange={e => setMarkPaidBookingNote(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary"
                placeholder="Cash / UPI ref / Receipt no."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await apiFetch(`/bookings/${markPaidBooking.id}/mark-paid`, {
                    method: "PATCH",
                    body: JSON.stringify({ note: markPaidBookingNote || undefined }),
                  });
                  setMarkPaidBooking(null);
                  load();
                }}
                className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl hover:bg-green-400 transition-colors text-sm"
              >Confirm Payment</button>
              <button onClick={() => setMarkPaidBooking(null)} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted/30 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal — Bookings */}
      {discountBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setDiscountBooking(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Apply Discount</h3>
            <p className="text-muted-foreground text-sm mb-1">{discountBooking.name} — {discountBooking.facilityName}</p>
            <p className="text-secondary font-bold text-lg mb-4">Original: ₹{discountBooking.total.toLocaleString()}</p>
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Discount %</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {[0,5,10,15,20,25,50,100].map(p => (
                  <button key={p} onClick={() => setDiscountForm(f => ({ ...f, pct: p }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${discountForm.pct === p ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-muted-foreground hover:border-secondary/40"}`}>
                    {p === 0 ? "None" : `${p}%`}
                  </button>
                ))}
              </div>
              <input
                type="number" min={0} max={100}
                value={discountForm.pct}
                onChange={e => setDiscountForm(f => ({ ...f, pct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary"
                placeholder="Enter custom %"
              />
            </div>
            {discountForm.pct > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-center">
                <p className="text-xs text-muted-foreground">Final amount after {discountForm.pct}% discount</p>
                <p className="font-bold text-green-400 text-2xl">₹{Math.round(discountBooking.total * (1 - discountForm.pct / 100)).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Saving ₹{Math.round(discountBooking.total * discountForm.pct / 100).toLocaleString()}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Reason / Note (optional)</label>
              <input
                value={discountForm.note}
                onChange={e => setDiscountForm(f => ({ ...f, note: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary"
                placeholder="Student family, early booking, special occasion..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await apiFetch(`/bookings/${discountBooking.id}/discount`, {
                    method: "PATCH",
                    body: JSON.stringify({ discountPct: discountForm.pct, discountNote: discountForm.note || undefined }),
                  });
                  setDiscountBooking(null);
                  load();
                }}
                className="flex-1 bg-secondary text-secondary-foreground font-bold py-2.5 rounded-xl hover:bg-secondary/90 transition-colors text-sm"
              >{discountForm.pct > 0 ? `Apply ${discountForm.pct}% Discount` : "Remove Discount"}</button>
              <button onClick={() => setDiscountBooking(null)} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted/30 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {tab==="Fees"      && <FeesTab apiFetch={apiFetch} />}
      {tab==="__block__" && <BlockBookingsPanel apiFetch={apiFetch} onBack={()=>setTab("Bookings")} />}
      {tab==="Students"  && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Students & QR Codes</h2>
              <p className="text-muted-foreground">Enrolled students, batch assignment and QR attendance tokens</p>
            </div>
            <Link href="/admin/students" className="bg-secondary text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-secondary/90 transition-colors">Open Full View →</Link>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">Student records, QR code downloads and batch assignment are managed in the full Students view.</p>
            <Link href="/admin/students" className="inline-flex items-center gap-2 bg-secondary text-black font-bold px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors">Open Students & QR →</Link>
          </div>
        </motion.div>
      )}
      {tab==="Coaches"   && <CoachesTab apiFetch={apiFetch} />}
      {tab==="Discounts" && <DiscountsTab apiFetch={apiFetch} />}
      {tab==="Broadcast" && <BroadcastTab apiFetch={apiFetch} senderName="Admin" />}
      {tab==="Pricing"   && <PricingTab apiFetch={apiFetch} />}

      </div>

      {/* Trial Scheduling Modal */}
      {trialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setTrialModal(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Schedule Trial Session</h3>
            <p className="text-muted-foreground text-sm mb-4">{trialModal.name} — Parent: {trialModal.parentName}</p>
            <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Trial Date *</p>
            <input type="date" value={trialDate} onChange={e=>setTrialDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground mb-3 focus:outline-none focus:border-secondary" />
            <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Time Slot</p>
            <select value={trialSlot} onChange={e=>setTrialSlot(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground mb-4 focus:outline-none focus:border-secondary">
              {["06:00 AM","07:00 AM","08:00 AM","04:00 PM","05:00 PM","06:00 PM"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-xs text-muted-foreground mb-4">Customer will receive an email + WhatsApp with the trial date and time.</p>
            <div className="flex gap-3">
              <button
                disabled={!trialDate}
                onClick={async () => {
                  await apiFetch(`/admissions/${trialModal.id}/status`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: "trial_scheduled", trialDate, trialSlot }),
                  });
                  setTrialModal(null); load();
                }}
                className="flex-1 bg-yellow-500 text-black font-bold py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm disabled:opacity-40"
              >Confirm & Notify Customer</button>
              <button onClick={() => setTrialModal(null)} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted/30 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {markPaidAdm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setMarkPaidAdm(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Mark as Paid</h3>
            <p className="text-muted-foreground text-sm mb-4">{markPaidAdm.studentName} — {markPaidAdm.parentName}</p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Amount Received (₹) *</label>
                <input
                  type="number"
                  value={markPaidAmount}
                  onChange={e => setMarkPaidAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Reference / Note (optional)</label>
                <input
                  value={markPaidNote}
                  onChange={e => setMarkPaidNote(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary"
                  placeholder="Cash / UPI ref / Receipt no."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!markPaidAmount) return;
                  const adm = markPaidAdm!;
                  await apiFetch(`/admissions/${adm.id}/mark-paid`, {
                    method: "PATCH",
                    body: JSON.stringify({ amount: parseInt(markPaidAmount), note: markPaidNote || undefined }),
                  });
                  // Also advance status to joined and enroll as student
                  await apiFetch(`/admissions/${adm.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "joined" }) });
                  await enrollAsStudent({ ...adm, totalPaid: parseInt(markPaidAmount) });
                  setMarkPaidAdm(null);
                  load();
                }}
                className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl hover:bg-green-400 text-sm transition-colors"
              >Confirm Paid</button>
              <button onClick={() => setMarkPaidAdm(null)} className="border border-border text-muted-foreground px-4 py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Block Bookings Panel ──────────────────────────────────────────────────────
const BLOCK_FACILITIES = [
  { id: "all",     label: "All Facilities" },
  { id: "box",     label: "Box Cricket Arena" },
  { id: "turf",    label: "Turf Wicket" },
  { id: "cement",  label: "Astro Turf / Cemented" },
  { id: "bowling", label: "Cricket Bowling Machine" },
];
const BLOCK_SLOTS = ["06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM"];

function BlockBookingsPanel({ apiFetch, onBack }: { apiFetch: (path: string, opts?: RequestInit) => Promise<Response>; onBack: () => void }) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [facility, setFacility] = useState("all");
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => apiFetch("/blocked-slots").then(r => r.json()).then(d => setBlocks(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);

  // Returns all YYYY-MM-DD strings from dateFrom to dateTo inclusive
  const dateRange = (from: string, to: string): string[] => {
    const dates: string[] = [];
    const cur = new Date(from);
    const end = new Date(to);
    while (cur <= end) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const save = async () => {
    if (!dateFrom || !reason.trim()) { setError("Start date and reason are required."); return; }
    const effectiveTo = dateTo && dateTo >= dateFrom ? dateTo : dateFrom;
    const dates = dateRange(dateFrom, effectiveTo);
    setSaving(true); setError("");
    try {
      for (const d of dates) {
        const res = await apiFetch("/blocked-slots", {
          method: "POST",
          body: JSON.stringify({ date: d, facility, slot: slot || null, reason }),
        });
        if (!res.ok) { const body = await res.json(); throw new Error(body.error || "Failed"); }
      }
      setDateFrom(""); setDateTo(""); setFacility("all"); setSlot(""); setReason("");
      load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this block? Bookings for this slot will become available again.")) return;
    await apiFetch(`/blocked-slots/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 border border-border rounded-lg px-3 py-1.5">← Back to Bookings</button>
        <div>
          <h2 className="font-display text-3xl font-bold">Block Bookings</h2>
          <p className="text-muted-foreground text-sm">Blocked dates/slots cannot be booked by customers</p>
        </div>
      </div>

      {/* Add block form */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Add New Block</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">From Date *</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); if (!dateTo || dateTo < e.target.value) setDateTo(e.target.value); }}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-red-400" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">To Date <span className="normal-case font-normal text-muted-foreground">(leave same for single day)</span></label>
            <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-red-400" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Facility</label>
            <select value={facility} onChange={e => setFacility(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-red-400">
              {BLOCK_FACILITIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Specific Slot <span className="normal-case font-normal text-muted-foreground">(leave blank = entire day)</span></label>
            <select value={slot} onChange={e => setSlot(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-red-400">
              <option value="">— Entire Day —</option>
              {BLOCK_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Reason *</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Academy event, Ground maintenance, Tournament…"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-red-400" />
          </div>
        </div>
        {dateFrom && dateTo && dateTo > dateFrom && (
          <p className="text-yellow-400 text-xs mb-3">
            ⚠️ This will block {Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000) + 1} days ({dateFrom} → {dateTo})
          </p>
        )}
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button onClick={save} disabled={saving} className="bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-red-400 transition-colors disabled:opacity-50">
          {saving ? "Saving…" : "🚫 Block Date(s)"}
        </button>
      </div>

      {/* Existing blocks */}
      <h3 className="font-bold text-base mb-3">Active Blocks ({blocks.length})</h3>
      {blocks.length === 0
        ? <p className="text-muted-foreground text-sm">No blocks set. All slots are open for booking.</p>
        : <div className="space-y-2">
            {blocks.map(b => (
              <div key={b.id} className="bg-card border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-sm">{b.date}</span>
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">{BLOCK_FACILITIES.find(f=>f.id===b.facility)?.label || b.facility}</span>
                    {b.slot && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{b.slot}</span>}
                    {!b.slot && <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">Full Day</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.reason}</p>
                </div>
                <button onClick={() => remove(b.id)} className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2.5 py-1 rounded-lg shrink-0">Remove</button>
              </div>
            ))}
          </div>
      }
    </motion.div>
  );
}

// ── Fees Tab ──────────────────────────────────────────────────────────────────
const FEE_TYPES = ["monthly","admission","quarterly","annual","camp","tournament"] as const;
const FEE_TYPE_LABELS: Record<string,string> = { monthly:"Monthly",admission:"Admission",quarterly:"Quarterly",annual:"Annual",camp:"Camp",tournament:"Tournament" };

function feeStatus(fee: any): { label: string; color: string } {
  if (fee.paid) return { label:"Paid", color:"text-green-400 bg-green-400/10" };
  const today = new Date().toISOString().split("T")[0];
  if (fee.paidAmount > 0) return { label:"Partial", color:"text-blue-400 bg-blue-400/10" };
  if (fee.dueDate && fee.dueDate < today) return { label:"Overdue", color:"text-red-400 bg-red-400/10" };
  return { label:"Due", color:"text-yellow-400 bg-yellow-400/10" };
}

function FeesTab({ apiFetch }: { apiFetch: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const [rows, setRows]       = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [filter, setFilter]   = useState("all"); // all|paid|due|overdue|partial
  const [form, setForm]       = useState({ studentId:"", feeType:"monthly", month:"", amount:"", dueDate:"", notes:"" });
  const [markPaid, setMarkPaid] = useState<any>(null); // fee being marked paid
  const [receiptNo, setReceiptNo] = useState("");

  const load = () => {
    apiFetch("/fees").then(r => r.json()).then(d => setRows(Array.isArray(d) ? d : []));
    apiFetch("/students").then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await apiFetch("/fees", { method:"POST", body: JSON.stringify({
      studentId: parseInt(form.studentId), feeType: form.feeType,
      month: form.month, amount: parseInt(form.amount),
      dueDate: form.dueDate || null, notes: form.notes || null,
    }) });
    setSaving(false); setShowForm(false);
    setForm({ studentId:"", feeType:"monthly", month:"", amount:"", dueDate:"", notes:"" });
    load();
  };

  const doMarkPaid = async () => {
    if (!markPaid) return;
    await apiFetch(`/fees/${markPaid.fee.id}`, { method:"PATCH", body: JSON.stringify({
      paid: true, paidAmount: markPaid.fee.amount,
      paidDate: new Date().toISOString().split("T")[0],
      receiptNo: receiptNo || null,
    }) });
    setMarkPaid(null); setReceiptNo(""); load();
  };

  const remind = async (feeId: number) => {
    await apiFetch(`/fees/${feeId}/remind`, { method:"POST" });
  };

  const bulkRemind = async () => {
    setBulkSending(true);
    const res = await apiFetch("/fees/bulk-remind", { method:"POST" });
    const d = await res.json();
    alert(`Reminders sent to ${d.sent} students`);
    setBulkSending(false);
  };

  const filtered = rows.filter(r => {
    if (filter === "all") return true;
    const s = feeStatus(r.fee).label.toLowerCase();
    return s === filter;
  });

  // KPIs
  const expected  = rows.reduce((s,r) => s + r.fee.amount, 0);
  const collected = rows.reduce((s,r) => s + (r.fee.paid ? r.fee.amount : r.fee.paidAmount), 0);
  const outstanding = expected - collected;
  const pct = expected ? Math.round((collected / expected) * 100) : 0;

  const inp2 = "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-secondary";

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
      {/* KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Expected Collection", value:`₹${expected.toLocaleString("en-IN")}`, color:"text-foreground" },
          { label:"Collected",           value:`₹${collected.toLocaleString("en-IN")}`, color:"text-green-400" },
          { label:"Outstanding",         value:`₹${outstanding.toLocaleString("en-IN")}`, color:"text-red-400" },
          { label:"Collection %",        value:`${pct}%`, color: pct>=80?"text-green-400":pct>=50?"text-yellow-400":"text-red-400" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`text-2xl font-bold font-display ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-bold flex-1">Fee Register</h2>
        <select className="border border-border bg-card rounded-xl px-3 py-2 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="due">Due</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
        <button onClick={bulkRemind} disabled={bulkSending} className="border border-border text-muted-foreground hover:border-secondary hover:text-secondary px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
          {bulkSending ? "Sending..." : "📲 Remind All Unpaid"}
        </button>
        <button onClick={() => setShowForm(v => !v)} className="bg-secondary text-secondary-foreground font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-secondary/90">+ Add Fee</button>
      </div>

      {/* Add fee form */}
      {showForm && (
        <div className="bg-card border border-secondary/30 rounded-2xl p-6">
          <h3 className="font-bold mb-4 text-secondary">New Fee Entry</h3>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Student *</label>
              <select required className={inp2} value={form.studentId} onChange={e => setForm({...form, studentId:e.target.value})}>
                <option value="">Select student</option>
                {students.map(({ student }: any) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
            <div><label className="label">Fee Type *</label>
              <select required className={inp2} value={form.feeType} onChange={e => setForm({...form, feeType:e.target.value})}>
                {FEE_TYPES.map(t => <option key={t} value={t}>{FEE_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div><label className="label">Month / Label *</label>
              <input required className={inp2} value={form.month} onChange={e => setForm({...form, month:e.target.value})} placeholder="2026-07 or July 2026" />
            </div>
            <div><label className="label">Amount (₹) *</label>
              <input required type="number" className={inp2} value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} placeholder="3500" />
            </div>
            <div><label className="label">Due Date</label>
              <input type="date" className={inp2} value={form.dueDate} onChange={e => setForm({...form, dueDate:e.target.value})} />
            </div>
            <div><label className="label">Notes</label>
              <input className={inp2} value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="Optional notes" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-secondary text-secondary-foreground font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50">{saving?"Saving...":"Save Fee"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-border text-muted-foreground px-5 py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Mark as Paid modal */}
      {markPaid && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setMarkPaid(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Mark as Paid</h3>
            <p className="text-muted-foreground text-sm mb-4">{markPaid.student?.name} — ₹{markPaid.fee.amount.toLocaleString("en-IN")}</p>
            <label className="label">Receipt No. (optional)</label>
            <input className={inp2 + " mb-4"} value={receiptNo} onChange={e => setReceiptNo(e.target.value)} placeholder="RCP-001" />
            <div className="flex gap-3">
              <button onClick={doMarkPaid} className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl hover:bg-green-400 text-sm">Confirm Paid</button>
              <button onClick={() => setMarkPaid(null)} className="border border-border text-muted-foreground px-4 py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Fee table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left p-4">Student</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Month</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Due Date</th>
              <th className="text-left p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No fee records. Click "+ Add Fee" to create one.</td></tr>}
              {filtered.map(({ fee, student }: any, i: number) => {
                const st = feeStatus(fee);
                return (
                  <tr key={fee.id} className={`border-b border-border/50 hover:bg-muted/20 ${i===filtered.length-1?"border-0":""}`}>
                    <td className="p-4 font-semibold">{student?.name || "—"}</td>
                    <td className="p-4 text-muted-foreground capitalize">{FEE_TYPE_LABELS[fee.feeType] || fee.feeType}</td>
                    <td className="p-4 text-muted-foreground">{fee.month}</td>
                    <td className="p-4 font-bold text-secondary">₹{fee.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-muted-foreground text-xs">{fee.dueDate || "—"}</td>
                    <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${st.color}`}>{st.label}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!fee.paid && (
                          <>
                            <button onClick={() => { setMarkPaid({ fee, student }); setReceiptNo(""); }} className="text-xs bg-green-400/10 text-green-400 border border-green-400/30 px-2 py-1 rounded-lg hover:bg-green-400/20">✓ Paid</button>
                            <button onClick={() => remind(fee.id)} className="text-xs bg-secondary/10 text-secondary border border-secondary/30 px-2 py-1 rounded-lg hover:bg-secondary/20">📲</button>
                          </>
                        )}
                        {fee.receiptNo && <span className="text-xs text-muted-foreground font-mono">{fee.receiptNo}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ── Coaches Tab ───────────────────────────────────────────────────────────────
function CoachesTab({ apiFetch }: { apiFetch: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "coach" });
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState<Record<number, boolean>>({});
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [resetPwd, setResetPwd] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  const load = () => apiFetch("/users").then(r => r.json()).then(d => setCoaches(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const res = await apiFetch("/users", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      setForm({ name: "", username: "", password: "", role: "coach" });
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this account?")) return;
    setDeleting(id);
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault(); setResetError(""); setResetting(true);
    try {
      const res = await apiFetch(`/users/${resetTarget.id}/reset-password`, { method: "PATCH", body: JSON.stringify({ password: resetPwd }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setResetTarget(null); setResetPwd("");
      load();
    } catch (err: any) { setResetError(err.message); }
    finally { setResetting(false); }
  };

  const roleColor = (role: string) =>
    role === "admin" ? "bg-secondary/10 text-secondary" :
    role === "student" ? "bg-purple-400/10 text-purple-400" :
    role === "receptionist" ? "bg-green-400/10 text-green-400" :
    "bg-blue-400/10 text-blue-400";

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-secondary/30 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-1">Reset Password</h3>
            <p className="text-muted-foreground text-sm mb-4">Set a new password for <strong className="text-foreground">{resetTarget.name}</strong> ({resetTarget.username})</p>
            <form onSubmit={doReset} className="space-y-4">
              <div>
                <label className="label">New Password *</label>
                <input required autoFocus className="inp" value={resetPwd} onChange={e => setResetPwd(e.target.value)} placeholder="Min 6 characters" minLength={6} />
              </div>
              {resetError && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">{resetError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={resetting || resetPwd.length < 6} className="bg-secondary text-secondary-foreground font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50 flex-1">
                  {resetting ? "Saving..." : "Save Password"}
                </button>
                <button type="button" onClick={() => { setResetTarget(null); setResetPwd(""); setResetError(""); }} className="border border-border text-muted-foreground px-4 py-2 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl font-bold">Staff Login Accounts</h2>
          <p className="text-muted-foreground">Coach & reception login credentials — passwords visible to admin only</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="bg-secondary text-secondary-foreground font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-secondary/90">+ Add Account</button>
      </div>

      {showForm && (
        <div className="bg-card border border-secondary/30 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4 text-secondary">New Account</h3>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input required className="inp" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ravi Kumar" /></div>
            <div><label className="label">Username *</label><input required className="inp" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="coach.ravi" /></div>
            <div><label className="label">Password *</label><input required className="inp" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" minLength={6} /></div>
            <div><label className="label">Role</label>
              <select className="inp" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="coach">Coach</option>
                <option value="receptionist">Receptionist</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="sm:col-span-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</p>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-secondary text-secondary-foreground font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50">{saving ? "Creating..." : "Create Account"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-border text-muted-foreground px-5 py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Username</th>
            <th className="text-left p-4">Password</th>
            <th className="text-left p-4">Role</th>
            <th className="text-left p-4">Created</th>
            <th className="p-4"></th>
          </tr></thead>
          <tbody>
            {coaches.map((c, i) => (
              <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/20 ${i === coaches.length-1 ? "border-0" : ""}`}>
                <td className="p-4 font-semibold">{c.name}</td>
                <td className="p-4 font-mono text-xs text-muted-foreground">{c.username}</td>
                <td className="p-4">
                  {c.username === "admin" ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : c.plainPassword ? (
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs ${showPwd[c.id] ? "text-foreground" : "text-muted-foreground tracking-widest"}`}>
                        {showPwd[c.id] ? c.plainPassword : "••••••"}
                      </span>
                      <button onClick={() => setShowPwd(p => ({...p, [c.id]: !p[c.id]}))} className="text-xs text-secondary hover:text-secondary/80">
                        {showPwd[c.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Set via reset</span>
                  )}
                </td>
                <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${roleColor(c.role)}`}>{c.role}</span></td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {c.username !== "admin" && (
                      <>
                        <button onClick={() => { setResetTarget(c); setResetPwd(""); setResetError(""); }} className="text-xs text-secondary hover:text-secondary/80 font-semibold">
                          Reset Password
                        </button>
                        <button onClick={() => remove(c.id)} disabled={deleting === c.id} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                          {deleting === c.id ? "..." : "Remove"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {coaches.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No accounts yet. Add one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Discounts Tab ─────────────────────────────────────────────────────────────
interface DiscountType { id:number; name:string; percentage:number; description:string; requiredDocument:string; isActive:boolean; }
interface DiscountApp  { id:number; studentId:number; discountTypeId:number; documentUrl?:string; documentName?:string; status:string; reviewedBy?:string; reviewNotes?:string; createdAt:string; }
interface FeePackage   { id:number; months:number; label:string; discountPct:number; isActive:boolean; sortOrder:number; }

function DiscountsTab({ apiFetch }: { apiFetch: (p:string, o?:RequestInit)=>Promise<Response> }) {
  const [types, setTypes]   = useState<DiscountType[]>([]);
  const [apps,  setApps]    = useState<DiscountApp[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<DiscountType|null>(null);
  const [form, setForm] = useState({ name:"", percentage:10, description:"", requiredDocument:"", isActive:true });
  // Fee packages state
  const [pkgs, setPkgs] = useState<FeePackage[]>([]);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<FeePackage|null>(null);
  const [pkgForm, setPkgForm] = useState({ months:3, label:"3-Month Pack", discountPct:10, isActive:true });
  const [pkgSaving, setPkgSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState<number|null>(null);

  const load = useCallback(async () => {
    const [tRes, aRes, pRes] = await Promise.all([apiFetch("/discount-types"), apiFetch("/discount-applications"), apiFetch("/fee-packages")]);
    if (tRes.ok) { const d = await tRes.json(); setTypes(Array.isArray(d) ? d : (d.discounts ?? [])); }
    if (aRes.ok) setApps(await aRes.json());
    if (pRes.ok) setPkgs(await pRes.json());
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const saveType = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/discount-types/${editing.id}`, { method:"PATCH", body:JSON.stringify(form) });
      } else {
        await apiFetch("/discount-types", { method:"POST", body:JSON.stringify(form) });
      }
      setShowForm(false); setEditing(null); setForm({ name:"", percentage:10, description:"", requiredDocument:"", isActive:true });
      load();
    } finally { setSaving(false); }
  };

  const deleteType = async (id: number) => {
    if (!confirm("Delete this discount type?")) return;
    await apiFetch(`/discount-types/${id}`, { method:"DELETE" }); load();
  };

  const toggleActive = async (t: DiscountType) => {
    await apiFetch(`/discount-types/${t.id}`, { method:"PATCH", body:JSON.stringify({ isActive: !t.isActive }) }); load();
  };

  const savePkg = async (e: React.FormEvent) => {
    e.preventDefault(); setPkgSaving(true);
    try {
      if (editingPkg) {
        await apiFetch(`/fee-packages/${editingPkg.id}`, { method:"PATCH", body:JSON.stringify(pkgForm) });
      } else {
        await apiFetch("/fee-packages", { method:"POST", body:JSON.stringify(pkgForm) });
      }
      setShowPkgForm(false); setEditingPkg(null); setPkgForm({ months:3, label:"3-Month Pack", discountPct:10, isActive:true });
      load();
    } finally { setPkgSaving(false); }
  };

  const deletePkg = async (id: number) => {
    if (!confirm("Delete this package?")) return;
    await apiFetch(`/fee-packages/${id}`, { method:"DELETE" }); load();
  };

  const togglePkg = async (p: FeePackage) => {
    await apiFetch(`/fee-packages/${p.id}`, { method:"PATCH", body:JSON.stringify({ isActive: !p.isActive }) }); load();
  };

  const review = async (id: number, status: "approved"|"rejected", notes="") => {
    setReviewing(id);
    await apiFetch(`/discount-applications/${id}`, { method:"PATCH", body:JSON.stringify({ status, reviewNotes: notes }) });
    setReviewing(null); load();
  };

  const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary";

  const pendingApps = apps.filter(a => a.status === "pending");

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
      {/* Pending Applications */}
      {pendingApps.length > 0 && (
        <div>
          <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-secondary"/> Pending Discount Applications
            <span className="ml-1 bg-red-400/10 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{pendingApps.length}</span>
          </h3>
          <div className="space-y-3">
            {pendingApps.map(app => {
              const dtype = types.find(t => t.id === app.discountTypeId);
              return (
                <div key={app.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm">Student ID #{app.studentId}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Discount: <span className="text-foreground font-medium">{dtype?.name ?? `#${app.discountTypeId}`}</span>
                      {dtype && <span className="ml-2 text-secondary font-bold">{dtype.percentage}% off tuition</span>}
                    </p>
                    {app.documentName && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <FileText className="h-3 w-3"/> {app.documentName}
                        {app.documentUrl && <a href={app.documentUrl} target="_blank" rel="noreferrer" className="text-secondary underline ml-1">View</a>}
                      </p>
                    )}
                    {dtype && <p className="text-xs text-muted-foreground mt-1">Required doc: {dtype.requiredDocument}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={()=>review(app.id,"approved")} disabled={reviewing===app.id}
                      className="flex items-center gap-1.5 bg-green-400/10 text-green-400 text-xs font-bold px-3 py-2 rounded-lg hover:bg-green-400/20 disabled:opacity-50">
                      <CheckCircle className="h-3.5 w-3.5"/> Approve
                    </button>
                    <button onClick={()=>{ const n=prompt("Rejection reason (optional):") ?? ""; review(app.id,"rejected",n); }} disabled={reviewing===app.id}
                      className="flex items-center gap-1.5 bg-red-400/10 text-red-400 text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-400/20 disabled:opacity-50">
                      <XCircle className="h-3.5 w-3.5"/> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Discount Types Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold flex items-center gap-2"><Tag className="h-5 w-5 text-secondary"/> Discount Types</h3>
          <button onClick={()=>{ setShowForm(true); setEditing(null); setForm({ name:"", percentage:10, description:"", requiredDocument:"", isActive:true }); }}
            className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:bg-secondary/90">
            <Plus className="h-3.5 w-3.5"/> Add Discount
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="bg-card border border-secondary/30 rounded-xl p-6 mb-6">
            <h4 className="font-bold mb-4">{editing ? "Edit Discount Type" : "New Discount Type"}</h4>
            <form onSubmit={saveType} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inputCls} placeholder="e.g. Sibling Discount" required/>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Discount % (tuition only)</label>
                <input type="number" min={1} max={100} value={form.percentage} onChange={e=>setForm(f=>({...f,percentage:parseInt(e.target.value)}))} className={inputCls} required/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Eligibility Criteria</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className={inputCls+" resize-none"} rows={2} placeholder="Who qualifies? e.g. Second sibling enrolled at PIRcricketHub" required/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Required Document</label>
                <input value={form.requiredDocument} onChange={e=>setForm(f=>({...f,requiredDocument:e.target.value}))} className={inputCls} placeholder="e.g. Sibling's enrollment letter or fee receipt" required/>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="bg-secondary text-secondary-foreground text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-secondary/90 disabled:opacity-60">{saving?"Saving…":"Save"}</button>
                <button type="button" onClick={()=>{setShowForm(false);setEditing(null);}} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2.5">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Types list */}
        <div className="space-y-3">
          {types.map(t => (
            <div key={t.id} className={`bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4 ${t.isActive?"border-border":"border-border/40 opacity-60"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold">{t.name}</p>
                  <span className="bg-secondary/10 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{t.percentage}% off tuition</span>
                  {!t.isActive && <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                <p className="text-muted-foreground text-xs mt-1">{t.description}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">Required doc:</span> {t.requiredDocument}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>toggleActive(t)} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${t.isActive?"border-green-400/30 text-green-400 hover:bg-green-400/10":"border-muted text-muted-foreground hover:bg-muted"}`}>{t.isActive?"Active":"Inactive"}</button>
                <button onClick={()=>{ setEditing(t); setForm({ name:t.name, percentage:t.percentage, description:t.description, requiredDocument:t.requiredDocument, isActive:t.isActive }); setShowForm(true); }}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-secondary/40">
                  <Pencil className="h-3 w-3"/>
                </button>
                <button onClick={()=>deleteType(t.id)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-border text-red-400/70 hover:text-red-400 hover:border-red-400/30">
                  <Trash2 className="h-3 w-3"/>
                </button>
              </div>
            </div>
          ))}
          {types.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-10 w-10 mx-auto mb-3 opacity-30"/>
              <p>No discount types yet. Add your first one above.</p>
            </div>
          )}
        </div>

        {/* ── Fee Packages ── */}
        <div className="mt-10 pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Tag className="h-5 w-5 text-secondary"/> Fee Packages
            </h3>
            <button onClick={()=>{ setShowPkgForm(true); setEditingPkg(null); setPkgForm({ months:3, label:"3-Month Pack", discountPct:10, isActive:true }); }}
              className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:bg-secondary/90">
              <Plus className="h-3.5 w-3.5"/> Add Package
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">These are the duration packages shown in the admission form. Changing percentages here immediately affects new admissions.</p>

          {showPkgForm && (
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="bg-card border border-secondary/30 rounded-xl p-6 mb-6">
              <h4 className="font-bold mb-4">{editingPkg ? "Edit Package" : "New Package"}</h4>
              <form onSubmit={savePkg} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Label</label>
                  <input value={pkgForm.label} onChange={e=>setPkgForm(f=>({...f,label:e.target.value}))} className={inputCls} placeholder="e.g. 6-Month Pack" required/>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Months</label>
                  <input type="number" min={1} max={24} value={pkgForm.months} onChange={e=>setPkgForm(f=>({...f,months:parseInt(e.target.value)}))} className={inputCls} required/>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Discount % (on monthly fee)</label>
                  <input type="number" min={0} max={100} value={pkgForm.discountPct} onChange={e=>setPkgForm(f=>({...f,discountPct:parseInt(e.target.value)}))} className={inputCls} required/>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={pkgForm.isActive} onChange={e=>setPkgForm(f=>({...f,isActive:e.target.checked}))} className="rounded"/>
                    <span className="text-sm font-medium">Active (visible in admission form)</span>
                  </label>
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={pkgSaving} className="bg-secondary text-secondary-foreground text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-secondary/90 disabled:opacity-60">{pkgSaving?"Saving…":"Save"}</button>
                  <button type="button" onClick={()=>{setShowPkgForm(false);setEditingPkg(null);}} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2.5">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="space-y-3">
            {pkgs.map(p => (
              <div key={p.id} className={`bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${p.isActive?"border-border":"border-border/40 opacity-60"}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold">{p.label}</p>
                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{p.discountPct}% off monthly</span>
                    <span className="text-xs text-muted-foreground">{p.months} month{p.months>1?"s":""}</span>
                    {!p.isActive && <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={()=>togglePkg(p)} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${p.isActive?"border-green-400/30 text-green-400 hover:bg-green-400/10":"border-muted text-muted-foreground hover:bg-muted"}`}>{p.isActive?"Active":"Inactive"}</button>
                  <button onClick={()=>{ setEditingPkg(p); setPkgForm({ months:p.months, label:p.label, discountPct:p.discountPct, isActive:p.isActive }); setShowPkgForm(true); }}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-secondary/40">
                    <Pencil className="h-3 w-3"/>
                  </button>
                  <button onClick={()=>deletePkg(p.id)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-border text-red-400/70 hover:text-red-400 hover:border-red-400/30">
                    <Trash2 className="h-3 w-3"/>
                  </button>
                </div>
              </div>
            ))}
            {pkgs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                <p className="text-sm">No packages yet. Add your first one above.</p>
                <p className="text-xs mt-1">Until packages are added, the admission form falls back to the built-in 3/6/12-month defaults.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviewed applications */}
        {apps.filter(a=>a.status!=="pending").length > 0 && (
          <div className="mt-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Reviewed Applications</h4>
            <div className="space-y-2">
              {apps.filter(a=>a.status!=="pending").map(app=>(
                <div key={app.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${app.status==="approved"?"bg-green-400/10 text-green-400":"bg-red-400/10 text-red-400"}`}>{app.status}</span>
                  <span className="text-muted-foreground">Student #{app.studentId}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{types.find(t=>t.id===app.discountTypeId)?.name ?? `Discount #${app.discountTypeId}`}</span>
                  {app.reviewNotes && <span className="text-muted-foreground text-xs ml-auto">{app.reviewNotes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Broadcast Tab (shared between admin and reception portals) ─────────────────
interface BroadcastMsg { id: number; title: string; message: string; audience: string; createdBy: string; createdAt: string; }

// ── Pricing Settings Tab ──────────────────────────────────────────────────────
function PricingTab({ apiFetch }: { apiFetch: (p:string, o?:RequestInit)=>Promise<Response> }) {
  type FacilityRow = { id: number; facilityId: string; name: string; emoji: string; unit: string; weekdayRate: number; weekendRate: number; nightRate: number | null; isActive: boolean };
  type FeeRow = { id: number; key: string; label: string; value: number };

  const [facilities, setFacilities] = useState<FacilityRow[]>([]);
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [editingFacility, setEditingFacility] = useState<FacilityRow | null>(null);
  const [facilityForm, setFacilityForm] = useState({ weekdayRate: 0, weekendRate: 0, nightRate: "" as string | number });
  const [editingFee, setEditingFee] = useState<FeeRow | null>(null);
  const [feeValue, setFeeValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [fRes, cRes] = await Promise.all([apiFetch("/facility-rates"), apiFetch("/fee-config")]);
    if (fRes.ok) setFacilities(await fRes.json());
    if (cRes.ok) setFees(await cRes.json());
  };
  useEffect(() => { load(); }, []);

  const saveFacility = async () => {
    if (!editingFacility) return;
    setSaving(true);
    await apiFetch(`/facility-rates/${editingFacility.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        weekdayRate: Number(facilityForm.weekdayRate),
        weekendRate: Number(facilityForm.weekendRate),
        nightRate: facilityForm.nightRate === "" || facilityForm.nightRate === null ? null : Number(facilityForm.nightRate),
      }),
    });
    setSaving(false); setEditingFacility(null); setMsg("Rates updated!"); load();
    setTimeout(() => setMsg(""), 3000);
  };

  const saveFee = async () => {
    if (!editingFee) return;
    setSaving(true);
    await apiFetch(`/fee-config/${editingFee.key}`, { method: "PATCH", body: JSON.stringify({ value: Number(feeValue) }) });
    setSaving(false); setEditingFee(null); setMsg("Fee updated!"); load();
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">Pricing Settings</h2>
          <p className="text-muted-foreground">Change rates here — booking page and fee calculations update automatically.</p>
        </div>
        {msg && <span className="text-green-400 text-sm font-bold">{msg}</span>}
      </div>

      {/* Facility Rates */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-lg">Facility Booking Rates</h3>
          <p className="text-muted-foreground text-sm">These rates appear live on the public booking page.</p>
        </div>
        <div className="divide-y divide-border">
          {facilities.map(f => (
            <div key={f.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{f.emoji}</span>
                <div>
                  <p className="font-bold">{f.name}</p>
                  <p className="text-xs text-muted-foreground">per {f.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Weekday</p>
                  <p className="font-bold text-secondary text-lg">₹{f.weekdayRate.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Weekend</p>
                  <p className="font-bold text-secondary text-lg">₹{f.weekendRate.toLocaleString()}</p>
                </div>
                {f.nightRate != null && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Night</p>
                    <p className="font-bold text-secondary text-lg">₹{f.nightRate.toLocaleString()}</p>
                  </div>
                )}
                <button
                  onClick={() => { setEditingFacility(f); setFacilityForm({ weekdayRate: f.weekdayRate, weekendRate: f.weekendRate, nightRate: f.nightRate ?? "" }); }}
                  className="text-xs bg-secondary/10 text-secondary border border-secondary/30 rounded-lg px-3 py-1.5 hover:bg-secondary/20 transition-colors font-semibold"
                >✏️ Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academy Fees */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-lg">Academy Admission Fees</h3>
          <p className="text-muted-foreground text-sm">Used in all admission fee calculations automatically.</p>
        </div>
        <div className="divide-y divide-border">
          {fees.map(f => (
            <div key={f.key} className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold">{f.label}</p>
                <p className="text-xs text-muted-foreground font-mono">{f.key}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-secondary text-xl">₹{f.value.toLocaleString()}</p>
                <button
                  onClick={() => { setEditingFee(f); setFeeValue(f.value); }}
                  className="text-xs bg-secondary/10 text-secondary border border-secondary/30 rounded-lg px-3 py-1.5 hover:bg-secondary/20 transition-colors font-semibold"
                >✏️ Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Facility Modal */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setEditingFacility(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{editingFacility.emoji} {editingFacility.name}</h3>
            <p className="text-xs text-muted-foreground">Rate per {editingFacility.unit}</p>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Weekday Rate (₹)</label>
              <input type="number" min={0} value={facilityForm.weekdayRate} onChange={e => setFacilityForm(f => ({ ...f, weekdayRate: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Weekend Rate (₹)</label>
              <input type="number" min={0} value={facilityForm.weekendRate} onChange={e => setFacilityForm(f => ({ ...f, weekendRate: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Night Rate (₹) — leave blank if no night booking</label>
              <input type="number" min={0} value={facilityForm.nightRate} onChange={e => setFacilityForm(f => ({ ...f, nightRate: e.target.value }))}
                placeholder="Leave blank to disable night rate"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveFacility} disabled={saving} className="flex-1 bg-secondary text-secondary-foreground font-bold py-2.5 rounded-xl hover:bg-secondary/90 transition-colors text-sm disabled:opacity-60">
                {saving ? "Saving..." : "Save Rates"}
              </button>
              <button onClick={() => setEditingFacility(null)} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted/30 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {editingFee && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setEditingFee(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Edit {editingFee.label}</h3>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Amount (₹)</label>
              <input type="number" min={0} value={feeValue} onChange={e => setFeeValue(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-secondary" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveFee} disabled={saving} className="flex-1 bg-secondary text-secondary-foreground font-bold py-2.5 rounded-xl hover:bg-secondary/90 transition-colors text-sm disabled:opacity-60">
                {saving ? "Saving..." : "Save Fee"}
              </button>
              <button onClick={() => setEditingFee(null)} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-muted/30 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function BroadcastTab({ apiFetch, senderName }: { apiFetch: (p: string, o?: RequestInit) => Promise<Response>; senderName: string }) {
  const [msgs, setMsgs]       = useState<BroadcastMsg[]>([]);
  const [title, setTitle]     = useState("");
  const [body, setBody]       = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiFetch("/notifications");
    if (r.ok) setMsgs(await r.json());
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    const r = await apiFetch("/notifications", {
      method: "POST",
      body: JSON.stringify({ title: title.trim(), message: body.trim(), audience, createdBy: senderName }),
    });
    if (r.ok) {
      setTitle(""); setBody(""); setAudience("all");
      setSent(true); setTimeout(() => setSent(false), 3000);
      load();
    }
    setSending(false);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this broadcast?")) return;
    await apiFetch(`/notifications/${id}`, { method: "DELETE" });
    load();
  };

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary";

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2 mb-1">
          <Megaphone className="h-6 w-6 text-secondary"/> Broadcast Message
        </h2>
        <p className="text-muted-foreground text-sm">Send announcements to all students — practice schedule changes, events, holidays, and more. Messages appear in the parent/student portal.</p>
      </div>

      {/* Compose */}
      <div className="bg-card border border-secondary/30 rounded-2xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Send className="h-4 w-4 text-secondary"/> New Message</h3>
        <form onSubmit={send} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Title / Subject *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inp} placeholder="e.g. Practice Cancelled — 28 Aug" required maxLength={120}/>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Message *</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} className={inp + " resize-none"} rows={4}
              placeholder="Write your message here. Be clear and include any action required from parents/students." required maxLength={1000}/>
            <p className="text-xs text-muted-foreground mt-1 text-right">{body.length}/1000</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Audience</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} className={inp}>
              <option value="all">All Students & Parents</option>
              <option value="u8">U8 (Under 8)</option>
              <option value="u12">U12 (Under 12)</option>
              <option value="u16">U16 (Under 16)</option>
              <option value="u19">U19 (Under 19)</option>
              <option value="elite">Elite</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={sending || !title.trim() || !body.trim()}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground font-bold px-6 py-2.5 rounded-xl hover:bg-secondary/90 disabled:opacity-50 transition-colors">
              <Send className="h-4 w-4"/> {sending ? "Sending…" : "Send Broadcast"}
            </button>
            {sent && <span className="text-green-400 text-sm font-semibold">✓ Sent successfully</span>}
          </div>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="font-bold text-lg mb-4">Broadcast History</h3>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading…</div>
        ) : msgs.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground">
            <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30"/>
            <p>No broadcasts sent yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {msgs.map(m => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold">{m.title}</p>
                      {m.audience !== "all" && (
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">{m.audience}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sent by <span className="text-foreground font-medium">{m.createdBy}</span> · {new Date(m.createdAt).toLocaleString("en-IN", { dateStyle:"medium", timeStyle:"short" })}
                    </p>
                  </div>
                  <button onClick={() => del(m.id)}
                    className="shrink-0 text-red-400/60 hover:text-red-400 border border-transparent hover:border-red-400/30 rounded-lg p-1.5 transition-colors">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
