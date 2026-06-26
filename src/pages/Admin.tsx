import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Users, TrendingUp, DollarSign, AlertCircle, Activity, BarChart3, Calendar, CheckCircle, Clock, X, RefreshCw, ExternalLink } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Admission { id:number; studentName:string; ageGroup:string; parentName:string; phone:string; createdAt:string; status:string; isTrial:boolean; }
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

const TABS = ["Dashboard","Inquiries","Admissions","Bookings"];

const MODULES = [
  { label: "Students & QR",  href: "/admin/students",  color: "text-blue-400",   bg: "bg-blue-400/10" },
  { label: "Attendance",     href: "/admin/attendance", color: "text-green-400",  bg: "bg-green-400/10" },
  { label: "Lead CRM",       href: "/admin/crm",        color: "text-orange-400", bg: "bg-orange-400/10" },
  { label: "Communications", href: "/admin/comms",      color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Calendar",       href: "/admin/calendar",   color: "text-secondary",  bg: "bg-secondary/10" },
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
function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setToken(data.token);
      onAuth();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="bg-card border border-border rounded-2xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/10 border-2 border-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-secondary text-2xl font-black">PIR</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">PIR Cricket Academy — Founder Login</p>
        </div>
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="admin"/>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="••••••••" autoFocus/>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-3.5 rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-60">{loading?"Signing in…":"Sign In"}</button>
        </form>
        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="text-muted-foreground text-xs mb-2">First time? Set up your admin account:</p>
          <SetupAdmin />
        </div>
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
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState("Dashboard");
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [inquiries,  setInquiries]  = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);

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

  if (!authed) return <LoginScreen onAuth={() => setAuthed(true)} />;

  // KPIs computed from real data
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const groundRevenue = confirmedBookings.reduce((s, b) => s + b.total, 0);
  const joinedStudents = admissions.filter(a => a.status === "joined");
  const KPI = [
    { label:"Total Applications", value: String(admissions.length),        icon:Users,    color:"text-blue-400",   bg:"bg-blue-400/10" },
    { label:"Joined Students",    value: String(joinedStudents.length),     icon:Activity, color:"text-green-400",  bg:"bg-green-400/10" },
    { label:"Ground Bookings",    value: String(confirmedBookings.length),  icon:Calendar, color:"text-purple-400", bg:"bg-purple-400/10" },
    { label:"Ground Revenue",     value: `₹${groundRevenue.toLocaleString()}`, icon:DollarSign, color:"text-secondary", bg:"bg-secondary/10" },
    { label:"Total Inquiries",    value: String(inquiries.length),          icon:BarChart3, color:"text-teal-400",  bg:"bg-teal-400/10" },
    { label:"New Leads",          value: String(inquiries.filter(i=>i.status==="new").length), icon:TrendingUp, color:"text-orange-400", bg:"bg-orange-400/10" },
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
              <p className="text-muted-foreground">Live data — PIR Cricket Academy, Patna</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {KPI.map(k=>(
                <div key={k.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}><k.icon className={`h-5 w-5 ${k.color}`}/></div>
                  <p className="text-2xl font-bold font-display">{k.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
                </div>
              ))}
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
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Recent Bookings</h3>
                {bookings.length === 0 ? <p className="text-muted-foreground text-sm">No bookings yet.</p> :
                  <div className="space-y-3">
                    {bookings.slice(0,5).map(b=>(
                      <div key={b.id} className="flex items-center justify-between">
                        <div><p className="font-semibold text-sm">{b.facilityName}</p><p className="text-xs text-muted-foreground">{b.date} · {b.slot} · {b.name}</p></div>
                        <span className="text-secondary font-bold text-sm">₹{b.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>
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
            <div className="mb-6"><h2 className="font-display text-3xl font-bold">Admissions</h2><p className="text-muted-foreground">{admissions.length} total · {admissions.filter(a=>a.status==="new").length} new</p></div>
            {admissions.length===0 ? <p className="text-muted-foreground">No applications yet.</p> :
              <div className="space-y-3">
                {admissions.map(a=>(
                  <div key={a.id} className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
                    <div>
                      <p className="font-bold">{a.studentName} <span className="text-xs text-muted-foreground font-normal">({a.ageGroup}{a.isTrial?" · Trial":""}) </span></p>
                      <p className="text-sm text-muted-foreground">Parent: {a.parentName} · {a.phone}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Applied: {new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge s={a.status} />
                      {["new","trial_scheduled","joined","rejected"].map(s=>(
                        s !== a.status && <button key={s} onClick={()=>updateStatus("admissions",a.id,s)} className="text-xs border border-border rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors">→ {s.replace("_"," ")}</button>
                      ))}
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

      </div>
    </div>
  );
}
