import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  MessageCircle, Plus, Send, Users, FileText,
  Trash2, Copy, CheckCircle, X, History, Eye,
  ChevronDown, ChevronLeft, ExternalLink
} from "lucide-react";

const inp = "w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500";
const lbl = "block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5";

const CATEGORIES = ["all", "welcome", "fees", "attendance", "trial", "general"];
const CAT_COLOR: Record<string, string> = {
  welcome:    "bg-green-500/15 text-green-400",
  fees:       "bg-red-500/15 text-red-400",
  attendance: "bg-blue-500/15 text-blue-400",
  trial:      "bg-yellow-500/15 text-yellow-400",
  general:    "bg-gray-500/15 text-gray-400",
};

const AUDIENCE_OPTIONS = [
  { value: "all",      label: "All Students" },
  { value: "active",   label: "Active Students Only" },
  { value: "trial",    label: "Trial Students Only" },
  { value: "fee_due",  label: "Students with Fee Due" },
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

  const load = () => fetch("/api/templates").then(r => r.json()).then(d => setTemplates(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/templates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", category: "general", content: "", createdBy: form.createdBy });
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
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
function SendTab({ initialTemplate, batches }: { initialTemplate: Template | null; batches: any[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState(initialTemplate?.content || "");
  const [audience, setAudience] = useState("all");
  const [campaignName, setCampaignName] = useState("");
  const [createdBy, setCreatedBy] = useState(localStorage.getItem("crmUser") || "Admin");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialTemplate) { setMessage(initialTemplate.content); setStep(1); }
  }, [initialTemplate]);

  const preview = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const url = `/api/campaigns?preview=1&audience=${encodeURIComponent(audience)}&message=${encodeURIComponent(message)}`;
    const data = await fetch(url).then(r => r.json());
    setRecipients(data.recipients || []);
    setLoading(false);
    setStep(2);
  };

  const markSent = (id: number) => setSent(prev => new Set([...prev, id]));

  const saveCampaign = async () => {
    if (!campaignName) return;
    if (createdBy) localStorage.setItem("crmUser", createdBy);
    await fetch("/api/campaigns", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: campaignName, audience, message, sentCount: sent.size, createdBy }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const audienceLabel = AUDIENCE_OPTIONS.find(a => a.value === audience)?.label
    || batches.find(b => `batch:${b.id}` === audience)?.name
    || audience;

  return (
    <div className="max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-500"}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-8 ${step > s ? "bg-yellow-500" : "bg-gray-800"}`} />}
          </div>
        ))}
        <span className="text-xs text-gray-500 ml-2">{step === 1 ? "Compose" : step === 2 ? "Preview & Send" : "Done"}</span>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className={lbl}>Audience</label>
            <select className={inp} value={audience} onChange={e => setAudience(e.target.value)}>
              {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              {batches.map(b => <option key={b.id} value={`batch:${b.id}`}>Batch: {b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Message</label>
            <p className="text-xs text-gray-600 mb-1.5">Variables: <code className="text-yellow-400">{"{{childName}} {{parentName}} {{batch}} {{date}}"}</code></p>
            <textarea rows={8} className={inp} value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message here..." />
          </div>
          <button onClick={preview} disabled={!message.trim() || loading}
            className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-60">
            <Eye className="h-4 w-4" />{loading ? "Loading..." : "Preview Recipients"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-[#0a0f1e] border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">{recipients.length} recipients</p>
              <p className="text-xs text-gray-400">{audienceLabel} · {sent.size} sent so far</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-gray-300">← Edit</button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {recipients.map(r => (
              <div key={r.studentId} className={`bg-[#0a0f1e] border rounded-xl p-3 flex items-center justify-between gap-3 transition-all ${sent.has(r.studentId) ? "border-green-500/30 opacity-60" : "border-gray-800"}`}>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.parentName} · {r.phone} · {r.batch}</p>
                </div>
                <a href={r.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => markSent(r.studentId)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sent.has(r.studentId) ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-green-600 text-white hover:bg-green-500"}`}>
                  {sent.has(r.studentId) ? <CheckCircle className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                  {sent.has(r.studentId) ? "Sent" : "Send"}
                </a>
              </div>
            ))}
          </div>

          {recipients.length === 0 && (
            <div className="text-center py-8 text-gray-500">No students match this audience.</div>
          )}

          {/* Save campaign */}
          <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-sm font-bold text-gray-400">Save to history</p>
            <div className="flex gap-3">
              <input className={inp} value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Campaign name (e.g. June Fee Reminder)" />
              <input className="bg-[#0a0f1e] border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none w-40 shrink-0" value={createdBy} onChange={e => setCreatedBy(e.target.value)} placeholder="Your name" />
            </div>
            <button onClick={saveCampaign} disabled={!campaignName || saved}
              className="flex items-center gap-2 bg-[#0d1529] border border-yellow-500/30 text-yellow-400 font-bold px-5 py-2.5 rounded-xl text-sm hover:border-yellow-500/60 disabled:opacity-50">
              {saved ? <><CheckCircle className="h-4 w-4 text-green-400" /> Saved!</> : <><History className="h-4 w-4" /> Save Campaign</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────
function HistoryTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns").then(r => r.json()).then(d => {
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
