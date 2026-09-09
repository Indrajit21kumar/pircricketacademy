import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

type Step = "lookup" | "confirm" | "done";

interface BookingInfo {
  id: number;
  ref: string;
  facilityName: string;
  date: string;
  slot: string;
  name: string;
  total: number;
  status: string;
  refundAmount: number;
}

export default function CancelBooking() {
  const [step, setStep] = useState<Step>("lookup");
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    if (!ref.trim() || !phone.trim()) { setError("Please enter both booking reference and phone number."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/bookings/lookup?ref=${encodeURIComponent(ref.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Booking not found."); setLoading(false); return; }
      setBooking(data);
      setStep("confirm");
    } catch {
      setError("Network error. Please try again.");
    } finally { setLoading(false); }
  }

  async function confirmCancel() {
    if (!booking) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Cancellation failed."); setLoading(false); return; }
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-secondary">PIR Cricket Academy</Link>
          <Link href="/booking" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to Booking</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

          {step === "lookup" && (
            <div className="bg-card border border-border rounded-2xl p-8">
              <h1 className="font-display text-2xl font-bold mb-1">Cancel Booking</h1>
              <p className="text-muted-foreground text-sm mb-6">Enter your booking reference and phone number to look up your booking.</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Booking Reference *</label>
                  <input
                    value={ref}
                    onChange={e => setRef(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-secondary"
                    placeholder="e.g. PIR-BOX-20250120-ABC123"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Phone Number *</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    type="tel"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary"
                    placeholder="Mobile number used at booking"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button
                onClick={lookup}
                disabled={loading}
                className="w-full bg-secondary text-black font-bold py-3 rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >{loading ? "Looking up…" : "Find My Booking"}</button>

              <div className="mt-6 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                <p className="text-xs text-orange-400 font-semibold mb-1">Cancellation Policy</p>
                <p className="text-xs text-muted-foreground">• Cancellations must be made at least <strong className="text-foreground">24 hours before</strong> your slot.</p>
                <p className="text-xs text-muted-foreground mt-1">• A <strong className="text-foreground">10% cancellation fee</strong> is deducted; 90% is refunded within 2–3 business days.</p>
                <p className="text-xs text-muted-foreground mt-1">• Cash bookings are refunded in cash at the academy. Online payments are refunded to the original payment method.</p>
              </div>
            </div>
          )}

          {step === "confirm" && booking && (
            <div className="bg-card border border-border rounded-2xl p-8">
              <h1 className="font-display text-2xl font-bold mb-1">Confirm Cancellation</h1>
              <p className="text-muted-foreground text-sm mb-6">Please review your booking details before cancelling.</p>

              <div className="bg-background border border-border rounded-xl overflow-hidden mb-6">
                {[
                  ["Booking Ref", booking.ref],
                  ["Facility", booking.facilityName],
                  ["Date", booking.date],
                  ["Time", booking.slot],
                  ["Amount Paid", `₹${booking.total.toLocaleString()}`],
                  ["Refund Amount", `₹${booking.refundAmount.toLocaleString()} (after 10% deduction)`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className={`text-sm font-semibold ${label === "Refund Amount" ? "text-green-400" : "text-foreground"}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 font-semibold">Are you sure you want to cancel?</p>
                <p className="text-xs text-muted-foreground mt-1">This action cannot be undone. Your refund of <strong className="text-foreground">₹{booking.refundAmount.toLocaleString()}</strong> will be processed within 2–3 business days.</p>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={confirmCancel}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
                >{loading ? "Processing…" : "Yes, Cancel Booking"}</button>
                <button
                  onClick={() => { setStep("lookup"); setError(""); }}
                  className="flex-1 border border-border rounded-xl py-3 font-semibold text-sm hover:bg-muted/30 transition-colors"
                >Go Back</button>
              </div>
            </div>
          )}

          {step === "done" && booking && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
              <h1 className="font-display text-2xl font-bold mb-2">Cancellation Requested</h1>
              <p className="text-muted-foreground text-sm mb-6">Your cancellation request for <strong className="text-foreground">{booking.ref}</strong> has been received.</p>

              <div className="bg-background border border-border rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-1">Refund Amount</p>
                <p className="text-2xl font-bold font-display text-green-400">₹{booking.refundAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Will be processed within 2–3 business days</p>
              </div>

              <p className="text-xs text-muted-foreground mb-6">You will receive a WhatsApp/email confirmation. For any queries, contact us at <strong>+91 89360 61688</strong>.</p>

              <Link href="/" className="inline-block bg-secondary text-black font-bold px-8 py-3 rounded-xl hover:bg-secondary/90 transition-colors">Back to Home</Link>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
