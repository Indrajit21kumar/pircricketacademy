import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  QrCode, Users, Calendar, Search, LogIn, LogOut, CheckCircle,
  AlertCircle, Camera, CameraOff, Keyboard, Clock, ChevronRight,
  ClipboardList, UserPlus, Banknote, CreditCard, X
} from "lucide-react";
import jsQR from "jsqr";

const TODAY = new Date().toISOString().split("T")[0];
const REC_TOKEN_KEY = "pir_reception_token";
const REC_USER_KEY = "pir_reception_user";

const inp = "w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500";
const lbl = "block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5";

const AGE_GROUPS = ["U8 (Under 8)", "U12 (Under 12)", "U16 (Under 16)", "U19 (Under 19)", "Elite", "Not sure — need assessment"];

function getToken() { return localStorage.getItem(REC_TOKEN_KEY); }
function getUser(): { name: string; username: string } | null {
  try { return JSON.parse(localStorage.getItem(REC_USER_KEY) || "null"); } catch { return null; }
}
function clearSession() { localStorage.removeItem(REC_TOKEN_KEY); localStorage.removeItem(REC_USER_KEY); }

function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  return fetch(`/api${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
}

// ─── Camera hook ──────────────────────────────────────────────────────────────
function useCameraQR(onScan: (data: string) => void, active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const cooldownRef = useRef(false);
  const [cameraState, setCameraState] = useState<"starting" | "active" | "error">("starting");
  const [cameraError, setCameraError] = useState("");

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) { rafRef.current = requestAnimationFrame(scanLoop); return; }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    if (!cooldownRef.current) {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (code?.data) {
        cooldownRef.current = true;
        onScan(code.data);
        setTimeout(() => { cooldownRef.current = false; }, 2500);
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }, [onScan]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setCameraState("starting");
    setCameraError("");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
        setCameraState("active");
        rafRef.current = requestAnimationFrame(scanLoop);
      })
      .catch(err => {
        if (cancelled) return;
        const msg = String(err?.message || err);
        setCameraError(msg.includes("Permission") || msg.includes("NotAllowed")
          ? "Camera permission denied. Allow camera access and refresh."
          : "Could not start camera.");
        setCameraState("error");
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [active, scanLoop]);

  return { videoRef, canvasRef, cameraState, cameraError };
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function ReceptionLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user.role !== "receptionist") throw new Error("This portal is for receptionists only.");
      localStorage.setItem(REC_TOKEN_KEY, data.token);
      localStorage.setItem(REC_USER_KEY, JSON.stringify({ name: data.user.name, username: data.user.username }));
      onLogin(data.user.name);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">← Home</Link>
        </div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Reception Portal</h1>
          <p className="text-gray-400 text-sm">PIRcricketHub — Front Desk Login</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={lbl}>Username</label>
            <input autoFocus required className={inp} value={username} onChange={e => setUsername(e.target.value)} placeholder="reception.username" />
          </div>
          <div>
            <label className={lbl}>Password</label>
            <input required type="password" className={inp} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" /> {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Attendance Scan Tab ───────────────────────────────────────────────────────
function AttendanceScan({ userName }: { userName: string }) {
  const [date, setDate] = useState(TODAY);
  const [todayCount, setTodayCount] = useState(0);
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; studentName?: string } | null>(null);
  const manualRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch(`/attendance?date=${TODAY}`).then(r => r.json()).then(d => setTodayCount(Array.isArray(d) ? d.length : 0));
  }, [result]);

  const markAttendance = useCallback(async (token: string) => {
    if (!token.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/attendance", {
        method: "POST",
        body: JSON.stringify({ qrToken: token.trim(), markedBy: userName, sessionDate: date, status: "present" }),
      });
      const data = await res.json();
      if (res.status === 201) setResult({ success: true, message: "Attendance marked!", studentName: data.student?.name });
      else if (res.status === 409) setResult({ success: false, message: "Already marked for today", studentName: data.student?.name });
      else setResult({ success: false, message: data.error || "Error" });
    } catch { setResult({ success: false, message: "Network error. Try again." }); }
    finally { setLoading(false); setManualToken(""); }
  }, [userName, date]);

  const { videoRef, canvasRef, cameraState, cameraError } = useCameraQR(markAttendance, mode === "camera");

  return (
    <div className="space-y-4">
      <div className="bg-[#0d1529] border border-yellow-500/20 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 text-yellow-400 shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Today's Attendance</p>
            <p className="font-semibold text-white text-sm">{date}</p>
          </div>
        </div>
        <span className="text-3xl font-bold text-yellow-400">{todayCount}</span>
      </div>

      <div>
        <label className={lbl}>Session Date</label>
        <input type="date" className={inp} value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <button onClick={() => setMode("camera")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === "camera" ? "bg-yellow-500 text-black" : "bg-[#0d1529] border border-gray-700 text-gray-400"}`}>
          <Camera className="h-4 w-4" /> Camera
        </button>
        <button onClick={() => { setMode("manual"); setTimeout(() => manualRef.current?.focus(), 100); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === "manual" ? "bg-yellow-500 text-black" : "bg-[#0d1529] border border-gray-700 text-gray-400"}`}>
          <Keyboard className="h-4 w-4" /> Manual
        </button>
      </div>

      {mode === "camera" && (
        <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl overflow-hidden">
          {cameraState === "error" ? (
            <div className="p-6 text-center"><CameraOff className="h-8 w-8 text-red-400 mx-auto mb-2" /><p className="text-red-400 text-sm">{cameraError}</p></div>
          ) : (
            <>
              <div className="relative w-full bg-black" style={{ aspectRatio: "4/3" }}>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-400 rounded-br-lg" />
                  </div>
                </div>
                {cameraState === "starting" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="flex items-center gap-2 text-gray-300 text-sm"><Camera className="h-5 w-5 animate-pulse text-yellow-400" /> Starting camera…</div>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <p className="text-center text-xs text-gray-400 py-3">{loading ? "Marking attendance…" : "Align student's QR code within the frame"}</p>
            </>
          )}
        </div>
      )}

      {mode === "manual" && (
        <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl p-5 space-y-3">
          <p className="text-xs text-gray-400">Type token or use a USB barcode scanner:</p>
          <input ref={manualRef} autoFocus className={inp + " font-mono"} value={manualToken} onChange={e => setManualToken(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void markAttendance(manualToken); }} placeholder="Scan or type QR token…" />
          <button disabled={loading || !manualToken.trim()} onClick={() => void markAttendance(manualToken)} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50 text-sm">
            {loading ? "Marking…" : "Mark Present"}
          </button>
        </div>
      )}

      {result && (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${result.success ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
          {result.success ? <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
          <div>
            {result.studentName && <p className="font-bold text-white">{result.studentName}</p>}
            <p className={`text-sm ${result.success ? "text-green-400" : "text-red-400"}`}>{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Walk-in Registration Tab ─────────────────────────────────────────────────
type ScannedForm = {
  sn?: string; dob?: string; ag?: string; sch?: string; bg?: string;
  pn?: string; ph?: string; em?: string; addr?: string;
  en?: string; ep?: string; ast?: boolean; alg?: string; med?: string;
};

function WalkIn() {
  const [step, setStep] = useState<"scan" | "preview" | "payment" | "success">("scan");
  const [scanned, setScanned] = useState<ScannedForm | null>(null);
  const [parseError, setParseError] = useState("");
  const [payMode, setPayMode] = useState<"cash" | "online">("cash");
  const [cashAmount, setCashAmount] = useState("5000");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [admRef, setAdmRef] = useState("");
  const [cameraActive, setCameraActive] = useState(true);
  const [manualJson, setManualJson] = useState("");

  const handleQr = useCallback((raw: string) => {
    setCameraActive(false);
    setParseError("");
    try {
      const data = JSON.parse(raw);
      if (!data.sn && !data.ph) throw new Error("Not a valid PIR admission QR");
      setScanned(data);
      setStep("preview");
    } catch {
      setParseError("Could not read QR code. Make sure it's from the PIR offline admission form.");
      setCameraActive(true);
    }
  }, []);

  const { videoRef, canvasRef, cameraState, cameraError } = useCameraQR(handleQr, step === "scan" && cameraActive);

  const missing: string[] = [];
  if (scanned) {
    if (!scanned.sn?.trim()) missing.push("Student Name");
    if (!scanned.dob?.trim()) missing.push("Date of Birth");
    if (!scanned.ag?.trim()) missing.push("Age Group");
    if (!scanned.pn?.trim()) missing.push("Parent Name");
    if (!scanned.ph?.trim()) missing.push("Phone");
    if (!scanned.em?.trim()) missing.push("Email");
    if (!scanned.en?.trim()) missing.push("Emergency Contact Name");
    if (!scanned.ep?.trim()) missing.push("Emergency Contact Phone");
  }

  const submitCash = async () => {
    if (missing.length > 0) { setSubmitError(`Missing required fields: ${missing.join(", ")}`); return; }
    if (!scanned) return;
    setSubmitting(true); setSubmitError("");
    try {
      const res = await apiFetch("/admissions", {
        method: "POST",
        body: JSON.stringify({
          studentName: scanned.sn!, dob: scanned.dob!, ageGroup: scanned.ag!,
          school: scanned.sch || "", parentName: scanned.pn!, phone: scanned.ph!,
          email: scanned.em!, address: scanned.addr || "",
          bloodGroup: scanned.bg || "", allergies: scanned.alg || "",
          asthma: !!scanned.ast, medicalNotes: scanned.med || "",
          emergencyName: scanned.en!, emergencyPhone: scanned.ep!,
          consentMedical: true, consentPhoto: true, consentLiability: true,
          consentTerms: true, consentData: true,
          source: "Offline Paper Form — Walk-in",
          isTrial: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Mark as cash paid immediately
      const paidAmount = parseInt(cashAmount) || 5000;
      await apiFetch(`/admissions/${data.id}/mark-paid`, {
        method: "PATCH",
        body: JSON.stringify({ amount: paidAmount, note: "CASH — walk-in reception" }),
      });

      setAdmRef(`ADM-${data.id}`);
      setStep("success");
    } catch (err: any) { setSubmitError(err.message); }
    finally { setSubmitting(false); }
  };

  const submitOnline = async () => {
    if (missing.length > 0) { setSubmitError(`Missing required fields: ${missing.join(", ")}`); return; }
    if (!scanned) return;
    setSubmitting(true); setSubmitError("");
    try {
      const res = await apiFetch("/admissions", {
        method: "POST",
        body: JSON.stringify({
          studentName: scanned.sn!, dob: scanned.dob!, ageGroup: scanned.ag!,
          school: scanned.sch || "", parentName: scanned.pn!, phone: scanned.ph!,
          email: scanned.em!, address: scanned.addr || "",
          bloodGroup: scanned.bg || "", allergies: scanned.alg || "",
          asthma: !!scanned.ast, medicalNotes: scanned.med || "",
          emergencyName: scanned.en!, emergencyPhone: scanned.ep!,
          consentMedical: true, consentPhoto: true, consentLiability: true,
          consentTerms: true, consentData: true,
          source: "Offline Paper Form — Walk-in Online Pay",
          isTrial: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Launch Razorpay
      const win = window as any;
      if (!win.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        document.head.appendChild(script);
        await new Promise(r => { script.onload = r; });
      }
      const rz = new win.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "PIR Cricket Academy",
        description: "Admission Registration",
        order_id: data.orderId,
        prefill: { name: data.parentName, contact: data.phone, email: data.email },
        handler: async (resp: any) => {
          await fetch("/api/admissions/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ admissionId: data.id, razorpayOrderId: data.orderId, razorpayPaymentId: resp.razorpay_payment_id, razorpaySignature: resp.razorpay_signature }),
          });
          setAdmRef(`ADM-${data.id}`);
          setStep("success");
        },
        modal: { ondismiss: () => { setSubmitError("Payment cancelled."); setSubmitting(false); } },
        theme: { color: "#eab308" },
      });
      rz.open();
    } catch (err: any) { setSubmitError(err.message); setSubmitting(false); }
  };

  const reset = () => {
    setStep("scan"); setScanned(null); setParseError(""); setPayMode("cash");
    setCashAmount("5000"); setSubmitError(""); setAdmRef(""); setCameraActive(true); setManualJson("");
  };

  if (step === "success") return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Registered!</h2>
      <p className="text-gray-400 text-sm mb-1">Admission reference:</p>
      <p className="text-yellow-400 font-mono font-bold text-lg mb-6">{admRef}</p>
      <button onClick={reset} className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
        Register Another Walk-in
      </button>
    </div>
  );

  if (step === "scan") return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">Scan the QR code from the student's printed offline form.</p>
      {parseError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{parseError}</div>}
      <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl overflow-hidden">
        {cameraState === "error" ? (
          <div className="p-6 text-center"><CameraOff className="h-8 w-8 text-red-400 mx-auto mb-2" /><p className="text-red-400 text-sm">{cameraError}</p></div>
        ) : (
          <>
            <div className="relative w-full bg-black" style={{ aspectRatio: "4/3" }}>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 relative">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-yellow-400 rounded-br-lg" />
                </div>
              </div>
              {cameraState === "starting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="flex items-center gap-2 text-gray-300 text-sm"><Camera className="h-5 w-5 animate-pulse text-yellow-400" /> Starting camera…</div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-center text-xs text-gray-400 py-3 px-4">Point camera at the QR code on the admission form</p>
          </>
        )}
      </div>

      <details className="text-xs">
        <summary className="text-gray-500 cursor-pointer hover:text-gray-400 select-none">Paste JSON manually (fallback)</summary>
        <div className="mt-2 space-y-2">
          <textarea className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-yellow-500 h-20 resize-none" value={manualJson} onChange={e => setManualJson(e.target.value)} placeholder='{"v":1,"sn":"Student Name",...}' />
          <button onClick={() => manualJson.trim() && handleQr(manualJson.trim())} className="w-full bg-[#0d1529] border border-yellow-500/30 text-yellow-400 font-bold py-2 rounded-xl text-sm">
            Parse & Continue
          </button>
        </div>
      </details>
    </div>
  );

  if (step === "preview") return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">Scanned Details</h3>
        <button onClick={() => { setStep("scan"); setCameraActive(true); }} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      {missing.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-xs font-bold mb-1">Missing required fields:</p>
          <p className="text-red-400 text-xs">{missing.join(", ")}</p>
        </div>
      )}
      <div className="bg-[#0d1529] rounded-xl border border-gray-700/50 divide-y divide-gray-700/50">
        {[
          ["Student Name", scanned?.sn],
          ["Date of Birth", scanned?.dob],
          ["Age Group", scanned?.ag],
          ["School", scanned?.sch || "—"],
          ["Blood Group", scanned?.bg || "—"],
          ["Parent Name", scanned?.pn],
          ["Phone", scanned?.ph],
          ["Email", scanned?.em],
          ["Address", scanned?.addr || "—"],
          ["Emergency Contact", scanned?.en ? `${scanned.en} / ${scanned.ep}` : "—"],
          ["Asthma", scanned?.ast ? "Yes" : "No"],
          ["Allergies", scanned?.alg || "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-3 px-3 py-2">
            <span className="text-gray-400 text-xs w-32 shrink-0 pt-0.5">{k}</span>
            <span className="text-white text-xs font-medium">{v || <span className="text-red-400">Missing</span>}</span>
          </div>
        ))}
      </div>
      <button
        disabled={missing.length > 0}
        onClick={() => setStep("payment")}
        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        Continue to Payment <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  if (step === "payment") return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">Payment</h3>
        <button onClick={() => setStep("preview")} className="text-gray-400 hover:text-white text-xs">← Back</button>
      </div>
      <div className="bg-[#0d1529] rounded-xl border border-yellow-500/20 p-3">
        <p className="text-gray-400 text-xs">Registering</p>
        <p className="text-white font-bold">{scanned?.sn}</p>
        <p className="text-gray-400 text-xs">{scanned?.ag}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPayMode("cash")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${payMode === "cash" ? "border-yellow-500 bg-yellow-500/10" : "border-gray-700 bg-[#0d1529]"}`}
        >
          <Banknote className={`h-6 w-6 ${payMode === "cash" ? "text-yellow-400" : "text-gray-400"}`} />
          <span className={`text-sm font-bold ${payMode === "cash" ? "text-white" : "text-gray-400"}`}>Cash</span>
        </button>
        <button
          onClick={() => setPayMode("online")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${payMode === "online" ? "border-yellow-500 bg-yellow-500/10" : "border-gray-700 bg-[#0d1529]"}`}
        >
          <CreditCard className={`h-6 w-6 ${payMode === "online" ? "text-yellow-400" : "text-gray-400"}`} />
          <span className={`text-sm font-bold ${payMode === "online" ? "text-white" : "text-gray-400"}`}>Online</span>
        </button>
      </div>

      {payMode === "cash" && (
        <div>
          <label className={lbl}>Amount Received (₹)</label>
          <input type="number" className={inp} value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="5000" min={0} />
        </div>
      )}

      {submitError && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">{submitError}</p>}

      <button
        disabled={submitting}
        onClick={payMode === "cash" ? submitCash : submitOnline}
        className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        {submitting ? "Processing…" : payMode === "cash" ? `Confirm Cash ₹${cashAmount}` : "Launch Online Payment"}
      </button>
    </div>
  );

  return null;
}

// ─── Today's Bookings Tab ─────────────────────────────────────────────────────
function TodayBookings() {
  const [date, setDate] = useState(TODAY);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/bookings?date=${date}`).then(r => r.json()).then(d => {
      setBookings(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, [date]);

  const statusColor = (s: string) =>
    s === "confirmed" ? "text-green-400 bg-green-400/10" :
    s === "pending_payment" ? "text-yellow-400 bg-yellow-400/10" :
    s === "cancelled" ? "text-red-400 bg-red-400/10" :
    "text-gray-400 bg-gray-400/10";

  return (
    <div className="space-y-4">
      <div>
        <label className={lbl}>View bookings for date</label>
        <input type="date" className={inp} value={date} onChange={e => setDate(e.target.value)} />
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-6">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No bookings for this date</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map(b => (
            <div key={b.id} className="bg-[#0d1529] border border-gray-700/50 rounded-xl p-3.5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">{b.name}</p>
                  <p className="text-gray-400 text-xs">{b.phone}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusColor(b.status)}`}>{b.status.replace("_", " ")}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1.5 text-gray-400"><Clock className="h-3 w-3" /> {b.slot} · {b.duration}hr</div>
                <div className="text-right text-yellow-400 font-medium">₹{(b.total||0).toLocaleString()}</div>
                <div className="text-gray-400 col-span-2">{b.facilityName}</div>
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5 font-mono">{b.ref}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Student Lookup Tab ────────────────────────────────────────────────────────
function StudentLookup() {
  const [query, setQuery] = useState("");
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/students").then(r => r.json()).then(d => {
      setAll(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const filtered = query.trim().length > 0
    ? all.filter(({ student: s }) =>
        s.name?.toLowerCase().includes(query.toLowerCase()) ||
        s.phone?.includes(query) ||
        s.parentName?.toLowerCase().includes(query.toLowerCase())
      )
    : all.slice(0, 20);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          autoFocus
          className="w-full bg-[#0d1529] border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500"
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or phone…"
        />
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-6">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No students found</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ student: s, batch: b }) => (
            <div key={s.id} className="bg-[#0d1529] border border-gray-700/50 rounded-xl p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white text-sm">{s.name}</p>
                  <p className="text-gray-400 text-xs">{s.parentName} · {s.phone}</p>
                  <p className="text-gray-500 text-xs">{s.ageGroup}{b ? ` · ${b.name}` : ""}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${s.status === "active" ? "text-green-400 bg-green-400/10" : "text-gray-400 bg-gray-400/10"}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
          {query.trim() === "" && all.length > 20 && (
            <p className="text-gray-500 text-xs text-center">Showing 20 of {all.length} — search to filter</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Portal ──────────────────────────────────────────────────────────────
type Tab = "attendance" | "walkin" | "bookings" | "students";

export default function ReceptionPortal() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [userName, setUserName] = useState(() => getUser()?.name || "");
  const [tab, setTab] = useState<Tab>("attendance");

  if (!loggedIn) return <ReceptionLogin onLogin={name => { setUserName(name); setLoggedIn(true); }} />;

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "attendance", icon: <QrCode className="h-5 w-5" />, label: "Attendance" },
    { id: "walkin", icon: <UserPlus className="h-5 w-5" />, label: "Walk-in" },
    { id: "bookings", icon: <Calendar className="h-5 w-5" />, label: "Bookings" },
    { id: "students", icon: <Search className="h-5 w-5" />, label: "Students" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#0d1529] border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-base text-white">Reception</h1>
          <p className="text-[10px] text-gray-400">{userName} · PIRcricketHub</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/curriculum" className="text-xs text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-500/20 transition-colors">Curriculum</Link>
          <button
            onClick={() => { clearSession(); setLoggedIn(false); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-sm mx-auto px-4 pt-5">
          {tab === "attendance" && <AttendanceScan userName={userName} />}
          {tab === "walkin" && <WalkIn />}
          {tab === "bookings" && <TodayBookings />}
          {tab === "students" && <StudentLookup />}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d1529] border-t border-gray-800 flex safe-area-pb">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${tab === t.id ? "text-yellow-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
