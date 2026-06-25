import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, ArrowRight } from "lucide-react";

const AGES = ["U8 (Under 8)","U12 (Under 12)","U16 (Under 16)","U19 (Under 19)","Elite","Not sure — need assessment"];
const BLOOD = ["A+","A-","B+","B-","O+","O-","AB+","AB-","Unknown"];

export default function Admissions() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    studentName:"", dob:"", ageGroup:"", school:"",
    parentName:"", phone:"", email:"", address:"",
    bloodGroup:"", allergies:"", asthma:false, medicalNotes:"",
    emergencyName:"", emergencyPhone:"",
    consentMedical:false, consentPhoto:false, consentLiability:false, consentTerms:false, consentData:false,
    isTrial:false, trialDate:"", message:""
  });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const f = (k: string, v: any) => setForm(p => ({...p,[k]:v}));
  const allConsents = form.consentMedical && form.consentPhoto && form.consentLiability && form.consentTerms && form.consentData;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName:    form.studentName,
          dob:            form.dob,
          ageGroup:       form.ageGroup,
          school:         form.school || undefined,
          parentName:     form.parentName,
          phone:          form.phone,
          email:          form.email || undefined,
          address:        form.address || undefined,
          bloodGroup:     form.bloodGroup || undefined,
          allergies:      form.allergies || undefined,
          asthma:         form.asthma,
          medicalNotes:   form.medicalNotes || undefined,
          emergencyName:  form.emergencyName,
          emergencyPhone: form.emergencyPhone,
          isTrial:        form.isTrial,
          trialDate:      form.trialDate || undefined,
          message:        form.message || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      setDone(true);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please call us on +91 89360 61688.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-background"><Navbar/>
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-md text-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-card border border-secondary/30 rounded-2xl p-12">
          <div className="w-20 h-20 bg-secondary/10 border-2 border-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-secondary"/></div>
          <h2 className="font-display text-3xl font-bold mb-3">Application Received!</h2>
          <p className="text-muted-foreground mb-4">Thank you, <strong className="text-foreground">{form.parentName}</strong>. We have received {form.studentName}'s {form.isTrial?"trial booking":"admission application"}.</p>
          <p className="text-muted-foreground text-sm">We will contact you on <strong className="text-foreground">{form.phone}</strong> within 24 hours to confirm batch details and next steps.</p>
          <p className="text-secondary font-bold text-sm mt-4 uppercase tracking-wide">PIR Cricket Academy — Patna</p>
        </motion.div>
      </div>
      <Footer/>
    </div>
  );

  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <div className="pt-28 pb-10 bg-gradient-to-b from-secondary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Admissions 2026</h1>
          <p className="text-muted-foreground text-lg">Founding Batch — Early Admissions Open</p>
          <div className="flex justify-center gap-2 mt-6">
            {["Student Details","Parent & Medical","Consent & Submit"].map((s,i)=>(
              <div key={s} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${step>=i+1?"bg-secondary text-secondary-foreground":"bg-card border border-border text-muted-foreground"}`}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="container mx-auto px-4 max-w-2xl py-10">
        {step===1 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Student Details</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Student Full Name *</label><input required value={form.studentName} onChange={e=>f("studentName",e.target.value)} className="inp" placeholder="Arjun Kumar"/></div>
                <div><label className="label">Date of Birth *</label><input required type="date" value={form.dob} onChange={e=>f("dob",e.target.value)} className="inp"/></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Age Group *</label>
                  <select required value={form.ageGroup} onChange={e=>f("ageGroup",e.target.value)} className="inp">
                    <option value="">Select age group</option>
                    {AGES.map(a=><option key={a} value={a}>{a}</option>)}
                  </select></div>
                <div><label className="label">School / College</label><input value={form.school} onChange={e=>f("school",e.target.value)} className="inp" placeholder="St. Xavier's School"/></div>
              </div>
              <div><label className="label">Student Address *</label><input required value={form.address} onChange={e=>f("address",e.target.value)} className="inp" placeholder="House No, Street, Area, Patna, Bihar"/></div>
              <div className="flex items-center gap-3 bg-secondary/5 border border-secondary/20 rounded-xl p-4 mt-2">
                <input type="checkbox" id="trial" checked={form.isTrial} onChange={e=>f("isTrial",e.target.checked)} className="w-5 h-5 accent-yellow-500"/>
                <label htmlFor="trial" className="text-sm font-semibold cursor-pointer">I want to book a <span className="text-secondary">Free Trial Session</span> first before full admission</label>
              </div>
              {form.isTrial && <div><label className="label">Preferred Trial Date</label><input type="date" value={form.trialDate} onChange={e=>f("trialDate",e.target.value)} className="inp"/></div>}
            </div>
            <button type="button" onClick={()=>setStep(2)} disabled={!form.studentName||!form.dob||!form.ageGroup} className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              Continue <ArrowRight className="h-5 w-5"/>
            </button>
          </motion.div>
        )}

        {step===2 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Parent & Medical Details</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Parent / Guardian</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Parent / Guardian Name *</label><input required value={form.parentName} onChange={e=>f("parentName",e.target.value)} className="inp" placeholder="Ramesh Kumar"/></div>
                <div><label className="label">Phone Number *</label><input required value={form.phone} onChange={e=>f("phone",e.target.value)} className="inp" placeholder="+91 98765 43210"/></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Email Address</label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="inp" placeholder="ramesh@email.com"/></div>
                <div><label className="label">Address</label><input value={form.address} onChange={e=>f("address",e.target.value)} className="inp" placeholder="Patna, Bihar"/></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Medical Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Blood Group</label>
                  <select value={form.bloodGroup} onChange={e=>f("bloodGroup",e.target.value)} className="inp">
                    <option value="">Select</option>{BLOOD.map(b=><option key={b} value={b}>{b}</option>)}
                  </select></div>
                <div><label className="label">Known Allergies</label><input value={form.allergies} onChange={e=>f("allergies",e.target.value)} className="inp" placeholder="None / Dust / Peanuts..."/></div>
              </div>
              <div className="flex items-center gap-3 bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <input type="checkbox" id="asthma" checked={form.asthma} onChange={e=>f("asthma",e.target.checked)} className="w-4 h-4"/>
                <label htmlFor="asthma" className="text-sm cursor-pointer">Student has <strong>asthma</strong> or respiratory condition</label>
              </div>
              <div><label className="label">Other Medical Conditions</label><textarea value={form.medicalNotes} onChange={e=>f("medicalNotes",e.target.value)} rows={2} className="inp resize-none" placeholder="None / describe any conditions..."/></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Emergency Contact Name *</label><input required value={form.emergencyName} onChange={e=>f("emergencyName",e.target.value)} className="inp" placeholder="Sunita Kumar"/></div>
                <div><label className="label">Emergency Contact Phone *</label><input required value={form.emergencyPhone} onChange={e=>f("emergencyPhone",e.target.value)} className="inp" placeholder="+91 99999 99999"/></div>
              </div>
            </div>
            <button type="button" onClick={()=>setStep(3)} disabled={!form.parentName||!form.phone||!form.emergencyName||!form.emergencyPhone} className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              Continue <ArrowRight className="h-5 w-5"/>
            </button>
          </motion.div>
        )}

        {step===3 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Consent & Submit</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">All 5 consents required</p>
              {[
                {k:"consentMedical",label:"Medical Declaration — I confirm the medical information provided is accurate and complete."},
                {k:"consentPhoto",label:"Photography / Video Consent — I consent to my child's image being used in academy media and reports."},
                {k:"consentLiability",label:"Liability Waiver — I acknowledge cricket involves physical risk and PIR Cricket Academy is not liable for injuries sustained during normal training."},
                {k:"consentTerms",label:"Academy Terms — I agree to PIR Cricket Academy's rules, fee policy, and code of conduct."},
                {k:"consentData",label:"Data Storage Declaration — I acknowledge that performance data, attendance records, photos, and videos may be stored digitally by PIR Cricket Academy for player development purposes."},
              ].map(c=>(
                <div key={c.k} className="flex items-start gap-3 bg-muted/30 rounded-xl p-4">
                  <input type="checkbox" id={c.k} checked={(form as any)[c.k]} onChange={e=>f(c.k,e.target.checked)} className="w-5 h-5 mt-0.5 accent-yellow-500 shrink-0"/>
                  <label htmlFor={c.k} className="text-sm text-foreground/80 cursor-pointer leading-relaxed">{c.label}</label>
                </div>
              ))}
            </div>
            <div><label className="label">Additional Message (optional)</label><textarea value={form.message} onChange={e=>f("message",e.target.value)} rows={3} className="inp resize-none" placeholder="Any questions or specific requirements..."/></div>
            {serverError && <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">{serverError}</p>}
            <button type="submit" disabled={!allConsents || submitting} className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.25)] disabled:opacity-40 text-base">
              {submitting ? "Submitting..." : form.isTrial ? "Submit Trial Booking" : "Submit Admission Application"}
            </button>
            <p className="text-center text-muted-foreground text-xs">We will contact you within 24 hours · Patna, Bihar</p>
          </motion.div>
        )}
      </form>

      <style>{`.label{display:block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:.375rem}.inp{width:100%;background:#0a0f1e;border:1px solid #1e293b;border-radius:.5rem;padding:.75rem 1rem;color:#f1f5f9;font-size:.875rem;outline:none}.inp:focus{border-color:#eab308}`}</style>
      <Footer/>
    </div>
  );
}
