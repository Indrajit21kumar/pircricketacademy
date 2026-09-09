import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  MessageCircle, Plus, Send, Users, FileText,
  Trash2, Copy, CheckCircle, X, History, Eye,
  ChevronDown, ChevronLeft, ExternalLink
} from "lucide-react";

const inp = "w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500";
const lbl = "block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5";

function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("pir_admin_token");
  return fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

const CATEGORIES = ["all", "welcome", "fees", "attendance", "trial", "general"];
const CAT_COLOR: Record<string, string> = {
  welcome:    "bg-green-500/15 text-green-400",
  fees:       "bg-red-500/15 text-red-400",
  attendance: "bg-blue-500/15 text-blue-400",
  trial:      "bg-yellow-500/15 text-yellow-400",
  general:    "bg-gray-500/15 text-gray-400",
};

const AUDIENCE_OPTIONS = [
  { value: "all",         label: "Everyone (Students + Admission Forms)" },
  { value: "admissions",  label: "Admission Form Submissions (All)" },
  { value: "active",      label: "Enrolled Students — Active" },
  { value: "trial",       label: "Enrolled Students — Trial" },
  { value: "fee_due",     label: "Students with Fee Due" },
];

type Template = { id: number; name: string; category: string; content: string; createdBy: string };
type Recipient = { studentId: number; name: string; parentName: string; phone: string; batch: string; message: string; whatsappUrl: string };
type Campaign  = { campaign: any; template: any };

