import { useState, useEffect } from "react";
import {
  Users, Phone, MessageCircle, ChevronRight, X, Plus,
  Clock, CheckCircle, XCircle, TrendingUp, Calendar,
  ArrowRight, Save, AlertCircle, BarChart3
} from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

const STAGES = [
  { id: "new",             label: "New Enquiry",      color: "border-blue-500/40 bg-blue-500/5",    dot: "bg-blue-400",    text: "text-blue-400" },
  { id: "contacted",       label: "Contacted",        color: "border-yellow-500/40 bg-yellow-500/5", dot: "bg-yellow-400", text: "text-yellow-400" },
  { id: "trial_scheduled", label: "Trial Scheduled",  color: "border-orange-500/40 bg-orange-500/5", dot: "bg-orange-400", text: "text-orange-400" },
  { id: "converted",       label: "Joined ✓",         color: "border-green-500/40 bg-green-500/5",  dot: "bg-green-400",   text: "text-green-400" },
  { id: "rejected",        label: "Not Interested",   color: "border-red-500/40 bg-red-500/5",      dot: "bg-red-400",     text: "text-red-400" },
];

const NEXT_STAGE: Record<string, string> = {
  new: "contacted",
  contacted: "trial_scheduled",
  trial_scheduled: "converted",
};

type Lead = {
  id: number; name: string; phone: string; email: string | null;
  childName: string; ageGroup: string; source: string | null;
  message: string | null; status: string; createdAt: string;
};

type FollowUp = { id: number; inquiryId: number; notes: string; nextFollowUpDate: string | null; createdBy: string; createdAt: string };

const inp = "w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500";
const lbl = "block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5";

