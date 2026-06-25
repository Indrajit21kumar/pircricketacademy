import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, DollarSign, Bell, ChevronRight, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK_STUDENT = {
  id:"PIR001", name:"Arjun Kumar", batch:"U12 Morning", level:"Foundation",
  coach:"Coach Ravi", joinDate:"Jan 2026", phone:"98765 43210",
  attendance:[
    {month:"June 2026", present:11, total:13, pct:"84%"},
    {month:"May 2026", present:14, total:15, pct:"93%"},
    {month:"April 2026", present:13, total:14, pct:"92%"},
  ],
  fees:[
    {month:"June 2026", amount:"₹3,500", status:"Due", dueDate:"Jun 30"},
    {month:"May 2026", amount:"₹3,500", status:"Paid", paidOn:"May 5"},
    {month:"April 2026", amount:"₹3,500", status:"Paid", paidOn:"Apr 3"},
  ],
  performance:[
    {skill:"Batting", rating:3, max:5, note:"Good timing, work on footwork"},
    {skill:"Bowling", rating:4, max:5, note:"Consistent line and length"},
    {skill:"Fielding", rating:3, max:5, note:"Improving catching"},
    {skill:"Fitness", rating:4, max:5, note:"Excellent stamina"},
  ],
  notifications:[
    {type:"fee", msg:"June fee of ₹3,500 is due by June 30", time:"2 days ago", urgent:true},
    {type:"session", msg:"Tomorrow: Batting drills + match simulation · 7:00–8:30 AM", time:"5 hours ago", urgent:false},
    {type:"attend", msg:"Attendance marked: Present — Jun 22, 2026", time:"Yesterday", urgent:false},
  ]
};

export default function Student() {
  const [auth, setAuth] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone"|"otp">("phone");
  const [tab, setTab] = useState("Overview");
  const s = MOCK_STUDENT;

  const sendOtp = (e: React.FormEvent) => { e.preventDefault(); setStep("otp"); };
  const verify = (e: React.FormEvent) => { e.preventDefault(); if (otp==="1234") setAuth(true); };

  if (!auth) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="bg-card border border-border rounded-2xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/10 border-2 border-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-secondary text-2xl font-black">PIR</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Student Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Login with your registered phone number</p>
        </div>
        {step==="phone" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div><label className="label">Phone Number</label>
              <input required value={phone} onChange={e=>setPhone(e.target.value)} className="inp" placeholder="+91 98765 43210"/>
            </div>
            <button type="submit" className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-3.5 rounded-xl hover:bg-secondary/90">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">OTP sent to <strong className="text-foreground">{phone}</strong></p>
            <div><label className="label">Enter OTP</label>
              <input required value={otp} onChange={e=>setOtp(e.target.value)} className="inp text-center text-2xl tracking-widest font-mono" placeholder="• • • •" maxLength={4}/>
            </div>
            <button type="submit" className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-3.5 rounded-xl hover:bg-secondary/90">Verify & Login</button>
            <button type="button" onClick={()=>setStep("phone")} className="w-full text-sm text-muted-foreground hover:text-foreground">← Change number</button>
          </form>
        )}
        <p className="text-center text-muted-foreground text-xs mt-6">Demo: enter any phone → OTP: <span className="text-secondary font-mono">1234</span></p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="font-display text-secondary font-black text-xl">PIR</span>
            <span className="text-muted-foreground text-sm">Student Portal</span>
          </div>
          <button onClick={()=>setAuth(false)} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 flex items-center gap-1"><X className="h-3 w-3"/> Sign out</button>
        </div>
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto">
          {["Overview","Attendance","Performance","Fees"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab===t?"border-secondary text-secondary":"border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {tab==="Overview" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
            <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-6 flex flex-wrap items-center gap-6">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center text-3xl font-display font-black text-secondary">{s.name[0]}</div>
              <div>
                <h2 className="font-display text-2xl font-bold">{s.name}</h2>
                <p className="text-muted-foreground text-sm">{s.batch} · {s.level} · Coach: {s.coach}</p>
                <p className="text-muted-foreground text-xs mt-0.5">ID: {s.id} · Joined {s.joinDate}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-2"/>
                <p className="text-xl font-bold font-display">{s.attendance[0].pct}</p>
                <p className="text-xs text-muted-foreground">This Month Attendance</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-2"/>
                <p className="text-xl font-bold font-display">{s.level}</p>
                <p className="text-xs text-muted-foreground">Current Level</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <DollarSign className="h-5 w-5 text-secondary mx-auto mb-2"/>
                <p className="text-xl font-bold font-display text-yellow-400">Due</p>
                <p className="text-xs text-muted-foreground">June Fee Status</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2"><Bell className="h-4 w-4"/> Notifications</h3>
              <div className="space-y-3">
                {s.notifications.map((n,i)=>(
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${n.urgent?"bg-red-400/5 border border-red-400/20":"bg-muted/30"}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.urgent?"bg-red-400":"bg-muted-foreground"}`}/>
                    <div className="flex-1"><p className="text-sm">{n.msg}</p><p className="text-xs text-muted-foreground mt-0.5">{n.time}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab==="Attendance" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Attendance Record</h2>
            {s.attendance.map(a=>(
              <div key={a.month} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold">{a.month}</p>
                  <span className={`font-bold ${parseFloat(a.pct)>=90?"text-green-400":"text-yellow-400"}`}>{a.pct}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${parseFloat(a.pct)>=90?"bg-green-400":"bg-yellow-400"}`} style={{width:a.pct}}/>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{a.present} present out of {a.total} sessions</p>
              </div>
            ))}
          </motion.div>
        )}

        {tab==="Performance" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Performance Ratings</h2>
            <p className="text-muted-foreground text-sm">Latest coach assessment — June 2026</p>
            {s.performance.map(p=>(
              <div key={p.skill} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold">{p.skill}</p>
                  <div className="flex gap-1">
                    {Array.from({length:p.max}).map((_,i)=>(
                      <div key={i} className={`w-6 h-6 rounded-md ${i<p.rating?"bg-secondary":"bg-muted"}`}/>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{p.note}</p>
              </div>
            ))}
          </motion.div>
        )}

        {tab==="Fees" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Fee Status</h2>
            {s.fees.map(f=>(
              <div key={f.month} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-bold">{f.month}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.status==="Paid"?`Paid on ${(f as any).paidOn}`:`Due by ${(f as any).dueDate}`}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-secondary">{f.amount}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${f.status==="Paid"?"bg-green-400/10 text-green-400":"bg-yellow-400/10 text-yellow-400"}`}>{f.status}</span>
                  {f.status!=="Paid" && <button className="text-xs bg-secondary text-secondary-foreground font-bold px-3 py-1.5 rounded-lg hover:bg-secondary/90">Pay Now</button>}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <style>{`.label{display:block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:.375rem}.inp{width:100%;background:#0a0f1e;border:1px solid #1e293b;border-radius:.5rem;padding:.75rem 1rem;color:#f1f5f9;font-size:.875rem;outline:none}.inp:focus{border-color:#eab308}`}</style>
    </div>
  );
}
