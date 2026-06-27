import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, XCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const FACILITIES = [
  { id:"box",    name:"Box Cricket Arena", emoji:"🏟️", pricing:{weekday:1500, weekend:1800, night:2200} },
  { id:"turf",   name:"Turf Wicket",       emoji:"🏏", pricing:{weekday:800,  weekend:1000, night:null} },
  { id:"cement", name:"Cement Wicket",     emoji:"⚡", pricing:{weekday:500,  weekend:700,  night:null} },
];
const SLOTS = ["06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM"];
const DURATIONS = [1,2,3];

function getRate(facility: typeof FACILITIES[0], slot: string, date: string) {
  if (!date || !slot) return facility.pricing.weekday;
  const day = new Date(date).getDay();
  const isWeekend = day === 0 || day === 6;
  const isNight = slot.includes("PM") && parseInt(slot) >= 6;
  if (isNight && facility.pricing.night) return facility.pricing.night;
  return isWeekend ? facility.pricing.weekend : facility.pricing.weekday;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Booking() {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState({ facility:"", date:"", slot:"", duration:1, name:"", phone:"", email:"" });
  const [done, setDone] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotPopup, setSlotPopup] = useState("");

  useEffect(() => { loadRazorpayScript(); }, []);

  const fetchBookedSlots = useCallback(async (facility: string, date: string) => {
    if (!facility || !date) return;
    try {
      const res = await fetch(`/api/bookings/slots?date=${date}&facility=${facility}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
    } catch { setBookedSlots([]); }
  }, []);

  const facility = FACILITIES.find(f => f.id === sel.facility);
  const rate = facility ? getRate(facility, sel.slot, sel.date) : 0;
  const total = rate * sel.duration;
  const today = new Date().toISOString().split("T")[0];

  const pay = async () => {
    if (!facility) return;
    setSubmitting(true);
    setServerError("");

    try {
      // Step 1: Create booking + Razorpay order on server
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facility: sel.facility, facilityName: facility.name,
          date: sel.date, slot: sel.slot,
          duration: sel.duration, rate, total,
          name: sel.name, phone: sel.phone,
          email: sel.email || undefined,
        }),
      });
      const text = await res.text();
      if (!text) throw new Error(`Empty response (HTTP ${res.status})`);
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const { bookingId, orderId, amount, keyId } = data;

      // Step 2: Load Razorpay if not already loaded
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load payment gateway. Please try again.");

      // Step 3: Open Razorpay UPI checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency: "INR",
          order_id: orderId,
          name: "PIR Cricket Academy",
          description: `${facility.name} · ${sel.date} · ${sel.slot}`,
          image: "/logo.png",
          prefill: { name: sel.name, contact: sel.phone, email: sel.email || "" },
          config: {
            display: {
              blocks: { upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] } },
              sequence: ["block.upi"],
              preferences: { show_default_blocks: false },
            },
          },
          handler: async (response: any) => {
            try {
              // Step 4: Verify payment on server
              const vRes = await fetch("/api/bookings/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const vData = await vRes.json();
              if (!vRes.ok) throw new Error(vData.error || "Payment verification failed");
              setBookingRef(vData.ref);
              setDone(true);
              resolve();
            } catch (e: any) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled. Your slot is held for 10 minutes.")),
          },
          theme: { color: "#eab308" },
        });
        rzp.open();
      });
    } catch (err: any) {
      setServerError(err.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-md text-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-card border border-secondary/30 rounded-2xl p-12">
          <div className="w-20 h-20 bg-secondary/10 border-2 border-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-secondary"/>
          </div>
          <h2 className="font-display text-3xl font-bold mb-3">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-2">Booking reference: <strong className="text-secondary">{bookingRef}</strong></p>
          <p className="text-muted-foreground text-sm mb-1">{facility?.name} · {sel.date} · {sel.slot}</p>
          <p className="text-muted-foreground text-sm mb-6">{sel.duration} hour{sel.duration>1?"s":""} · ₹{total.toLocaleString()}</p>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-400">
            Payment received · Confirmation email sent to <strong>{sel.email}</strong>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-28 pb-10 bg-gradient-to-b from-secondary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Book a Facility</h1>
          <p className="text-muted-foreground text-lg">Box Cricket · Turf Wicket · Cement Wicket</p>
          <div className="flex justify-center gap-2 mt-6">
            {[1,2,3].map(s=>(
              <button key={s} onClick={() => { if (step > s) setStep(s); }} disabled={step < s}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all
                  ${step===s ? "bg-secondary text-secondary-foreground" : step>s ? "bg-secondary/30 text-secondary cursor-pointer hover:bg-secondary/50" : "bg-card border border-border text-muted-foreground cursor-not-allowed"}`}>
                {s===1?"Facility":s===2?"Date & Time":"Details & Pay"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl py-10">
        {step===1 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <h2 className="font-display text-2xl font-bold mb-6">Select Facility</h2>
            <div className="space-y-4">
              {FACILITIES.map(f=>(
                <button key={f.id} onClick={()=>{setSel({...sel,facility:f.id,slot:""});setBookedSlots([]);setStep(2);}}
                  className={`w-full bg-card border rounded-2xl p-6 text-left flex items-center gap-5 hover:border-secondary/50 transition-all ${sel.facility===f.id?"border-secondary":"border-border"}`}>
                  <span className="text-4xl">{f.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{f.name}</p>
                    <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-muted-foreground">
                      <span>Weekday: <strong className="text-secondary">₹{f.pricing.weekday}/hr</strong></span>
                      <span>Weekend: <strong className="text-secondary">₹{f.pricing.weekend}/hr</strong></span>
                      {f.pricing.night && <span>Night: <strong className="text-secondary">₹{f.pricing.night}/hr</strong></span>}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0"/>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step===2 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <button onClick={()=>setStep(1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"><ArrowLeft className="h-4 w-4"/>Back</button>
            <h2 className="font-display text-2xl font-bold mb-6">Select Date & Time</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"><Calendar className="h-4 w-4 inline mr-1.5"/>Date</label>
                <input type="date" min={today} value={sel.date} onChange={e=>{setSel({...sel,date:e.target.value,slot:""});fetchBookedSlots(sel.facility,e.target.value);}} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors"/></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"><Clock className="h-4 w-4 inline mr-1.5"/>Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {SLOTS.map(s=>{
                    const isBooked = bookedSlots.includes(s);
                    return (
                      <button key={s}
                        onClick={()=>{
                          if(isBooked){setSlotPopup(s);return;}
                          setSel({...sel,slot:s});
                        }}
                        className={`py-2.5 rounded-lg text-sm font-semibold border transition-all relative
                          ${isBooked
                            ? "bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed"
                            : sel.slot===s
                              ? "bg-secondary text-secondary-foreground border-secondary"
                              : "bg-background border-border hover:border-secondary/40"}`}>
                        {s}
                        {isBooked && <span className="block text-[10px] font-normal mt-0.5">Booked</span>}
                      </button>
                    );
                  })}
                </div></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Duration</label>
                <div className="flex gap-3">
                  {DURATIONS.map(d=>(
                    <button key={d} onClick={()=>setSel({...sel,duration:d})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${sel.duration===d?"bg-secondary text-secondary-foreground border-secondary":"bg-background border-border hover:border-secondary/40"}`}>{d} Hour{d>1?"s":""}</button>
                  ))}
                </div></div>
              {sel.date && sel.slot && (
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Estimated total</p>
                  <p className="font-display text-2xl font-bold text-secondary">₹{(rate*sel.duration).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">₹{rate}/hr × {sel.duration}hr</p>
                </div>
              )}
              <button disabled={!sel.date||!sel.slot} onClick={()=>setStep(3)} className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
            </div>
          </motion.div>
        )}

        {step===3 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <button onClick={()=>setStep(2)} className="flex items-center gap-2 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"><ArrowLeft className="h-4 w-4"/>Back</button>
            <h2 className="font-display text-2xl font-bold mb-6">Your Details & Payment</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 mb-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Full Name *</label>
                  <input required value={sel.name} onChange={e=>setSel({...sel,name:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="Ramesh Kumar"/></div>
                <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Phone Number *</label>
                  <input required value={sel.phone} onChange={e=>setSel({...sel,phone:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="+91 98765 43210"/></div>
              </div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Email Address *</label>
                <input required type="email" value={sel.email} onChange={e=>setSel({...sel,email:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="ramesh@email.com"/></div>
            </div>
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 mb-5">
              <p className="font-bold uppercase tracking-wider text-sm mb-3">Booking Summary</p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Facility</span><span className="text-foreground font-semibold">{facility?.name}</span></div>
                <div className="flex justify-between"><span>Date</span><span className="text-foreground font-semibold">{sel.date}</span></div>
                <div className="flex justify-between"><span>Time</span><span className="text-foreground font-semibold">{sel.slot}</span></div>
                <div className="flex justify-between"><span>Duration</span><span className="text-foreground font-semibold">{sel.duration}hr</span></div>
                <div className="flex justify-between border-t border-border/50 pt-2 mt-2"><span className="font-bold text-foreground">Total</span><span className="font-display font-bold text-secondary text-lg">₹{total.toLocaleString()}</span></div>
              </div>
            </div>
            {serverError && <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-4">{serverError}</p>}
            <button disabled={!sel.name||!sel.phone||!sel.email||submitting} onClick={pay}
              className="w-full bg-secondary text-secondary-foreground font-bold uppercase py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.25)] text-base disabled:opacity-40 flex items-center justify-center gap-3">
              <ShieldCheck className="h-5 w-5"/>
              {submitting ? "Opening Payment..." : `Pay ₹${total.toLocaleString()} via UPI`}
            </button>
            <p className="text-center text-muted-foreground text-xs mt-3">Secure UPI payment · PhonePe · GPay · Paytm · 0% extra charges · Confirmation email sent instantly</p>
          </motion.div>
        )}
      </div>
      <Footer />

      {/* Slot already booked popup */}
      <AnimatePresence>
        {slotPopup && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
            onClick={()=>setSlotPopup("")}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              className="bg-card border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center"
              onClick={e=>e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-7 w-7 text-red-400"/>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Slot Already Booked</h3>
              <p className="text-muted-foreground text-sm mb-1">The <strong className="text-foreground">{slotPopup}</strong> slot is already taken for this facility on this date.</p>
              <p className="text-muted-foreground text-sm mb-6">Please select a different time slot.</p>
              <button onClick={()=>setSlotPopup("")}
                className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-xl hover:bg-secondary/90 transition-all">
                Choose Another Slot
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
