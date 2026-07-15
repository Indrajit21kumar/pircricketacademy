import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import { Users, TrendingUp, DollarSign, Activity, BarChart3, Calendar, X, RefreshCw, ExternalLink, Tag, Plus, Pencil, Trash2, CheckCircle, XCircle, FileText } from "lucide-react";
import { GroundTrackerContent } from "./admin/GroundTracker";

// ── Types ────────────────────────────────────────────────────────────────────
interface Admission { id:number; studentName:string; ageGroup:string; parentName:string; phone:string; createdAt:string; status:string; isTrial:boolean; paymentStatus:string; registrationFee:number; totalPaid:number; packageMonths?:number|null; packageDiscountPct?:number|null; eligibilityDiscountPct?:number|null; combinedDiscountPct?:number|null; razorpayPaymentId?:string; paidAt?:string; }
interface Booking   { id:number; ref:string; facilityName:string; date:string; slot:string; name:string; total:number; status:string; createdAt:string; }
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

const TABS = ["Dashboard","Ground Tracker","Inquiries","Admissions","Bookings","Fees","Coaches","Discounts"];

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, bRes, iRes] = await Promise.all([
        apiFetch("/admissions"), apiFetch("/bookings"), apiFetch("/inquiries"),
      ]);
      if (aRes.ok) setAdmissions(await aRes.json());
      if (bRes.ok) setBookings(await bRes.json());
      if (iRes.ok) setInquiries(await iRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const updateStatus = async (type: string, id: number, status: string) => {
    await apiFetch(`/${type}/${id}/status`, { method:"PATCH", body: JSON.stringify({ status }) });
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
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Recent Applications</h3>
                {admissions.length === 0 ? <p className="text-muted-foreground text-sm">No applications yet.</p> :
                  <div className="space-y-3">
                    {admissions.slice(0,5).map(a=>(
                      <div key={a.id} className="flex items-center justify-between">
                        <div><p className="font-semibold text-sm">{a.studentName}</p><p className="text-xs text-muted-foreground">{a.ageGroup} · {a.parentName}</p></div>
                        <StatusBadge s={a.status} />
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
            <div className="mb-4"><h2 className="font-display text-3xl font-bold">Admissions</h2><p className="text-muted-foreground">{admissions.length} total · {admissions.filter(a=>a.status==="new").length} new</p></div>
            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-card border border-border rounded-xl p-4"><p className="text-xl font-bold font-display">{admissions.length}</p><p className="text-xs text-muted-foreground">Total Applications</p></div>
              <div className="bg-card border border-green-400/30 rounded-xl p-4"><p className="text-xl font-bold font-display text-green-400">{paidAdmissions.length}</p><p className="text-xs text-muted-foreground">Payment Paid</p></div>
              <div className="bg-card border border-yellow-400/30 rounded-xl p-4"><p className="text-xl font-bold font-display text-yellow-400">{admissions.filter(a=>a.paymentStatus==="pending").length}</p><p className="text-xs text-muted-foreground">Pending Payment</p></div>
              <div className="bg-card border border-secondary/30 rounded-xl p-4"><p className="text-xl font-bold font-display text-secondary">₹{admissionRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Revenue Collected</p></div>
            </div>
            {admissions.length===0 ? <p className="text-muted-foreground">No applications yet.</p> :
              <div className="space-y-3">
                {admissions.map(a=>(
                  <div key={a.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex flex-wrap items-start gap-4 justify-between">
                      <div>
                        <p className="font-bold">{a.studentName} <span className="text-xs text-muted-foreground font-normal">({a.ageGroup}{a.isTrial?" · Trial":""}) </span></p>
                        <p className="text-sm text-muted-foreground">Parent: {a.parentName} · {a.phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Applied: {new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Package: {a.packageMonths ? `${a.packageMonths}-Month Pack` : "Registration Only"}</p>
                        {(a.combinedDiscountPct ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">Combined discount: {a.combinedDiscountPct}%{a.packageDiscountPct ? ` (${a.packageDiscountPct}% pkg` : ""}{ (a.packageDiscountPct ?? 0) > 0 && (a.eligibilityDiscountPct ?? 0) > 0 ? ` + ${a.eligibilityDiscountPct}% eligibility)` : (a.packageDiscountPct ? ")" : "")}</p>
                        )}
                        {a.razorpayPaymentId && (
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">Payment: {a.razorpayPaymentId.slice(0,20)}…</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Payment status badge */}
                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                          a.paymentStatus==="paid" ? "bg-green-400/10 text-green-400" :
                          a.paymentStatus==="pending" ? "bg-yellow-400/10 text-yellow-400" :
                          a.paymentStatus==="failed" ? "bg-red-400/10 text-red-400" :
                          "bg-blue-400/10 text-blue-400"
                        }`}>
                          {a.paymentStatus==="paid" ? `₹${(a.totalPaid||a.registrationFee||5000).toLocaleString()} paid` : a.paymentStatus}
                        </span>
                        <StatusBadge s={a.status} />
                        {["new","trial_scheduled","joined","rejected"].map(s=>(
                          s !== a.status && <button key={s} onClick={()=>updateStatus("admissions",a.id,s)} className="text-xs border border-border rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors">→ {s.replace("_"," ")}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </motion.div>
        )}

        {/* Bookings */}
        {tab==="Bookings" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="mb-6"><h2 className="font-display text-3xl font-bold">Bookings</h2><p className="text-muted-foreground">{bookings.length} total · ₹{bookings.filter(b=>b.status==="confirmed").reduce((s,b)=>s+b.total,0).toLocaleString()} revenue</p></div>
            {bookings.length===0 ? <p className="text-muted-foreground">No bookings yet.</p> :
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="text-left p-4">Ref</th><th className="text-left p-4">Facility</th>
                      <th className="text-left p-4">Date / Time</th><th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Amount</th><th className="text-left p-4">Status</th>
                    </tr></thead>
                    <tbody>
                      {bookings.map((b,i)=>(
                        <tr key={b.id} className={`border-b border-border/50 hover:bg-muted/20 ${i===bookings.length-1?"border-0":""}`}>
                          <td className="p-4 font-mono text-xs text-secondary">{b.ref}</td>
                          <td className="p-4 font-semibold">{b.facilityName}</td>
                          <td className="p-4 text-muted-foreground text-xs">{b.date} · {b.slot}</td>
                          <td className="p-4">{b.name}</td>
                          <td className="p-4 font-bold text-secondary">₹{b.total.toLocaleString()}</td>
                          <td className="p-4"><StatusBadge s={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </motion.div>
        )}

        {tab==="Fees"      && <FeesTab apiFetch={apiFetch} />}
        {tab==="Coaches"   && <CoachesTab apiFetch={apiFetch} />}
        {tab==="Discounts" && <DiscountsTab apiFetch={apiFetch} />}

      </div>
    </div>
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
    if (!confirm("Remove this coach account?")) return;
    setDeleting(id);
    await apiFetch(`/users?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-display text-3xl font-bold">Coach Accounts</h2><p className="text-muted-foreground">Manage coach and admin login credentials</p></div>
        <button onClick={() => setShowForm(v => !v)} className="bg-secondary text-secondary-foreground font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-secondary/90">+ Add Coach</button>
      </div>

      {showForm && (
        <div className="bg-card border border-secondary/30 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4 text-secondary">New Coach Account</h3>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input required className="inp" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ravi Kumar" /></div>
            <div><label className="label">Username *</label><input required className="inp" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="coach.ravi" /></div>
            <div><label className="label">Password *</label><input required type="password" className="inp" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" /></div>
            <div><label className="label">Role</label>
              <select className="inp" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="coach">Coach</option>
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

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Username</th>
            <th className="text-left p-4">Role</th>
            <th className="text-left p-4">Created</th>
            <th className="p-4"></th>
          </tr></thead>
          <tbody>
            {coaches.map((c, i) => (
              <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/20 ${i === coaches.length-1 ? "border-0" : ""}`}>
                <td className="p-4 font-semibold">{c.name}</td>
                <td className="p-4 font-mono text-xs text-muted-foreground">{c.username}</td>
                <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${c.role==="admin"?"bg-secondary/10 text-secondary":"bg-blue-400/10 text-blue-400"}`}>{c.role}</span></td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right">
                  {c.username !== "admin" && (
                    <button onClick={() => remove(c.id)} disabled={deleting === c.id} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                      {deleting === c.id ? "..." : "Remove"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {coaches.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No accounts yet. Add a coach above.</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Discounts Tab ─────────────────────────────────────────────────────────────
interface DiscountType { id:number; name:string; percentage:number; description:string; requiredDocument:string; isActive:boolean; }
interface DiscountApp  { id:number; studentId:number; discountTypeId:number; documentUrl?:string; documentName?:string; status:string; reviewedBy?:string; reviewNotes?:string; createdAt:string; }

function DiscountsTab({ apiFetch }: { apiFetch: (p:string, o?:RequestInit)=>Promise<Response> }) {
  const [types, setTypes]   = useState<DiscountType[]>([]);
  const [apps,  setApps]    = useState<DiscountApp[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<DiscountType|null>(null);
  const [form, setForm] = useState({ name:"", percentage:10, description:"", requiredDocument:"", isActive:true });
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState<number|null>(null);

  const load = useCallback(async () => {
    const [tRes, aRes] = await Promise.all([apiFetch("/discount-types"), apiFetch("/discount-applications")]);
    if (tRes.ok) setTypes(await tRes.json());
    if (aRes.ok) setApps(await aRes.json());
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