// ─── Analytics Panel ─────────────────────────────────────────────────
function Analytics({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const byStage = STAGES.map(s => ({ ...s, count: leads.filter(l => l.status === s.id).length }));
  const convRate = total > 0 ? Math.round((leads.filter(l => l.status === "converted").length / total) * 100) : 0;

  const bySource = leads.reduce<Record<string, number>>((acc, l) => {
    const s = l.source || "Unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const byAge = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.ageGroup] = (acc[l.ageGroup] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-gray-400 mt-1">Total Leads</p>
        </div>
        <div className="bg-[#0a0f1e] border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{convRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Conversion Rate</p>
        </div>
        <div className="bg-[#0a0f1e] border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{leads.filter(l => l.status === "new").length}</p>
          <p className="text-xs text-gray-400 mt-1">New (Unworked)</p>
        </div>
        <div className="bg-[#0a0f1e] border border-orange-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{leads.filter(l => l.status === "trial_scheduled").length}</p>
          <p className="text-xs text-gray-400 mt-1">Trials Pending</p>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Pipeline</h3>
        <div className="space-y-3">
          {byStage.map(s => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <span className="text-sm text-gray-300 w-36">{s.label}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${s.dot}`} style={{ width: total > 0 ? `${(s.count / total) * 100}%` : "0%" }} />
              </div>
              <span className="text-sm font-bold text-white w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Source breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">By Source</h3>
          {Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([src, cnt]) => (
            <div key={src} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0">
              <span className="text-sm text-gray-300">{src}</span>
              <span className="font-bold text-white text-sm">{cnt}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">By Age Group</h3>
          {Object.entries(byAge).sort((a, b) => b[1] - a[1]).map(([age, cnt]) => (
            <div key={age} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0">
              <span className="text-sm text-gray-300">{age}</span>
              <span className="font-bold text-white text-sm">{cnt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Lead Detail Drawer ───────────────────────────────────────────────
function LeadDrawer({ lead, onClose, onUpdate }: { lead: Lead; onClose: () => void; onUpdate: () => void }) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [form, setForm] = useState({ notes: "", nextFollowUpDate: "", createdBy: localStorage.getItem("crmUser") || "" });
  const [saving, setSaving] = useState(false);
  const stage = STAGES.find(s => s.id === lead.status);
  const nextStageId = NEXT_STAGE[lead.status];
  const nextStage = STAGES.find(s => s.id === nextStageId);

  const loadFollowUps = () =>
    fetch(`/api/follow-ups?inquiryId=${lead.id}`)
      .then(r => r.json())
      .then(d => setFollowUps(Array.isArray(d) ? d.map((x: any) => x.followUp) : []));

  useEffect(() => { loadFollowUps(); }, [lead.id]);

  const addFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.notes.trim()) return;
    setSaving(true);
    if (form.createdBy) localStorage.setItem("crmUser", form.createdBy);
    await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inquiryId: lead.id, ...form, nextFollowUpDate: form.nextFollowUpDate || null }),
    });
    setForm(f => ({ ...f, notes: "", nextFollowUpDate: "" }));
    setSaving(false);
    loadFollowUps();
  };

  const moveStage = async (status: string) => {
    await fetch("/api/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status }),
    });
    onUpdate();
    onClose();
  };

  const whatsappUrl = `https://wa.me/91${lead.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi, I'm from PIR Cricket Academy. Thank you for your interest for ${lead.childName} (${lead.ageGroup}). Can we schedule a trial session?`)}`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-[#0d1529] h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#0d1529] border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">{lead.name}</h2>
            <p className="text-xs text-gray-400">Lead #{lead.id} · {new Date(lead.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${stage?.color} ${stage?.text}`}>
            <div className={`w-2 h-2 rounded-full ${stage?.dot}`} />
            {stage?.label}
          </div>

          {/* Child info */}
          <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-gray-500">Child</span><span className="text-sm text-white font-bold">{lead.childName}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">Age Group</span><span className="text-sm text-white">{lead.ageGroup}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">Parent</span><span className="text-sm text-white">{lead.name}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">Phone</span><span className="text-sm text-yellow-400 font-bold">{lead.phone}</span></div>
            {lead.source && <div className="flex justify-between"><span className="text-xs text-gray-500">Source</span><span className="text-sm text-white">{lead.source}</span></div>}
            {lead.message && <div className="pt-2 border-t border-gray-800"><p className="text-xs text-gray-500 mb-1">Message</p><p className="text-sm text-gray-300">{lead.message}</p></div>}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <a href={`tel:${lead.phone}`} className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold py-3 rounded-xl text-sm hover:bg-blue-500/20">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-3 rounded-xl text-sm hover:bg-green-500/20">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {/* Move stage */}
          {lead.status !== "converted" && lead.status !== "rejected" && (
            <div className="space-y-2">
              {nextStage && (
                <button onClick={() => moveStage(nextStage.id)} className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-3 rounded-xl text-sm hover:bg-yellow-400">
                  Move to {nextStage.label} <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                {lead.status !== "converted" && <button onClick={() => moveStage("converted")} className="flex items-center justify-center gap-1 bg-green-500/10 border border-green-500/30 text-green-400 py-2 rounded-xl text-xs font-bold hover:bg-green-500/20"><CheckCircle className="h-3.5 w-3.5" /> Mark Joined</button>}
                <button onClick={() => moveStage("rejected")} className="flex items-center justify-center gap-1 bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded-xl text-xs font-bold hover:bg-red-500/20"><XCircle className="h-3.5 w-3.5" /> Not Interested</button>
              </div>
            </div>
          )}

          {/* Follow-up log */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Follow-up Log</h3>
            <form onSubmit={addFollowUp} className="space-y-3 mb-4">
              <div>
                <label className={lbl}>Your Name</label>
                <input className={inp} value={form.createdBy} onChange={e => setForm({ ...form, createdBy: e.target.value })} placeholder="Pankaj Mishra" />
              </div>
              <div>
                <label className={lbl}>Notes *</label>
                <textarea required rows={2} className={inp} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Called, parent interested. Will visit Saturday..." />
              </div>
              <div>
                <label className={lbl}>Next Follow-up Date</label>
                <input type="date" className={inp} min={TODAY} value={form.nextFollowUpDate} onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })} />
              </div>
              <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-[#0a0f1e] border border-yellow-500/30 text-yellow-400 font-bold py-2.5 rounded-xl text-sm hover:border-yellow-500/60 disabled:opacity-60">
                <Save className="h-4 w-4" />{saving ? "Saving..." : "Log Follow-up"}
              </button>
            </form>

            {followUps.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-3">No follow-ups logged yet.</p>
            ) : (
              <div className="space-y-2">
                {followUps.map(f => (
                  <div key={f.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-gray-400">{f.createdBy}</span>
                      <span className="text-xs text-gray-600">{new Date(f.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    <p className="text-sm text-gray-300">{f.notes}</p>
                    {f.nextFollowUpDate && (
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400">Next: {f.nextFollowUpDate}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline View ────────────────────────────────────────────────────
function Pipeline({ leads, onSelect }: { leads: Lead[]; onSelect: (l: Lead) => void }) {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
      {STAGES.map(stage => {
        const stageLeads = leads.filter(l => l.status === stage.id);
        return (
          <div key={stage.id} className={`border rounded-2xl p-3 ${stage.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${stage.text}`}>{stage.label}</span>
              </div>
              <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded-full text-white">{stageLeads.length}</span>
            </div>
            <div className="space-y-2">
              {stageLeads.map(lead => (
                <button key={lead.id} onClick={() => onSelect(lead)}
                  className="w-full text-left bg-[#0d1529] border border-gray-800 rounded-xl p-3 hover:border-yellow-500/30 transition-colors group">
                  <p className="font-bold text-white text-sm mb-0.5">{lead.childName}</p>
                  <p className="text-xs text-gray-400">{lead.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">{lead.ageGroup}</span>
                    <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-yellow-400 transition-colors" />
                  </div>
                </button>
              ))}
              {stageLeads.length === 0 && (
                <div className="text-center py-4 text-gray-700 text-xs">Empty</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Due Follow-ups Alert ─────────────────────────────────────────────
function DueFollowUps({ leads }: { leads: Lead[] }) {
  const [due, setDue] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/follow-ups")
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const today = TODAY;
        const overdue = data.filter((d: any) => d.followUp?.nextFollowUpDate && d.followUp.nextFollowUpDate <= today);
        setDue(overdue);
      });
  }, [leads]);

  if (due.length === 0) return null;

  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-orange-400" />
        <p className="font-bold text-orange-400">{due.length} Follow-up{due.length > 1 ? "s" : ""} Due Today</p>
      </div>
      <div className="space-y-1">
        {due.slice(0, 3).map((d: any) => (
          <p key={d.followUp.id} className="text-sm text-gray-300">
            <span className="font-bold text-white">{d.inquiry?.name}</span> — {d.followUp.notes?.slice(0, 60)}...
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Main CRM Page ────────────────────────────────────────────────────
export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [view, setView] = useState<"pipeline" | "list" | "analytics">("pipeline");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await fetch("/api/inquiries").then(r => r.json());
    setLeads(Array.isArray(data) ? data.reverse() : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = leads.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.childName.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    l.ageGroup.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-6">
      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} onUpdate={load} />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">Lead CRM</h1>
              <p className="text-gray-400 text-sm">{leads.length} total enquiries</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["pipeline", "list", "analytics"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${view === v ? "bg-yellow-500 text-black" : "bg-[#0d1529] border border-gray-800 text-gray-400 hover:text-white"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <DueFollowUps leads={leads} />

        {/* Search */}
        {view !== "analytics" && (
          <input className="w-full bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 mb-6"
            placeholder="Search by name, phone, age group..." value={search} onChange={e => setSearch(e.target.value)} />
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading leads...</div>
        ) : view === "pipeline" ? (
          <Pipeline leads={filtered} onSelect={setSelected} />
        ) : view === "analytics" ? (
          <Analytics leads={leads} />
        ) : (
          /* List view */
          <div className="space-y-2">
            {filtered.map(lead => {
              const stage = STAGES.find(s => s.id === lead.status);
              return (
                <button key={lead.id} onClick={() => setSelected(lead)}
                  className="w-full text-left bg-[#0d1529] border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm shrink-0">
                      {lead.childName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white">{lead.childName} <span className="text-gray-500 font-normal text-sm">({lead.name})</span></p>
                      <p className="text-xs text-gray-400">{lead.phone} · {lead.ageGroup} · {lead.source || "Unknown source"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${stage?.color} ${stage?.text}`}>{stage?.label}</span>
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-yellow-400" />
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No leads found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
