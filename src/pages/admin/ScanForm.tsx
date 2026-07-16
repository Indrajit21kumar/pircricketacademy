import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { QrCode, CheckCircle, AlertCircle, Camera, CameraOff, Keyboard, ArrowLeft, User, Phone, Calendar, MapPin } from "lucide-react";
import jsQR from "jsqr";

type ScannedData = {
  v?: number;
  sn: string; dob: string; ag: string; sch: string; bg: string;
  pn: string; ph: string; em: string; addr: string;
  en: string; ep: string; ast: boolean; alg: string; med: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

function getAdminToken(): string {
  return localStorage.getItem("pir_admin_token") || "";
}

export default function ScanFormPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [cameraState, setCameraState] = useState<"starting" | "active" | "error">("starting");
  const [cameraError, setCameraError] = useState("");
  const [scanned, setScanned] = useState<ScannedData | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [admissionRef, setAdmissionRef] = useState("");
  const [manualJson, setManualJson] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const cooldownRef = useRef(false);
  const manualRef = useRef<HTMLTextAreaElement>(null);

  // Auth guard
  useEffect(() => {
    if (!getAdminToken()) navigate("/admin");
  }, [navigate]);

  const handleQrData = useCallback((raw: string) => {
    try {
      const data: ScannedData = JSON.parse(raw);
      if (!data.sn || !data.ph) throw new Error("Missing required fields");
      setScanned(data);
      // Stop camera once scanned
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    } catch {
      // not a form QR — ignore
    }
  }, []);

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
        handleQrData(code.data);
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }, [handleQrData]);

  useEffect(() => {
    if (mode !== "camera" || scanned) return;
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
          ? "Camera permission denied. Use manual paste instead."
          : "Could not start camera. Use manual paste.");
        setCameraState("error");
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [mode, scanned, scanLoop]);

  const submitAdmission = async () => {
    if (!scanned) return;
    // Validate required fields before hitting the API
    const missing: string[] = [];
    if (!scanned.sn?.trim()) missing.push("Student Name");
    if (!scanned.dob?.trim()) missing.push("Date of Birth");
    if (!scanned.ag?.trim()) missing.push("Age Group");
    if (!scanned.pn?.trim()) missing.push("Parent Name");
    if (!scanned.ph?.trim()) missing.push("Phone");
    if (!scanned.em?.trim()) missing.push("Email");
    if (missing.length > 0) {
      setSubmitError(`Missing required fields from form: ${missing.join(", ")}. Ask parent to refill the form with all fields.`);
      setSubmitState("error");
      return;
    }
    setSubmitState("submitting");
    setSubmitError("");
    try {
      const token = getAdminToken();
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          studentName: scanned.sn,
          dob: scanned.dob,
          ageGroup: scanned.ag,
          school: scanned.sch || undefined,
          bloodGroup: scanned.bg || undefined,
          parentName: scanned.pn,
          phone: scanned.ph,
          email: scanned.em,
          address: scanned.addr || undefined,
          emergencyName: scanned.en || scanned.pn,
          emergencyPhone: scanned.ep || scanned.ph,
          asthma: scanned.ast ?? false,
          allergies: scanned.alg || undefined,
          medicalNotes: scanned.med || undefined,
          consentMedical: true, consentPhoto: true,
          consentLiability: true, consentTerms: true, consentData: true,
          isTrial: false,
          source: "Offline Paper Form",
          packageMonths: null,
          eligibilityDiscountPct: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setAdmissionRef(data.ref || `ADM-${Date.now()}`);
      setSubmitState("success");
    } catch (e: any) {
      setSubmitError(e.message || "Unknown error");
      setSubmitState("error");
    }
  };

  const reset = () => {
    setScanned(null);
    setSubmitState("idle");
    setSubmitError("");
    setAdmissionRef("");
    cooldownRef.current = false;
    setMode("camera");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center p-4 pt-6">
      <div className="w-full max-w-lg">

        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors mb-5">
          <ArrowLeft className="h-4 w-4" /> Admin Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <QrCode className="h-7 w-7 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Scan Paper Form</h1>
          <p className="text-gray-400 text-sm">Scan the QR code on an offline admission form to register the student instantly</p>
        </div>

        {/* ── SUCCESS ── */}
        {submitState === "success" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <CheckCircle className="h-14 w-14 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-1">Registered!</h2>
            <p className="text-white font-bold text-lg">{scanned?.sn}</p>
            <p className="text-gray-400 text-sm mb-2">{scanned?.pn} · {scanned?.ph}</p>
            <p className="text-yellow-400 font-mono font-bold text-lg mb-6">{admissionRef}</p>
            <button onClick={reset} className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
              Scan Another Form
            </button>
          </div>
        )}

        {/* ── SCANNED PREVIEW — confirm before submit ── */}
        {scanned && submitState !== "success" && (
          <div className="bg-[#0d1529] border border-yellow-500/30 rounded-2xl p-5">
            <h2 className="font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Form Scanned — Review & Confirm
            </h2>

            <div className="space-y-3 mb-5">
              <Row icon={<User className="h-4 w-4 text-yellow-400" />} label="Student" value={scanned.sn} />
              <Row icon={<Calendar className="h-4 w-4 text-blue-400" />} label="DOB / Age Group" value={`${scanned.dob || "—"} · ${scanned.ag || "—"}`} />
              <Row icon={<User className="h-4 w-4 text-green-400" />} label="Parent" value={scanned.pn || "—"} />
              <Row icon={<Phone className="h-4 w-4 text-green-400" />} label="Phone" value={scanned.ph} />
              {scanned.em && <Row icon={<span className="h-4 w-4 text-purple-400 text-xs">@</span>} label="Email" value={scanned.em} />}
              {scanned.addr && <Row icon={<MapPin className="h-4 w-4 text-orange-400" />} label="Address" value={scanned.addr} />}
              <Row icon={<span className="h-4 w-4" />} label="Emergency" value={`${scanned.en || "—"} · ${scanned.ep || "—"}`} />
              <Row icon={<span className="h-4 w-4" />} label="Asthma" value={scanned.ast ? "Yes" : "No"} />
              {scanned.alg && <Row icon={<span className="h-4 w-4" />} label="Allergies" value={scanned.alg} />}
              {scanned.sch && <Row icon={<span className="h-4 w-4" />} label="School" value={scanned.sch} />}
            </div>

            {submitState === "error" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 border border-gray-700 text-gray-400 font-bold py-3 rounded-xl hover:border-gray-500 transition-colors text-sm">
                Scan Again
              </button>
              <button
                onClick={submitAdmission}
                disabled={submitState === "submitting"}
                className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60 text-sm"
              >
                {submitState === "submitting" ? "Registering…" : "Confirm & Register"}
              </button>
            </div>
          </div>
        )}

        {/* ── SCANNER ── */}
        {!scanned && (
          <>
            {/* Mode toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("camera")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === "camera" ? "bg-yellow-500 text-black" : "bg-[#0d1529] border border-gray-700 text-gray-400"}`}
              >
                <Camera className="h-4 w-4" /> Scan QR
              </button>
              <button
                onClick={() => { setMode("manual"); setTimeout(() => manualRef.current?.focus(), 100); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === "manual" ? "bg-yellow-500 text-black" : "bg-[#0d1529] border border-gray-700 text-gray-400"}`}
              >
                <Keyboard className="h-4 w-4" /> Paste JSON
              </button>
            </div>

            {/* Camera */}
            {mode === "camera" && (
              <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl overflow-hidden mb-4">
                {cameraState === "error" ? (
                  <div className="p-6 text-center">
                    <CameraOff className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400 text-sm mb-4">{cameraError}</p>
                    <button onClick={() => { setMode("manual"); setTimeout(() => manualRef.current?.focus(), 100); }}
                      className="bg-yellow-500 text-black font-bold text-sm px-5 py-2.5 rounded-xl">
                      Use Manual Paste
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative w-full bg-black" style={{ aspectRatio: "4/3" }}>
                      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-52 h-52 relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-400 rounded-br-lg" />
                        </div>
                      </div>
                      {cameraState === "starting" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Camera className="h-5 w-5 animate-pulse text-yellow-400" /> Starting camera…
                          </div>
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <p className="text-center text-xs text-gray-400 py-3 px-4">
                      Point camera at the QR code on the printed admission form
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Manual JSON paste (fallback / dev) */}
            {mode === "manual" && (
              <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl p-5 mb-4">
                <p className="text-xs text-gray-400 mb-3">Paste the raw JSON from the form QR code:</p>
                <textarea
                  ref={manualRef}
                  rows={5}
                  className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-yellow-500 mb-3 resize-none"
                  value={manualJson}
                  onChange={e => setManualJson(e.target.value)}
                  placeholder='{"v":1,"sn":"Student Name","ph":"9876543210",...}'
                />
                <button
                  disabled={!manualJson.trim()}
                  onClick={() => handleQrData(manualJson.trim())}
                  className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50 text-sm transition-colors"
                >
                  Parse & Preview
                </button>
              </div>
            )}

            {/* How-to hint */}
            <div className="bg-[#0d1529] border border-gray-800 rounded-xl p-4 text-xs text-gray-400 space-y-1.5">
              <p className="font-bold text-gray-300 mb-2">How this works</p>
              <p>1. Parent fills the form at <span className="text-yellow-400">pircricketacademy.vercel.app/admission-form</span></p>
              <p>2. A QR code is auto-generated from their data as they type</p>
              <p>3. They print the page and bring it to the academy</p>
              <p>4. Scan the QR here → review details → one tap to register</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
