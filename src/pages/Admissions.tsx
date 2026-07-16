import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, ArrowRight, Tag, Upload, X, AlertCircle, ShieldCheck } from "lucide-react";

declare global { interface Window { Razorpay: any; } }

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById("rzp-script")) { resolve(true); return; }
    const s = document.createElement("script");
    s.id = "rzp-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const AGES  = ["U8 (Under 8)","U12 (Under 12)","U16 (Under 16)","U19 (Under 19)","Elite","Not sure — need assessment"];
const BLOOD = ["A+","A-","B+","B-","O+","O-","AB+","AB-","Unknown"];

const PACKAGES = [
  { months: 3,  label: "3-Month Pack",  pkgDiscount: 10 },
  { months: 6,  label: "6-Month Pack",  pkgDiscount: 15 },
  { months: 12, label: "12-Month Pack", pkgDiscount: 20 },
];
const REG_FEE    = 5000;
const KIT_FEE    = 2000;
const MONTHLY_FEE = 3500;

interface DiscountType { id:number; name:string; percentage:number; description:string; requiredDocument:string; isActive:boolean; }

const STEPS = ["Student Details","Parent & Medical","Consent","Discount (Optional)","Review & Submit"];

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

  // Discount state
  const [discountTypes, setDiscountTypes]       = useState<DiscountType[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountType|null>(null);
  const [docFile, setDocFile]                   = useState<File|null>(null);
  const [docPreview, setDocPreview]             = useState<string>("");
  const [eligConfirmed, setEligConfirmed]       = useState(false);
  const [skipDiscount, setSkipDiscount]         = useState(false);

  const [selectedPackage, setSelectedPackage] = useState<number|null>(null); // null = reg only

  const [done, setDone]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [payMode, setPayMode] = useState<"online"|"cash">("online");
  const [errors, setErrors] = useState<Record<string,string>>({});

  const f = (k: string, v: any) => { setForm(p => ({...p,[k]:v})); setErrors(e => ({...e,[k]:""})); }
  const allConsents = form.consentMedical && form.consentPhoto && form.consentLiability && form.consentTerms && form.consentData;

  const validPhone = (v: string) => /^\d{10}$/.test(v.replace(/\D/g,"").replace(/^91/,""));
  const validDob = (v: string) => {
    if (!v) return "Date of birth is required";
    const d = new Date(v), now = new Date();
    if (d >= now) return "Date of birth must be in the past";
    const age = (now.getTime() - d.getTime()) / (365.25 * 86400000);
    if (age < 4) return "Student must be at least 4 years old";
    if (age > 35) return "Please check the date of birth entered";
    return "";
  };

  const validateStep1 = () => {
    const e: Record<string,string> = {};
    if (!form.studentName.trim()) e.studentName = "Student name is required";
    const dobErr = validDob(form.dob); if (dobErr) e.dob = dobErr;
    if (!form.ageGroup) e.ageGroup = "Please select an age group";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e); return Object.keys(e).length === 0;
  };
  const validateStep2 = () => {
    const e: Record<string,string> = {};
    if (!form.parentName.trim()) e.parentName = "Parent name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!validPhone(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.emergencyName.trim()) e.emergencyName = "Emergency contact name is required";
    if (!form.emergencyPhone.trim()) e.emergencyPhone = "Emergency contact phone is required";
    else if (!validPhone(form.emergencyPhone)) e.emergencyPhone = "Enter a valid 10-digit mobile number";
    setErrors(e); return Object.keys(e).length === 0;
  };

  // Package & discount calculations
  const eligPct = selectedDiscount && eligConfirmed && !skipDiscount ? selectedDiscount.percentage : 0;
  const pkgPct  = PACKAGES.find(p => p.months === selectedPackage)?.pkgDiscount ?? 0;
  const combinedPct  = Math.min(eligPct + pkgPct, 90);
  const monthlyTotal = selectedPackage ? Math.round(selectedPackage * MONTHLY_FEE * (1 - combinedPct / 100)) : 0;
  const kitFee  = selectedPackage ? KIT_FEE : 0;
  const totalDue = REG_FEE + kitFee + monthlyTotal;

  const PRE_OPENING_DEADLINE = new Date("2026-08-20");
  const isPreOpeningEligible = new Date() < PRE_OPENING_DEADLINE;

  useEffect(() => {
    fetch("/api/discount-types")
      .then(r => r.json())
      .then((data: DiscountType[]) => {
        const active = data.filter(d => d.isActive);
        setDiscountTypes(active);
        // Auto-apply pre-opening discount for admissions before 20 Aug 2026
        if (isPreOpeningEligible) {
          const preOpening = active.find(d => d.id === 4);
          if (preOpening) { setSelectedDiscount(preOpening); setEligConfirmed(true); setSkipDiscount(false); }
        }
      })
      .catch(() => {});
    loadRazorpayScript().catch(() => {});
  }, []);

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File too large. Max 5MB."); return; }
    setDocFile(file);
    const reader = new FileReader();
    reader.onload = ev => setDocPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submitCash = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: form.studentName, dob: form.dob, ageGroup: form.ageGroup,
          school: form.school || undefined, parentName: form.parentName,
          phone: form.phone, email: form.email, address: form.address || undefined,
          bloodGroup: form.bloodGroup || undefined, allergies: form.allergies || undefined,
          asthma: form.asthma, medicalNotes: form.medicalNotes || undefined,
          emergencyName: form.emergencyName, emergencyPhone: form.emergencyPhone,
          consentMedical: form.consentMedical, consentPhoto: form.consentPhoto,
          consentLiability: form.consentLiability, consentTerms: form.consentTerms,
          consentData: form.consentData, isTrial: form.isTrial,
          trialDate: form.trialDate || undefined, message: form.message || undefined,
          source: selectedDiscount ? `discount:${selectedDiscount.id}` : undefined,
          packageMonths: selectedPackage || null,
          eligibilityDiscountPct: eligPct,
          paymentMethod: "cash",
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Submission failed"); }
      if (selectedDiscount && !skipDiscount && eligConfirmed) {
        const { id: admissionId } = await res.json();
        await fetch("/api/discount-applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: admissionId,
            discountTypeId: selectedDiscount.id,
            documentUrl: docPreview || undefined,
            documentName: docFile?.name || undefined,
          }),
        }).catch(() => {});
      }
      setDone(true);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please call us on +91 89360 61688.");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    if (payMode === "cash") return submitCash(e);
    e.preventDefault();
    setSubmitting(true);
    setServerError("");
    try {
      // Step 1: Create admission record + get Razorpay order
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: form.studentName, dob: form.dob, ageGroup: form.ageGroup,
          school: form.school || undefined, parentName: form.parentName,
          phone: form.phone, email: form.email, address: form.address || undefined,
          bloodGroup: form.bloodGroup || undefined, allergies: form.allergies || undefined,
          asthma: form.asthma, medicalNotes: form.medicalNotes || undefined,
          emergencyName: form.emergencyName, emergencyPhone: form.emergencyPhone,
          consentMedical: form.consentMedical, consentPhoto: form.consentPhoto,
          consentLiability: form.consentLiability, consentTerms: form.consentTerms,
          consentData: form.consentData, isTrial: form.isTrial,
          trialDate: form.trialDate || undefined, message: form.message || undefined,
          source: selectedDiscount ? `discount:${selectedDiscount.id}` : undefined,
          packageMonths: selectedPackage || null,
          eligibilityDiscountPct: eligPct,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Submission failed"); }
      const { id: admissionId, orderId, keyId, amount } = await res.json();

      // Step 2: Ensure Razorpay script is loaded
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) throw new Error("Payment gateway failed to load. Please try again.");

      // Step 3: Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency: "INR",
          order_id: orderId,
          name: "PIRcricketHub",
          description: `Registration Fee — ${form.studentName}`,
          image: "/images/pir-logo-400.png",
          prefill: { name: form.parentName, contact: form.phone, email: form.email },
          handler: async (response: any) => {
            try {
              // Step 4: Verify payment server-side
              const vRes = await fetch("/api/admissions/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  admissionId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              if (!vRes.ok) { const d = await vRes.json(); throw new Error(d.error || "Payment verification failed"); }

              // Submit discount application after payment verified
              if (selectedDiscount && !skipDiscount && eligConfirmed) {
                await fetch("/api/discount-applications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    studentId: admissionId,
                    discountTypeId: selectedDiscount.id,
                    documentUrl: docPreview || undefined,
                    documentName: docFile?.name || undefined,
                  }),
                }).catch(() => {});
              }

              setDone(true);
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled. Your application is saved — please complete payment to confirm admission.")),
          },
          theme: { color: "#eab308" },
        });
        rzp.open();
      });
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
          <div className="w-20 h-20 bg-secondary/10 border-2 border-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-secondary"/>
          </div>
          <h2 className="font-display text-3xl font-bold mb-3">{payMode === "cash" ? "Seat Reserved!" : "Admission Confirmed!"}</h2>
          {payMode === "cash" ? (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 mb-4">
              <p className="text-yellow-400 font-bold text-sm">Seat reserved · Please pay ₹5,000 registration fee in cash at the academy</p>
            </div>
          ) : (
            <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-3 mb-4">
              <p className="text-green-400 font-bold text-sm">Registration fee paid · Confirmation sent to {form.email}</p>
            </div>
          )}
          <p className="text-muted-foreground mb-4">Thank you, <strong className="text-foreground">{form.parentName}</strong>. We have received {form.studentName}'s {form.isTrial ? "trial booking" : "admission application"}{payMode === "online" ? " and ₹5,000 registration fee" : ""}.</p>
          {selectedDiscount && !skipDiscount && eligConfirmed && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-4">
              <p className="text-secondary font-bold text-sm">Discount Application Submitted</p>
              <p className="text-muted-foreground text-xs mt-1">Your <strong className="text-foreground">{selectedDiscount.name}</strong> ({selectedDiscount.percentage}% off tuition) is under review. We'll confirm after verifying your document.</p>
            </div>
          )}
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
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {STEPS.map((s,i) => (
              <div key={s} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${step>=i+1 ? "bg-secondary text-secondary-foreground" : "bg-card border border-border text-muted-foreground"}`}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="container mx-auto px-4 max-w-2xl py-10">

        {/* ── Step 1: Student Details ── */}
        {step===1 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Student Details</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Student Full Name *</label>
                  <input value={form.studentName} onChange={e=>f("studentName",e.target.value)} className={`inp ${errors.studentName?"inp-err":""}`} placeholder="Enter student's full name"/>
                  {errors.studentName && <p className="text-red-400 text-xs mt-1">{errors.studentName}</p>}
                </div>
                <div>
                  <label className="label">Date of Birth *</label>
                  <input type="date" value={form.dob} onChange={e=>f("dob",e.target.value)} className={`inp ${errors.dob?"inp-err":""}`}/>
                  {errors.dob && <p className="text-red-400 text-xs mt-1">{errors.dob}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Age Group *</label>
                  <select value={form.ageGroup} onChange={e=>f("ageGroup",e.target.value)} className={`inp ${errors.ageGroup?"inp-err":""}`}>
                    <option value="">Select age group</option>
                    {AGES.map(a=><option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.ageGroup && <p className="text-red-400 text-xs mt-1">{errors.ageGroup}</p>}
                </div>
                <div><label className="label">School / College</label><input value={form.school} onChange={e=>f("school",e.target.value)} className="inp" placeholder="St. Xavier's School"/></div>
              </div>
              <div>
                <label className="label">Student Address *</label>
                <input value={form.address} onChange={e=>f("address",e.target.value)} className={`inp ${errors.address?"inp-err":""}`} placeholder="House No, Street, Area, Patna, Bihar"/>
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>
              <div className="flex items-center gap-3 bg-secondary/5 border border-secondary/20 rounded-xl p-4 mt-2">
                <input type="checkbox" id="trial" checked={form.isTrial} onChange={e=>f("isTrial",e.target.checked)} className="w-5 h-5 accent-yellow-500"/>
                <label htmlFor="trial" className="text-sm font-semibold cursor-pointer">I want to book a <span className="text-secondary">Free Trial Session</span> first before full admission</label>
              </div>
              {form.isTrial && <div><label className="label">Preferred Trial Date</label><input type="date" value={form.trialDate} onChange={e=>f("trialDate",e.target.value)} className="inp"/></div>}
            </div>
            <button type="button" onClick={()=>{ if(validateStep1()) setStep(2); }}
              className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2">
              Continue <ArrowRight className="h-5 w-5"/>
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Parent & Medical ── */}
        {step===2 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Parent & Medical Details</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Parent / Guardian</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Parent / Guardian Name *</label>
                  <input value={form.parentName} onChange={e=>f("parentName",e.target.value)} className={`inp ${errors.parentName?"inp-err":""}`} placeholder="Enter parent/guardian name"/>
                  {errors.parentName && <p className="text-red-400 text-xs mt-1">{errors.parentName}</p>}
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input value={form.phone} onChange={e=>f("phone",e.target.value)} className={`inp ${errors.phone?"inp-err":""}`} placeholder="10-digit mobile number"/>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address *</label>
                  <input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className={`inp ${errors.email?"inp-err":""}`} placeholder="Enter email address"/>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Medical Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Blood Group</label>
                  <select value={form.bloodGroup} onChange={e=>f("bloodGroup",e.target.value)} className="inp">
                    <option value="">Select</option>{BLOOD.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div><label className="label">Known Allergies</label><input value={form.allergies} onChange={e=>f("allergies",e.target.value)} className="inp" placeholder="None / Dust / Peanuts..."/></div>
              </div>
              <div className="flex items-center gap-3 bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <input type="checkbox" id="asthma" checked={form.asthma} onChange={e=>f("asthma",e.target.checked)} className="w-4 h-4"/>
                <label htmlFor="asthma" className="text-sm cursor-pointer">Student has <strong>asthma</strong> or respiratory condition</label>
              </div>
              <div><label className="label">Other Medical Conditions</label><textarea value={form.medicalNotes} onChange={e=>f("medicalNotes",e.target.value)} rows={2} className="inp resize-none" placeholder="None / describe any conditions..."/></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Emergency Contact Name *</label>
                  <input value={form.emergencyName} onChange={e=>f("emergencyName",e.target.value)} className={`inp ${errors.emergencyName?"inp-err":""}`} placeholder="Emergency contact name"/>
                  {errors.emergencyName && <p className="text-red-400 text-xs mt-1">{errors.emergencyName}</p>}
                </div>
                <div>
                  <label className="label">Emergency Contact Phone *</label>
                  <input value={form.emergencyPhone} onChange={e=>f("emergencyPhone",e.target.value)} className={`inp ${errors.emergencyPhone?"inp-err":""}`} placeholder="10-digit mobile number"/>
                  {errors.emergencyPhone && <p className="text-red-400 text-xs mt-1">{errors.emergencyPhone}</p>}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={()=>{ setErrors({}); setStep(1); }} className="px-6 py-4 border border-border rounded-xl text-muted-foreground hover:text-foreground font-bold uppercase text-sm">Back</button>
              <button type="button" onClick={()=>{ if(validateStep2()) setStep(3); }}
                className="flex-1 bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-5 w-5"/>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Consent ── */}
        {step===3 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Consent & Declarations</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">All 5 consents required</p>
              {[
                {k:"consentMedical",  label:"Medical Declaration — I confirm the medical information provided is accurate and complete."},
                {k:"consentPhoto",    label:"Photography / Video Consent — I consent to my child's image being used in academy media and reports."},
                {k:"consentLiability",label:"Liability Waiver — I acknowledge cricket involves physical risk and PIR Cricket Academy is not liable for injuries sustained during normal training."},
                {k:"consentTerms",    label:"Academy Terms — I agree to PIR Cricket Academy's rules, fee policy, and code of conduct."},
                {k:"consentData",     label:"Data Storage Declaration — I acknowledge that performance data, attendance records, photos, and videos may be stored digitally by PIR Cricket Academy for player development purposes."},
              ].map(c=>(
                <div key={c.k} className="flex items-start gap-3 bg-muted/30 rounded-xl p-4">
                  <input type="checkbox" id={c.k} checked={(form as any)[c.k]} onChange={e=>f(c.k,e.target.checked)} className="w-5 h-5 mt-0.5 accent-yellow-500 shrink-0"/>
                  <label htmlFor={c.k} className="text-sm text-foreground/80 cursor-pointer leading-relaxed">{c.label}</label>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={()=>setStep(2)} className="px-6 py-4 border border-border rounded-xl text-muted-foreground hover:text-foreground font-bold uppercase text-sm">Back</button>
              <button type="button" onClick={()=>setStep(4)} disabled={!allConsents}
                className="flex-1 bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-5 w-5"/>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Discount (Optional) ── */}
        {step===4 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Tag className="h-6 w-6 text-secondary"/>
              <h2 className="font-display text-2xl font-bold">Discount Eligibility</h2>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium">Optional</span>
              <span className="text-xs bg-secondary/10 border border-secondary/30 text-secondary px-2 py-1 rounded-full font-bold">Max 2 discounts (1 eligibility + 1 package)</span>
            </div>

            {/* Pre-opening auto-applied banner */}
            {isPreOpeningEligible && selectedDiscount?.id === 4 && (
              <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="bg-secondary/15 border-2 border-secondary/50 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-secondary"/>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-secondary text-sm uppercase tracking-wide mb-1">Pre-Opening Discount — Auto-Applied ✓</p>
                  <p className="text-foreground font-medium">25% off monthly tuition fee has been automatically applied to your admission.</p>
                  <p className="text-muted-foreground text-xs mt-1.5">You are registering before 20 August 2026 (Founding Batch deadline). No document is required — this discount is verified by date of application.</p>
                </div>
              </motion.div>
            )}

            {discountTypes.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                <Tag className="h-10 w-10 mx-auto mb-3 opacity-30"/>
                <p>No discount schemes are currently available.</p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">
                  {isPreOpeningEligible
                    ? "Your 25% pre-opening discount is locked in. You can stack one package discount on top — that's all. Max 2 discounts per student."
                    : "Select one eligibility discount if applicable, then combine it with a package discount for maximum savings. Max 2 discounts per student (1 eligibility + 1 package)."}
                </p>

                {/* Discount cards — hide all when pre-opening is auto-applied (already at max 1 eligibility) */}
                {!isPreOpeningEligible && (
                <div className="space-y-3">
                  {discountTypes.filter(d => d.id !== 4).map(d => {
                    const selected = selectedDiscount?.id === d.id;
                    const noDocNeeded = d.requiredDocument.toLowerCase().startsWith("no document");
                    return (
                      <div key={d.id}
                        onClick={() => { setSelectedDiscount(selected ? null : d); setEligConfirmed(false); setDocFile(null); setDocPreview(""); setSkipDiscount(false); }}
                        className={`bg-card border rounded-2xl p-5 cursor-pointer transition-all ${selected ? "border-secondary shadow-[0_0_20px_rgba(234,179,8,0.15)]" : "border-border hover:border-secondary/40"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold">{d.name}</p>
                              <span className="bg-secondary/15 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{d.percentage}% off tuition</span>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1.5">{d.description}</p>
                            <div className="flex items-start gap-1.5 mt-2 bg-muted/40 rounded-lg px-3 py-2">
                              <AlertCircle className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5"/>
                              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Required document:</span> {d.requiredDocument}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selected ? "border-secondary bg-secondary" : "border-muted-foreground"}`}>
                            {selected && <div className="w-2 h-2 rounded-full bg-secondary-foreground"/>}
                          </div>
                        </div>

                        {/* Expanded: eligibility confirm + doc upload */}
                        {selected && (
                          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="mt-4 space-y-4 overflow-hidden" onClick={e=>e.stopPropagation()}>
                            <div className="border-t border-border/50 pt-4">
                              {!noDocNeeded && (
                                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-3">
                                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5"/>
                                  <p className="text-xs text-red-300 leading-relaxed">
                                    <strong className="text-red-400">Important:</strong> All submitted documents are scrutinised by our admin team. If any document is found to be false or forged, the discount will be <strong className="text-red-400">permanently cancelled at any time</strong> — even after admission is confirmed.
                                  </p>
                                </div>
                              )}

                              {/* Eligibility confirm */}
                              <div className="flex items-start gap-3 bg-secondary/5 border border-secondary/20 rounded-xl p-4 mb-4">
                                <input type="checkbox" id={`eligConfirm-${d.id}`} checked={eligConfirmed} onChange={e=>setEligConfirmed(e.target.checked)} className="w-5 h-5 mt-0.5 accent-yellow-500 shrink-0"/>
                                <label htmlFor={`eligConfirm-${d.id}`} className="text-sm cursor-pointer leading-relaxed">
                                  I confirm that <strong className="text-foreground">{form.studentName || "the student"}</strong> genuinely meets the eligibility criteria for <strong className="text-secondary">{d.name}</strong>{noDocNeeded ? "." : ", and the document I am uploading is authentic and valid."}
                                </label>
                              </div>

                              {/* Doc upload — only if document required */}
                              {eligConfirmed && !noDocNeeded && (
                                <div>
                                  <label className="label">Upload Proof Document *</label>
                                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-secondary/40 rounded-xl p-6 cursor-pointer hover:border-secondary/70 hover:bg-secondary/5 transition-all">
                                    {docPreview ? (
                                      <div className="w-full">
                                        <div className="flex items-center justify-between gap-2 bg-green-400/10 border border-green-400/30 rounded-lg px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-400 shrink-0"/>
                                            <span className="text-sm font-medium text-green-400 truncate">{docFile?.name}</span>
                                          </div>
                                          <button type="button" onClick={e=>{e.stopPropagation();setDocFile(null);setDocPreview("");}} className="text-muted-foreground hover:text-foreground">
                                            <X className="h-4 w-4"/>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <Upload className="h-8 w-8 text-secondary/60 mb-2"/>
                                        <p className="text-sm text-muted-foreground text-center">Click to upload or drag & drop</p>
                                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or PDF · Max 5MB</p>
                                      </>
                                    )}
                                    <input type="file" accept="image/*,.pdf" onChange={handleDocUpload} className="hidden"/>
                                  </label>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}

                {/* Skip option */}
                <div
                  onClick={()=>{ setSkipDiscount(true); setSelectedDiscount(null); setEligConfirmed(false); }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all text-center ${skipDiscount ? "border-secondary/30 bg-secondary/5" : "border-border hover:border-border/80"}`}>
                  <p className="text-sm text-muted-foreground">
                    {isPreOpeningEligible ? "Keep only the pre-opening discount — " : "I don't have a discount — "}
                    <span className="text-foreground font-medium">skip additional discounts</span>
                  </p>
                </div>
              </>
            )}

            {/* Discount summary box */}
            {selectedDiscount && eligConfirmed && selectedDiscount.id !== 4 && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-secondary/10 border border-secondary/40 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">Additional Discount Selected</p>
                <p className="text-sm font-medium">{selectedDiscount.name} — <span className="text-secondary font-bold">{selectedDiscount.percentage}% off tuition fee</span></p>
                <p className="text-xs text-muted-foreground mt-1">This discount will be reviewed by the admin after submission. You'll be notified once approved.</p>
                {!docFile && !selectedDiscount.requiredDocument.toLowerCase().startsWith("no document") && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/> Please upload your proof document above</p>}
              </motion.div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={()=>setStep(3)} className="px-6 py-4 border border-border rounded-xl text-muted-foreground hover:text-foreground font-bold uppercase text-sm">Back</button>
              <button type="button"
                onClick={()=>setStep(5)}
                disabled={discountTypes.length > 0 && !skipDiscount && !(selectedDiscount && eligConfirmed) && !(isPreOpeningEligible && selectedDiscount?.id === 4)}
                className="flex-1 bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-5 w-5"/>
              </button>
            </div>
            {discountTypes.length > 0 && !skipDiscount && !(selectedDiscount && eligConfirmed) && (
              <p className="text-xs text-muted-foreground text-center">Select a discount and confirm eligibility, or choose "skip this step"</p>
            )}
          </motion.div>
        )}

        {/* ── Step 5: Review & Submit ── */}
        {step===5 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Review & Submit</h2>

            {/* Summary card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Application Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="text-muted-foreground">Student</span><span className="font-medium">{form.studentName}</span>
                <span className="text-muted-foreground">Age Group</span><span className="font-medium">{form.ageGroup}</span>
                <span className="text-muted-foreground">Date of Birth</span><span className="font-medium">{form.dob}</span>
                <span className="text-muted-foreground">Parent</span><span className="font-medium">{form.parentName}</span>
                <span className="text-muted-foreground">Phone</span><span className="font-medium">{form.phone}</span>
                <span className="text-muted-foreground">Type</span><span className="font-medium">{form.isTrial ? "Free Trial Session" : "Full Admission"}</span>
              </div>
              {selectedDiscount && eligConfirmed && !skipDiscount && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-secondary"/>
                    <span className="text-secondary font-bold text-sm">{selectedDiscount.name} ({selectedDiscount.percentage}% off tuition) — Pending admin approval</span>
                  </div>
                  {docFile && <p className="text-xs text-muted-foreground mt-1 ml-6">Document: {docFile.name} ✓</p>}
                </div>
              )}
            </div>

            {/* Package Selection */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Fee Package (Optional)</p>
              <p className="text-muted-foreground text-xs mb-4">Pay monthly fees upfront to unlock additional savings. <strong className="text-foreground">All discounts apply only to the monthly tuition fee.</strong> Registration fee (₹5,000) and Kit fee (₹2,000) are fixed and not discountable.</p>

              {/* Registration only option */}
              <div onClick={() => setSelectedPackage(null)} className={`border rounded-xl p-3 cursor-pointer mb-2 transition-all ${selectedPackage === null ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/30"}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Registration Only</span>
                  <span className="font-bold text-secondary">₹5,000</span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">Monthly fee billed separately each month</p>
              </div>

              {/* Package cards */}
              {PACKAGES.map(pkg => {
                const combined = Math.min(eligPct + pkg.pkgDiscount, 90);
                const monthly  = Math.round(pkg.months * MONTHLY_FEE * (1 - combined / 100));
                const total    = REG_FEE + KIT_FEE + monthly;
                const saving   = pkg.months * MONTHLY_FEE - monthly;
                return (
                  <div key={pkg.months} onClick={() => setSelectedPackage(pkg.months)}
                    className={`border rounded-xl p-3 cursor-pointer mb-2 transition-all ${selectedPackage === pkg.months ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/30"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-sm">{pkg.label}</span>
                        <span className="ml-2 text-xs bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-bold">
                          {pkg.pkgDiscount}% off monthly{eligPct > 0 ? ` + ${eligPct}% eligibility = ${combined}% combined` : ""}
                        </span>
                      </div>
                      <span className="font-bold text-secondary">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Reg ₹5,000 + Kit ₹2,000 + {pkg.months}mo ₹{monthly.toLocaleString("en-IN")}</span>
                      <span className="text-green-400 font-semibold">Save ₹{saving.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Summary */}
            <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-5 mb-4">
              <p className="text-xs font-bold uppercase text-secondary mb-3">Payment Summary</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Registration Fee</span><span className="font-bold">₹5,000</span></div>
                {selectedPackage && <div className="flex justify-between"><span className="text-muted-foreground">Academy Kit</span><span className="font-bold">₹2,000</span></div>}
                {selectedPackage && <div className="flex justify-between"><span className="text-muted-foreground">{selectedPackage} months × ₹3,500</span><span className="text-muted-foreground line-through">₹{(selectedPackage*3500).toLocaleString("en-IN")}</span></div>}
                {combinedPct > 0 && selectedPackage && <div className="flex justify-between text-green-400"><span>Combined discount ({combinedPct}% off monthly)</span><span>−₹{(selectedPackage*3500 - monthlyTotal).toLocaleString("en-IN")}</span></div>}
                {selectedDiscount && eligConfirmed && !skipDiscount && !selectedPackage && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{selectedDiscount.name} ({selectedDiscount.percentage}% off tuition)</span>
                    <span className="text-secondary text-xs">Pending verification</span>
                  </div>
                )}
                <div className="border-t border-secondary/20 mt-2 pt-2 flex justify-between">
                  <span className="font-bold">Total Due Now</span>
                  <span className="font-display text-xl font-bold text-secondary">₹{totalDue.toLocaleString("en-IN")}</span>
                </div>
              </div>
              {!selectedPackage && <p className="text-xs text-muted-foreground mt-2">Monthly fee (₹3,500/mo) billed separately · Kit fee (₹2,000) billed at enrollment</p>}
              {selectedPackage && eligPct > 0 && <p className="text-xs text-muted-foreground mt-2">Eligibility discount subject to document verification. Admin may adjust if not approved.</p>}
            </div>

            <div><label className="label">Additional Message (optional)</label><textarea value={form.message} onChange={e=>f("message",e.target.value)} rows={3} className="inp resize-none" placeholder="Any questions or specific requirements..."/></div>

            {/* Payment mode selector */}
            <div className="flex gap-2">
              <button type="button" onClick={() => setPayMode("online")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${payMode==="online" ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-muted-foreground hover:border-secondary/50"}`}>
                💳 Pay Online
              </button>
              <button type="button" onClick={() => setPayMode("cash")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${payMode==="cash" ? "bg-green-600 text-white border-green-600" : "border-border text-muted-foreground hover:border-green-600/50"}`}>
                💵 Pay by Cash
              </button>
            </div>

            {serverError && <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">{serverError}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={()=>setStep(4)} className="px-6 py-4 border border-border rounded-xl text-muted-foreground hover:text-foreground font-bold uppercase text-sm">Back</button>
              <button type="submit" disabled={submitting}
                className={`flex-1 font-bold uppercase py-4 rounded-xl transition-all disabled:opacity-40 text-base flex items-center justify-center gap-2 ${payMode==="cash" ? "bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.25)]" : "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_20px_rgba(234,179,8,0.25)]"}`}>
                <ShieldCheck className="h-5 w-5"/>
                {submitting ? "Processing..." : payMode === "cash" ? `Reserve Seat · Pay ₹${totalDue.toLocaleString("en-IN")} Cash at Academy` : `Pay ₹${totalDue.toLocaleString("en-IN")} Online & Confirm`}
              </button>
            </div>
            <p className="text-center text-muted-foreground text-xs">
              {payMode === "cash" ? "Your seat will be reserved. Pay cash at the academy on joining day." : "We will contact you within 24 hours · Patna, Bihar"}
            </p>
          </motion.div>
        )}
      </form>

      <style>{`.label{display:block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:.375rem}.inp{width:100%;background:#0a0f1e;border:1px solid #1e293b;border-radius:.5rem;padding:.75rem 1rem;color:#f1f5f9;font-size:.875rem;outline:none}.inp:focus{border-color:#eab308}`}</style>
      <Footer/>
    </div>
  );
}
