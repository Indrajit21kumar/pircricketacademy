import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

const AGE_GROUPS = ["U8 (Under 8)", "U10 (Under 10)", "U12 (Under 12)", "U14 (Under 14)", "U16 (Under 16)", "U19 (Under 19)", "Elite", "Not sure — need assessment"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const DRESS_SIZES = [
  { value: "20", label: "Size 20 (Age 5–6)" },
  { value: "22", label: "Size 22 (Age 7–8)" },
  { value: "24", label: "Size 24 (Age 9–10)" },
  { value: "26", label: "Size 26 (Age 11–12)" },
  { value: "28", label: "Size 28 (Age 13–14)" },
  { value: "30", label: "Size 30 / XS Adult" },
  { value: "32", label: "Size 32 / S Adult" },
  { value: "34", label: "Size 34 / M Adult" },
  { value: "36", label: "Size 36 / L Adult" },
  { value: "38", label: "Size 38 / XL Adult" },
  { value: "40", label: "Size 40 / XXL Adult" },
  { value: "42", label: "Size 42 / XXXL Adult" },
];

const PACKAGES = [
  { months: null,  label: "Registration Only (no monthly package)" },
  { months: 3,     label: "3-Month Pack  (10% tuition discount)" },
  { months: 6,     label: "6-Month Pack  (15% tuition discount)" },
  { months: 12,    label: "12-Month Pack (20% tuition discount)" },
];

type DiscountType = { id: number; name: string; percentage: number; description: string; requiredDocument: string; isActive: boolean; };

type Form = {
  studentName: string; dob: string; ageGroup: string; school: string; dressSize: string;
  bloodGroup: string; parentName: string; phone: string; email: string;
  address: string; emergencyName: string; emergencyPhone: string;
  asthma: string; allergies: string; medicalNotes: string;
  packageMonths: number | null; isTrial: boolean;
};

const EMPTY: Form = {
  studentName: "", dob: "", ageGroup: "", school: "", dressSize: "",
  bloodGroup: "", parentName: "", phone: "", email: "",
  address: "", emergencyName: "", emergencyPhone: "",
  asthma: "no", allergies: "", medicalNotes: "",
  packageMonths: null, isTrial: false,
};

export default function AdmissionFormPrint() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const f = (k: keyof Form, v: any) => setForm(p => ({ ...p, [k]: v }));

  // Fetch live discount types from API (same source as online form)
  useEffect(() => {
    fetch("/api/discount-types")
      .then(r => r.json())
      .then((data: { discounts?: DiscountType[] } | DiscountType[]) => {
        const list = Array.isArray(data) ? data : (data.discounts ?? []);
        setDiscountTypes(list.filter((d: DiscountType) => d.isActive));
      })
      .catch(() => {});
  }, []);

  // Regenerate QR whenever form changes (only if at least name + phone filled)
  useEffect(() => {
    const hasMinimum = form.studentName.trim() && form.phone.trim();
    if (!hasMinimum) { setQrDataUrl(""); return; }
    const payload = JSON.stringify({
      v: 1,
      sn: form.studentName,
      dob: form.dob,
      ag: form.ageGroup,
      sch: form.school,
      bg: form.bloodGroup,
      pn: form.parentName,
      ph: form.phone,
      em: form.email,
      addr: form.address,
      en: form.emergencyName,
      ep: form.emergencyPhone,
      ast: form.asthma === "yes",
      alg: form.allergies,
      med: form.medicalNotes,
      pkg: form.packageMonths,
      tr: form.isTrial,
      ds: form.dressSize,
    });
    QRCode.toDataURL(payload, { width: 200, margin: 1, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [form]);

  return (
    <>
      {/* ── Screen-only header ── */}
      <div className="print:hidden bg-[#0a0f1e] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div>
          <h1 className="font-bold text-lg">Offline Admission Form</h1>
          <p className="text-xs text-gray-400">Print blank → fill by hand → submit at reception</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-yellow-500 text-black font-bold px-5 py-2 rounded-xl text-sm hover:bg-yellow-400 transition-colors"
        >
          🖨️ Print Blank Form
        </button>
      </div>

      {/* ── Screen-only tip banner ── */}
      <div className="print:hidden bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 text-center">
        <p className="text-yellow-300 text-sm font-semibold">📋 How to use this form</p>
        <p className="text-yellow-200/70 text-xs mt-0.5">
          Click <strong>"🖨️ Print Blank Form"</strong> above → fill with a pen → bring to academy → reception staff will enter it into the system
        </p>
        <p className="text-gray-500 text-xs mt-1 italic">You can also fill it digitally first if you prefer — the form will auto-generate a QR code once name + phone are filled</p>
      </div>

      {/* ── Printable form ── */}
      <div
        id="print-form"
        className="max-w-2xl mx-auto p-8 print:p-0 print:max-w-none font-sans text-gray-900 bg-white print:bg-white rounded-2xl shadow-lg my-6 print:my-0 print:shadow-none"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* ── Header ── */}
        <div className="rounded-xl overflow-hidden mb-6 print:mb-4 print:rounded-none border border-gray-200 print:border-0">
          {/* Gold top rule */}
          <div className="h-1" style={{ background: "#eab308" }} />

          {/* Main header */}
          <div className="flex items-center gap-5 px-6 py-5" style={{ background: "#0d1526" }}>
            {/* PIR logo */}
            <img src="/images/pir-logo-400.png" alt="PIR Cricket Academy" className="h-16 w-16 object-contain shrink-0" />

            {/* Academy name + address */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-black tracking-wide text-white leading-tight uppercase">PIR Cricket Academy</h1>
              <p className="text-yellow-400 text-[11px] font-semibold tracking-widest mt-0.5">PATNA · BIHAR</p>
              <p className="text-gray-400 text-[10px] mt-1.5 leading-relaxed">
                Sector-A, Police Colony, Anisabad, Patna – 800002<br/>
                +91 89360 61688 &nbsp;·&nbsp; PIRcricketHub@gmail.com
              </p>
            </div>

            {/* Partner logos stacked */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <img src="/images/sp-sports-logo.png" alt="S.P Sports" className="h-9 w-9 object-contain" />
              <div className="h-px w-10 bg-white/20" />
              <img src="/images/savera-logo.png" alt="Savera" className="h-9 w-9 object-contain" />
            </div>
          </div>

          {/* Title bar */}
          <div className="text-center py-2 px-6" style={{ background: "#eab308" }}>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Admission Application Form</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3 mb-5 print:mb-3">
          <span className="text-blue-500 text-lg shrink-0">ℹ</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Instructions:</strong> Fill all sections in BLOCK LETTERS using a black/blue pen. Tick all 5 consent boxes in Section 5. Attach supporting documents if claiming a discount. Bring this completed form to the academy along with the <strong>registration fee of ₹5,000</strong>. For queries call <strong>+91 89360 61688</strong>.
          </p>
        </div>

        {/* ── Section 1: Student ── matches online Step 1 ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-white px-3 py-2 rounded mb-3 print:mb-2" style={{ background: "#0a0f1e", borderLeft: "4px solid #eab308" }}>
            Section 1 — Student Information
          </h2>
          <div className="grid grid-cols-2 gap-4 print:gap-3">
            <div className="col-span-2">
              <Label>Full Name of Student *</Label>
              <Input value={form.studentName} onChange={e => f("studentName", e.target.value)} placeholder="As per school records" />
            </div>
            <div>
              <Label>Date of Birth *</Label>
              <Input required type="date" value={form.dob} onChange={e => f("dob", e.target.value)} />
            </div>
            <div>
              <Label>Age Group *</Label>
              <Select value={form.ageGroup} onChange={e => f("ageGroup", e.target.value)}>
                <option value="">Select</option>
                {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
            <div>
              <Label>School / College</Label>
              <Input value={form.school} onChange={e => f("school", e.target.value)} placeholder="Current school name" />
            </div>
            <div>
              <Label>Dress Size * <span className="font-normal normal-case tracking-normal text-gray-400">(academy kit ₹2,000)</span></Label>
              <Select value={form.dressSize} onChange={e => f("dressSize", e.target.value)}>
                <option value="">Select size</option>
                {DRESS_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Student Address *</Label>
              <Input value={form.address} onChange={e => f("address", e.target.value)} placeholder="House No., Street, Area, Patna, Bihar" />
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 print:bg-transparent">
                <input type="checkbox" className="w-4 h-4 accent-yellow-500 shrink-0 print:hidden"
                  checked={form.isTrial} onChange={e => f("isTrial", e.target.checked)} />
                <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-600 rounded-sm shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-700">Request a Trial Session first</p>
                  <p className="text-[10px] text-gray-500">Tick this if the student wants to attend one free trial class before formal joining</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Parent / Guardian ── matches online Step 2 ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-white px-3 py-2 rounded mb-3 print:mb-2" style={{ background: "#0a0f1e", borderLeft: "4px solid #eab308" }}>
            Section 2 — Parent / Guardian Details
          </h2>
          <div className="grid grid-cols-2 gap-4 print:gap-3">
            <div className="col-span-2">
              <Label>Parent / Guardian Name *</Label>
              <Input value={form.parentName} onChange={e => f("parentName", e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <Label>Mobile Number *</Label>
              <Input type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <Label>Email Address <span className="font-normal normal-case tracking-normal text-gray-400">(optional)</span></Label>
              <Input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="parent@example.com" />
            </div>
          </div>
        </section>

        {/* ── Section 3: Emergency Contact ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-white px-3 py-2 rounded mb-3 print:mb-2" style={{ background: "#0a0f1e", borderLeft: "4px solid #eab308" }}>
            Section 3 — Emergency Contact
          </h2>
          <div className="grid grid-cols-2 gap-4 print:gap-3">
            <div>
              <Label>Emergency Contact Name *</Label>
              <Input value={form.emergencyName} onChange={e => f("emergencyName", e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <Label>Emergency Contact Number *</Label>
              <Input type="tel" value={form.emergencyPhone} onChange={e => f("emergencyPhone", e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
        </section>

        {/* ── Section 4: Medical ── matches online Step 2 Medical ── */}
        <section className="mb-6 print:mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-white px-3 py-2 rounded mb-3 print:mb-2" style={{ background: "#0a0f1e", borderLeft: "4px solid #eab308" }}>
            Section 4 — Medical Information
          </h2>
          <div className="grid grid-cols-2 gap-4 print:gap-3">
            <div>
              <Label>Blood Group</Label>
              <Select value={form.bloodGroup} onChange={e => f("bloodGroup", e.target.value)}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
            <div>
              <Label>Known Allergies</Label>
              <Input value={form.allergies} onChange={e => f("allergies", e.target.value)} placeholder="e.g. peanuts, dust (or None)" />
            </div>
            <div>
              <Label>Does student have Asthma?</Label>
              {/* Screen: radio buttons */}
              <div className="print:hidden flex gap-6 mt-1.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
                  <input type="radio" name="asthma" value="no" checked={form.asthma === "no"} onChange={() => f("asthma", "no")} className="accent-yellow-500" /> No
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
                  <input type="radio" name="asthma" value="yes" checked={form.asthma === "yes"} onChange={() => f("asthma", "yes")} className="accent-yellow-500" /> Yes
                </label>
              </div>
              {/* Print: tick-box row */}
              <div className="hidden print:flex items-center gap-6 border border-gray-300 rounded px-3 py-2 mt-1">
                <span className="flex items-center gap-1.5 text-sm"><span className="inline-block w-4 h-4 border border-gray-600 rounded-sm mr-1" /> No</span>
                <span className="flex items-center gap-1.5 text-sm"><span className="inline-block w-4 h-4 border border-gray-600 rounded-sm mr-1" /> Yes</span>
              </div>
            </div>
            <div className="col-span-2">
              <Label>Other Medical Conditions</Label>
              <textarea
                value={form.medicalNotes}
                onChange={e => f("medicalNotes", e.target.value)}
                rows={2}
                placeholder="Any other health conditions the coach should know"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 bg-white text-gray-900 print:border-gray-400 print:bg-transparent resize-none"
              />
            </div>
          </div>
        </section>

        {/* ── Section 5: Consent & Declaration ── matches online Step 3 ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-white px-3 py-2 rounded mb-3 print:mb-2" style={{ background: "#0a0f1e", borderLeft: "4px solid #eab308" }}>
            Section 5 — Consent & Declarations <span className="font-normal normal-case">(all 5 required — please tick each box)</span>
          </h2>
          <div className="space-y-2.5">
            {[
              { label: "Medical Declaration", text: "I confirm the medical information provided above is accurate and complete." },
              { label: "Photography / Video Consent", text: "I consent to my child's image being used in academy media, reports, and promotional material." },
              { label: "Liability Waiver", text: "I acknowledge cricket involves physical risk and PIR Cricket Academy is not liable for injuries sustained during normal training." },
              { label: "Academy Terms", text: "I agree to PIR Cricket Academy's rules, fee policy, and code of conduct." },
              { label: "Data Storage", text: "I acknowledge that performance data, attendance records, photos, and videos may be stored digitally by PIR Cricket Academy for player development purposes." },
            ].map(({ label, text }) => (
              <div key={label} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 print:bg-transparent">
                {/* Screen: real checkbox */}
                <input type="checkbox" className="w-4 h-4 mt-0.5 accent-yellow-500 shrink-0 print:hidden" />
                {/* Print: empty box */}
                <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-600 rounded-sm shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 6: Package Selection ── matches online Step 5 ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-white px-3 py-2 rounded mb-3 print:mb-2" style={{ background: "#0a0f1e", borderLeft: "4px solid #eab308" }}>
            Section 6 — Package Selection <span className="font-normal normal-case">(tick one — monthly fee ₹3,500/month)</span>
          </h2>
          <div className="grid grid-cols-2 gap-2.5 mb-2">
            {PACKAGES.map(pkg => (
              <div key={String(pkg.months)} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg p-2.5 print:bg-transparent">
                {/* Screen */}
                <input type="radio" name="package" className="w-4 h-4 accent-yellow-500 shrink-0 print:hidden"
                  checked={form.packageMonths === pkg.months}
                  onChange={() => f("packageMonths", pkg.months)} />
                {/* Print */}
                <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-600 rounded-full shrink-0" />
                <p className="text-xs font-semibold text-gray-700">{pkg.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 bg-blue-50 border border-blue-200 rounded p-2 print:bg-transparent">
            Package discounts apply to monthly tuition only. Registration fee (₹5,000) is separate and non-discountable.
          </p>
        </section>

        {/* ── Section 7: Discount Eligibility ── live from admin Discounts tab ── */}
        <section className="mb-6 print:mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-white px-3 py-2 rounded mb-3 print:mb-2" style={{ background: "#0a0f1e", borderLeft: "4px solid #eab308" }}>
            Section 7 — Discount Eligibility <span className="font-normal normal-case">(optional — tick if applicable)</span>
          </h2>
          {discountTypes.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No eligibility discounts currently available. Check pircricketacademy.co.in for latest options.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {discountTypes.map(d => (
                <div key={d.id} className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-lg p-2.5 print:bg-transparent">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 accent-yellow-500 shrink-0 print:hidden" />
                  <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-600 rounded-sm shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-700">{d.name} <span className="font-normal text-yellow-600">({d.percentage}% off)</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{d.description}</p>
                    {d.requiredDocument && <p className="text-[10px] text-gray-500 mt-0.5">Bring: {d.requiredDocument}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-2 print:bg-transparent">
            <strong>Note:</strong> Eligibility discounts apply to monthly tuition only. All documents will be verified by admin — false documents result in permanent cancellation of discount.
          </p>
        </section>

        {/* ── QR + Signature row ── */}
        <div className="flex gap-6 items-start border-t-2 border-gray-200 pt-5 print:pt-4">
          {/* QR code */}
          <div className="shrink-0 text-center">
            {qrDataUrl ? (
              <>
                <img src={qrDataUrl} alt="Form QR" className="w-32 h-32 border-2 border-gray-800 rounded" />
                <p className="text-[10px] text-gray-500 mt-1 w-32 leading-tight">Staff scans this to register instantly</p>
              </>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center">
                <p className="text-[10px] text-gray-400 text-center px-1 leading-tight print:hidden">Fill Name + Phone to generate QR</p>
                <div className="hidden print:flex w-full h-full items-center justify-center">
                  <p className="text-[10px] text-gray-400 text-center">For office use</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Signature */}
          <div className="flex-1">
            <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
              I confirm all information above is true and I have ticked all consent boxes above in full understanding of their meaning.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="border-b border-gray-400 h-10 mb-1" />
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Parent / Guardian Signature</p>
              </div>
              <div>
                <div className="border-b border-gray-400 h-10 mb-1" />
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 print:mt-4 rounded-xl overflow-hidden print:rounded-none" style={{ background: "#0a0f1e" }}>
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#eab308,#ca8a04,#eab308)" }} />
          <div className="flex items-center justify-between px-5 py-3">
            <img src="/images/sp-sports-logo.png" alt="" className="h-8 w-8 object-contain opacity-70" />
            <div className="text-center">
              <p className="text-[10px] text-gray-300 font-semibold">PIR Cricket Academy · pircricketacademy.co.in · +91 89360 61688</p>
              <p className="text-[9px] text-gray-500 mt-0.5">Under the Aegis of S.P Sports & Cultural Foundation · Powered by Savera Cancer Hospital</p>
            </div>
            <img src="/images/savera-logo.png" alt="" className="h-8 w-8 object-contain opacity-70" />
          </div>
        </div>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body { margin: 0; background: white; }
          @page { size: A4; margin: 10mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{children}</label>;
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 bg-white print:border-gray-400 print:bg-transparent ${className}`}
    />
  );
}

function Select({ children, className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 bg-white print:border-gray-400 ${className}`}
    >
      {children}
    </select>
  );
}