// ─── Templates Tab ────────────────────────────────────────────────────
function TemplatesTab({ onUse }: { onUse: (t: Template) => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "general", content: "", createdBy: localStorage.getItem("crmUser") || "Admin" });
  const [copied, setCopied] = useState<number | null>(null);

  const load = () => apiFetch("/api/templates").then(r => r.json()).then(d => setTemplates(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch("/api/templates", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", category: "general", content: "", createdBy: form.createdBy });
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    await apiFetch(`/api/templates?id=${id}`, { method: "DELETE" });
    load();
  };

  const copy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = filter === "all" ? templates : templates.filter(t => t.category === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === c ? "bg-yellow-500 text-black" : "bg-[#0a0f1e] border border-gray-800 text-gray-400 hover:text-white"}`}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400">
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0a0f1e] border border-yellow-500/30 rounded-2xl p-5 mb-5">
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Template Name *</label>
                <input required className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Fee Reminder – Monthly" />
              </div>
              <div><label className={lbl}>Category *</label>
                <select className={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {["welcome","fees","attendance","trial","general"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>Message Content *</label>
              <p className="text-xs text-gray-600 mb-2">Variables: <code className="text-yellow-400">{"{{childName}} {{parentName}} {{phone}} {{batch}} {{date}}"}</code></p>
              <textarea required rows={6} className={inp} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Dear {{parentName}}, ..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-yellow-500 text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-400">Save Template</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-700 text-gray-400 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-white text-sm">{t.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${CAT_COLOR[t.category] || CAT_COLOR.general}`}>{t.category}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy(t.content, t.id)} className="p-1.5 text-gray-600 hover:text-yellow-400 transition-colors" title="Copy">
                  {copied === t.id ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button onClick={() => del(t.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex-1 line-clamp-3 whitespace-pre-line mb-3">{t.content}</p>
            <button onClick={() => onUse(t)} className="w-full flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs hover:bg-green-500/20">
              <Send className="h-3.5 w-3.5" /> Use This Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Send Campaign Tab ────────────────────────────────────────────────
const PLACEHOLDER = "Dear {{parentName}},\n\nThis is a message from PIR Cricket Academy regarding {{childName}}.\n\n[Your message here]\n\nRegards,\nPIR Cricket Academy\n+91 89360 61688";

function SendTab({ initialTemplate, batches }: { initialTemplate: Template | null; batches: any[] }) {
  const [message, setMessage] = useState(initialTemplate?.content || "");
  const [audience, setAudience] = useState("all");
  const [filter, setFilter] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [createdBy, setCreatedBy] = useState(localStorage.getItem("crmUser") || "Admin");
  const [allContacts, setAllContacts] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  // Load contacts immediately on mount and whenever audience changes
  const loadContacts = async (aud: string, msg: string) => {
    setLoading(true);
    const safeMsg = msg.trim() || "Hello {{parentName}}";
    const url = `/api/campaigns?preview=1&audience=${encodeURIComponent(aud)}&message=${encodeURIComponent(safeMsg)}`;
    try {
      const data = await apiFetch(url).then(r => r.json());
      setAllContacts(data.recipients || []);
    } catch { setAllContacts([]); }
    setLoading(false);
  };

  useEffect(() => { loadContacts(audience, message); }, [audience]);
  useEffect(() => { if (initialTemplate) setMessage(initialTemplate.content); }, [initialTemplate]);

  const markSent = (id: number) => setSent(prev => new Set([...prev, id]));

  const saveCampaign = async () => {
    if (!campaignName) return;
    if (createdBy) localStorage.setItem("crmUser", createdBy);
    await apiFetch("/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ name: campaignName, audience, message, sentCount: sent.size, createdBy }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Re-resolve WhatsApp URLs whenever message changes
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const resolveMsg = (r: Recipient) => {
    const m = (message.trim() || PLACEHOLDER)
      .replace(/\{\{childName\}\}/g, r.name)
      .replace(/\{\{parentName\}\}/g, r.parentName)
      .replace(/\{\{batch\}\}/g, r.batch)
      .replace(/\{\{date\}\}/g, today);
    const phone10 = r.phone.replace(/\D/g, "").slice(-10);
    return { ...r, message: m, whatsappUrl: `https://wa.me/91${phone10}?text=${encodeURIComponent(m)}` };
  };

  const filtered = allContacts
    .filter(r => !filter || r.name.toLowerCase().includes(filter.toLowerCase()) || r.parentName.toLowerCase().includes(filter.toLowerCase()) || r.phone.includes(filter))
    .map(resolveMsg);

  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* Left: Compose */}
      <div className="space-y-4">
        <div>
          <label className={lbl}>Filter by audience</label>
          <select className={inp} value={audience} onChange={e => setAudience(e.target.value)}>
            {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            {batches.map(b => <option key={b.id} value={`batch:${b.id}`}>Batch: {b.name}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Message</label>
          <p className="text-xs text-gray-600 mb-1.5">Variables: <code className="text-yellow-400">{"{{childName}} {{parentName}} {{batch}} {{date}}"}</code></p>
          <textarea rows={10} className={inp} value={message} onChange={e => setMessage(e.target.value)} placeholder={PLACEHOLDER} />
        </div>
        {/* Save campaign */}
        <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Save to History</p>
          <input className={inp} value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Campaign name (e.g. Practice Reminder Aug)" />
          <div className="flex gap-2">
            <input className="flex-1 bg-[#0a0f1e] border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" value={createdBy} onChange={e => setCreatedBy(e.target.value)} placeholder="Your name" />
            <button onClick={saveCampaign} disabled={!campaignName || saved}
              className="flex items-center gap-2 bg-[#0d1529] border border-yellow-500/30 text-yellow-400 font-bold px-4 py-2.5 rounded-xl text-sm hover:border-yellow-500/60 disabled:opacity-50">
              {saved ? <><CheckCircle className="h-4 w-4 text-green-400" /> Saved!</> : <><History className="h-4 w-4" /> Save</>}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Recipients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white">{loading ? "Loading..." : `${filtered.length} recipients`}</p>
            <p className="text-xs text-gray-500">{sent.size} sent so far</p>
          </div>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search name / phone..." className="bg-[#0a0f1e] border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none w-40" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm gap-2">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            Loading contacts…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-10 w-10 mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 font-bold text-sm">No contacts found</p>
            <p className="text-gray-600 text-xs mt-1">Try "Everyone (Students + Admission Forms)"</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filtered.map(r => (
              <div key={r.studentId} className={`bg-[#0a0f1e] border rounded-xl p-3 flex items-center justify-between gap-3 transition-all ${sent.has(r.studentId) ? "border-green-500/30 opacity-60" : "border-gray-800"}`}>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{r.name}</p>
                  <p className="text-xs text-gray-400 truncate">{r.parentName} · {r.phone}</p>
                  <p className="text-xs text-gray-600">{r.batch}</p>
                </div>
                <a href={r.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => markSent(r.studentId)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${sent.has(r.studentId) ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-green-600 text-white hover:bg-green-500"}`}>
                  {sent.has(r.studentId) ? <CheckCircle className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                  {sent.has(r.studentId) ? "Sent" : "Send"}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}

// ─── History Tab ──────────────────────────────────────────────────────
function HistoryTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/campaigns").then(r => r.json()).then(d => {
      setCampaigns(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const AUDIENCE_MAP: Record<string, string> = {
    all: "All Students", active: "Active Students", trial: "Trial Students", fee_due: "Fee Due",
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Campaign History</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><History className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No campaigns sent yet.</p></div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(({ campaign, template }) => (
            <div key={campaign.id} className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-white">{campaign.name}</p>
                  <p className="text-xs text-gray-400">{new Date(campaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · by {campaign.createdBy}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-400">{campaign.sentCount}</p>
                  <p className="text-xs text-gray-500">sent</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                  {AUDIENCE_MAP[campaign.audience] || campaign.audience}
                </span>
                {template && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{template.name}</span>}
              </div>
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{campaign.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
const TABS = [
  { id: "send",      label: "Send Message", icon: Send },
  { id: "templates", label: "Templates",    icon: FileText },
  { id: "history",   label: "History",      icon: History },
];

export default function CommsPage() {
  const [tab, setTab] = useState("send");
  const [batches, setBatches] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetch("/api/batches").then(r => r.json()).then(d => setBatches(Array.isArray(d) ? d : []));
  }, []);

  const useTemplate = (t: Template) => {
    setActiveTemplate(t);
    setTab("send");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors mb-6"><ChevronLeft className="h-4 w-4" /> Dashboard</Link>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-7 w-7 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">Communication Center</h1>
            <p className="text-gray-400 text-sm">Send WhatsApp messages to parents & students</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-400">WhatsApp Direct Messaging</p>
            <p className="text-xs text-gray-400 mt-0.5">Click Send next to each parent to open WhatsApp with a pre-filled personalised message. No API or extra cost needed.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0d1529] border border-gray-800 rounded-xl p-1 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex-1 justify-center ${tab === id ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="bg-[#0d1529] border border-gray-800 rounded-2xl p-5">
          {tab === "send"      && <SendTab initialTemplate={activeTemplate} batches={batches} />}
          {tab === "templates" && <TemplatesTab onUse={useTemplate} />}
          {tab === "history"   && <HistoryTab />}
        </div>
      </div>
    </div>
  );
}
