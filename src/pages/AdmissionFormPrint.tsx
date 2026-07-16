import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

const AGE_GROUPS = ["U8 (Under 8)", "U10 (Under 10)", "U12 (Under 12)", "U14 (Under 14)", "U16 (Under 16)", "U19 (Under 19)", "Elite (19+)"];
const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−", "Unknown"];

type Form = {
  studentName: string; dob: string; ageGroup: string; school: string;
  bloodGroup: string; parentName: string; phone: string; email: string;
  address: string; emergencyName: string; emergencyPhone: string;
  asthma: string; allergies: string; medicalNotes: string;
};

const EMPTY: Form = {
  studentName: "", dob: "", ageGroup: "", school: "",
  bloodGroup: "", parentName: "", phone: "", email: "",
  address: "", emergencyName: "", emergencyPhone: "",
  asthma: "no", allergies: "", medicalNotes: "",
};

export default function AdmissionFormPrint() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const f = (k: keyof Form, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Regenerate QR whenever form changes (only if at least name + phone filled)
  useEffect(() => {
    const hasMinimum = form.studentName.trim() && form.phone.trim();
    if (!hasMinimum) { setQrDataUrl(""); return; }
    const payload = JSON.stringify({
      v: 1, // version for future compatibility
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
          <p className="text-xs text-gray-400">Fill all fields, then print and bring to the academy</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-yellow-500 text-black font-bold px-5 py-2 rounded-xl text-sm hover:bg-yellow-400 transition-colors"
        >
          Print / Download PDF
        </button>
      </div>

      {/* ── Printable form ── */}
      <div
        id="print-form"
        className="max-w-2xl mx-auto p-6 print:p-0 print:max-w-none font-sans text-gray-900"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center border-b-4 border-yellow-500 pb-4 mb-6 print:mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-1">Under the Aegis of S.P Sports & Cultural Foundation</p>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "#0a0f1e" }}>PIR CRICKET ACADEMY</h1>
          <p className="text-sm text-gray-500 mt-1">Sector-A, Police Colony, Anisabad, Patna – 800002, Bihar</p>
          <p className="text-sm font-bold mt-2 text-yellow-600">ADMISSION APPLICATION FORM</p>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-5 print:mb-3 text-xs text-yellow-800">
          <strong>Instructions:</strong> Fill all fields in BLOCK LETTERS. Bring this completed form to the academy along with the registration fee of ₹5,000. The QR code below will allow staff to instantly register you in our system.
        </div>

        {/* ── Section 1: Student ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider bg-gray-900 text-white px-3 py-1.5 rounded mb-3 print:mb-2">
            Section 1 — Student Information
          </h2>
          <div className="grid grid-cols-2 gap-4 print:gap-3">
            <div className="col-span-2">
              <Label>Full Name of Student *</Label>
              <Input value={form.studentName} onChange={e => f("studentName", e.target.value)} placeholder="As per school records" />
            </div>
            <div>
              <Label>Date of Birth *</Label>
              <Input type="date" value={form.dob} onChange={e => f("dob", e.target.value)} />
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
              <Label>Blood Group</Label>
              <Select value={form.bloodGroup} onChange={e => f("bloodGroup", e.target.value)}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
          </div>
        </section>

        {/* ── Section 2: Parent / Guardian ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider bg-gray-900 text-white px-3 py-1.5 rounded mb-3 print:mb-2">
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
              <Label>Email Address</Label>
              <Input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="optional" />
            </div>
            <div className="col-span-2">
              <Label>Residential Address *</Label>
              <Input value={form.address} onChange={e => f("address", e.target.value)} placeholder="House No., Area, City, Pin" />
            </div>
          </div>
        </section>

        {/* ── Section 3: Emergency Contact ── */}
        <section className="mb-5 print:mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider bg-gray-900 text-white px-3 py-1.5 rounded mb-3 print:mb-2">
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

        {/* ── Section 4: Medical ── */}
        <section className="mb-6 print:mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider bg-gray-900 text-white px-3 py-1.5 rounded mb-3 print:mb-2">
            Section 4 — Medical Information
          </h2>
          <div className="grid grid-cols-2 gap-4 print:gap-3">
            <div>
              <Label>Does student have Asthma? *</Label>
              <Select value={form.asthma} onChange={e => f("asthma", e.target.value)}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </div>
            <div>
              <Label>Known Allergies</Label>
              <Input value={form.allergies} onChange={e => f("allergies", e.target.value)} placeholder="e.g. peanuts, dust (or None)" />
            </div>
            <div className="col-span-2">
              <Label>Other Medical Notes</Label>
              <Input value={form.medicalNotes} onChange={e => f("medicalNotes", e.target.value)} placeholder="Any other health conditions the coach should know" />
            </div>
          </div>
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
                {/* Print placeholder */}
                <div className="hidden print:flex w-full h-full items-center justify-center">
                  <p className="text-[10px] text-gray-400 text-center">QR appears after filling online</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Declaration + Signature */}
          <div className="flex-1">
            <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
              I hereby declare that all information provided above is true and correct. I give consent for the student to participate in cricket training activities at PIR Cricket Academy and understand that the academy is not liable for any injury sustained during training sessions.
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
        <div className="mt-5 print:mt-4 text-center border-t border-gray-200 pt-3">
          <p className="text-[10px] text-gray-400">PIR Cricket Academy · +91 89360 61688 · PIRcricketHub@gmail.com · pircricketacademy.vercel.app</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Powered by Savera Cancer Hospital · Under the Aegis of S.P Sports & Cultural Foundation</p>
        </div>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body { margin: 0; background: white; }
          @page { size: A4; margin: 12mm; }
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
