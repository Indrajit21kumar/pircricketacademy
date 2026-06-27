import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Phone, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";

const SLOTS = ["06:00 AM","07:00 AM","08:00 AM","09:00 AM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM"];

type Booking = {
  id: number; ref: string; facility: string; facilityName: string;
  date: string; slot: string; duration: number; rate: number; total: number;
  name: string; phone: string; email?: string; status: string; createdAt: string;
};

const STATUS_CONFIG = {
  confirmed:       { label: "Confirmed",       color: "text-green-400",  bg: "bg-green-500/10  border-green-500/30",  icon: CheckCircle },
  pending_payment: { label: "Pending Payment", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: AlertCircle },
  completed:       { label: "Completed",       color: "text-blue-400",   bg: "bg-blue-500/10   border-blue-500/30",   icon: CheckCircle },
  cancelled:       { label: "Cancelled",       color: "text-red-400",    bg: "bg-red-500/10    border-red-500/30",    icon: XCircle },
};

const FACILITY_COLOR: Record<string, string> = {
  box:    "border-l-secondary",
  turf:   "border-l-green-500",
  cement: "border-l-blue-500",
};

function todayStr() { return new Date().toISOString().split("T")[0]; }

export default function GroundTracker() {
  const [date, setDate] = useState(todayStr());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchBookings = async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?date=${d}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(date); }, [date]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
        body: JSON.stringify({ status }),
      });
      await fetchBookings(date);
    } finally {
      setUpdating(null);
    }
  };

  // Build slot → bookings map
  const slotMap: Record<string, Booking[]> = {};
  SLOTS.forEach(s => { slotMap[s] = []; });
  bookings.forEach(b => {
    // A booking spans multiple slots based on duration
    const startIdx = SLOTS.indexOf(b.slot);
    if (startIdx !== -1) {
      for (let i = 0; i < b.duration && startIdx + i < SLOTS.length; i++) {
        slotMap[SLOTS[startIdx + i]].push(b);
      }
    }
  });

  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const pending = bookings.filter(b => b.status === "pending_payment").length;
  const revenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.total, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Ground Tracker</h1>
          <p className="text-muted-foreground text-sm">Receptionist view — live slot availability</p>
        </div>
        <button onClick={() => fetchBookings(date)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors">
          <RefreshCw className="h-4 w-4"/> Refresh
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Date picker */}
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="h-5 w-5 text-secondary"/>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"/>
          <div className="flex gap-2">
            {[-1,0,1].map(offset => {
              const d = new Date(); d.setDate(d.getDate() + offset);
              const ds = d.toISOString().split("T")[0];
              const label = offset === -1 ? "Yesterday" : offset === 0 ? "Today" : "Tomorrow";
              return (
                <button key={offset} onClick={() => setDate(ds)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${date === ds ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-muted-foreground hover:border-secondary/40"}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{confirmed}</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pending}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending Payment</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-secondary">₹{revenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmed Revenue</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3"/>
            <p className="text-muted-foreground">No bookings for this date</p>
          </div>
        ) : (
          <div className="space-y-2">
            {SLOTS.map(slot => {
              const slotBookings = slotMap[slot].filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i);
              const isOccupied = slotBookings.length > 0;
              return (
                <div key={slot} className={`flex gap-3 ${!isOccupied ? "opacity-40" : ""}`}>
                  <div className="w-20 shrink-0 flex items-start pt-3">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3"/>{slot}
                    </span>
                  </div>
                  <div className="flex-1 min-h-[48px]">
                    {isOccupied ? (
                      <div className="space-y-2">
                        {slotBookings.map(b => {
                          const cfg = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending_payment;
                          const Icon = cfg.icon;
                          return (
                            <motion.div key={b.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                              className={`border ${cfg.bg} border-l-4 ${FACILITY_COLOR[b.facility] || "border-l-secondary"} rounded-lg p-3 flex items-center gap-3`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm">{b.name}</span>
                                  <span className="text-xs text-muted-foreground">{b.facilityName}</span>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <span className="text-xs text-muted-foreground">{b.duration}hr</span>
                                  <span className="text-xs font-bold text-secondary">₹{b.total.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3"/>{b.phone}</span>
                                  <span className="text-xs font-mono text-muted-foreground">{b.ref}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`flex items-center gap-1 text-xs font-bold ${cfg.color}`}>
                                  <Icon className="h-3.5 w-3.5"/>{cfg.label}
                                </span>
                                {b.status === "confirmed" && (
                                  <button onClick={() => updateStatus(b.id, "completed")} disabled={updating === b.id}
                                    className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded px-2 py-1 hover:bg-blue-500/30 transition-colors">
                                    Mark Done
                                  </button>
                                )}
                                {b.status === "pending_payment" && (
                                  <button onClick={() => updateStatus(b.id, "cancelled")} disabled={updating === b.id}
                                    className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded px-2 py-1 hover:bg-red-500/30 transition-colors">
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-10 border border-dashed border-border/30 rounded-lg flex items-center px-3">
                        <span className="text-xs text-muted-foreground">Available</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
