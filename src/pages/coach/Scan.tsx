import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { QrCode, CheckCircle, AlertCircle, Users, Camera, CameraOff, Keyboard } from "lucide-react";
import jsQR from "jsqr";

const TODAY = new Date().toISOString().split("T")[0];

type ScanResult = { success: boolean; message: string; studentName?: string };

function getCoachName(): string {
  try {
    const user = JSON.parse(localStorage.getItem("pir_coach_user") || "null");
    return user?.name || "";
  } catch { return ""; }
}

export default function ScanPage() {
  const [coachName, setCoachName] = useState(getCoachName);
  const [date, setDate] = useState(TODAY);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [cameraState, setCameraState] = useState<"starting" | "active" | "error">("starting");
  const [cameraError, setCameraError] = useState("");
  const [manualToken, setManualToken] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const cooldownRef = useRef(false);
  const manualRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/attendance?date=${TODAY}`)
      .then(r => r.json())
      .then(data => setTodayCount(Array.isArray(data) ? data.length : 0));
  }, [result]);

  const markAttendance = useCallback(async (token: string) => {
    if (!coachName.trim()) { setResult({ success: false, message: "Please enter your name first." }); return; }
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: token.trim(), markedBy: coachName, sessionDate: date, status: "present" }),
      });
      const data = await res.json();
      if (res.status === 201) setResult({ success: true, message: "Attendance marked!", studentName: data.student?.name });
      else if (res.status === 409) setResult({ success: false, message: "Already marked for today", studentName: data.student?.name });
      else setResult({ success: false, message: data.error || "Error marking attendance" });
    } catch {
      setResult({ success: false, message: "Network error. Try again." });
    } finally {
      setLoading(false);
      setManualToken("");
      setTimeout(() => { cooldownRef.current = false; }, 2500);
    }
  }, [coachName, date]);

  // Camera scanning loop
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
        void markAttendance(code.data);
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }, [markAttendance]);

  // Start / stop camera
  useEffect(() => {
    if (mode !== "camera") return;
    let cancelled = false;
    setCameraState("starting");
    setCameraError("");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraState("active");
        rafRef.current = requestAnimationFrame(scanLoop);
      })
      .catch(err => {
        if (cancelled) return;
        const msg = String(err?.message || err);
        setCameraError(msg.includes("Permission") || msg.includes("NotAllowed")
          ? "Camera permission denied. Allow camera access in browser settings, or use manual input."
          : "Could not start camera. Please use manual input.");
        setCameraState("error");
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [mode, scanLoop]);

  const switchToManual = () => {
    setMode("manual");
    setTimeout(() => manualRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center p-4 pt-6">
      <div className="w-full max-w-sm">

        <Link href="/coach" className="inline-flex items-center gap-1.5 text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors mb-5">
          ← Coach Portal
        </Link>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <QrCode className="h-7 w-7 text-yellow-400" />
          </div>
          <h1 className="text-xl font-bold mb-0.5">QR Attendance</h1>
          <p className="text-gray-400 text-xs">PIRcricketHub</p>
        </div>

        {/* Today counter */}
        <div className="bg-[#0d1529] border border-yellow-500/20 rounded-xl p-3.5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-yellow-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Today's Attendance</p>
              <p className="font-semibold text-white text-sm">{date}</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-yellow-400">{todayCount}</span>
        </div>

        {/* Coach name + date */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Your Name (Coach)</label>
            <input
              className="w-full bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500"
              value={coachName}
              onChange={e => { setCoachName(e.target.value); localStorage.setItem("coachName", e.target.value); }}
              placeholder="Coach Pankaj Mishra"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Session Date</label>
            <input
              type="date"
              className="w-full bg-[#0d1529] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === "camera" ? "bg-yellow-500 text-black" : "bg-[#0d1529] border border-gray-700 text-gray-400 hover:border-yellow-500/40"}`}
          >
            <Camera className="h-4 w-4" /> Camera
          </button>
          <button
            onClick={switchToManual}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === "manual" ? "bg-yellow-500 text-black" : "bg-[#0d1529] border border-gray-700 text-gray-400 hover:border-yellow-500/40"}`}
          >
            <Keyboard className="h-4 w-4" /> Manual / Scanner
          </button>
        </div>

        {/* Camera mode */}
        {mode === "camera" && (
          <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl overflow-hidden mb-4">
            {cameraState === "error" ? (
              <div className="p-6 text-center">
                <CameraOff className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm mb-4">{cameraError}</p>
                <button onClick={switchToManual} className="bg-yellow-500 text-black font-bold text-sm px-5 py-2.5 rounded-xl">
                  Use Manual Input
                </button>
              </div>
            ) : (
              <>
                {/* Video viewfinder */}
                <div className="relative w-full bg-black" style={{ aspectRatio: "4/3" }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  {/* QR aim overlay */}
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
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Camera className="h-5 w-5 animate-pulse text-yellow-400" /> Starting camera…
                      </div>
                    </div>
                  )}
                </div>
                {/* Hidden canvas for jsQR processing */}
                <canvas ref={canvasRef} className="hidden" />
                <p className="text-center text-xs text-gray-400 py-3 px-4">
                  {loading ? "Marking attendance…" : "Align student's QR code within the frame"}
                </p>
              </>
            )}
          </div>
        )}

        {/* Manual / USB scanner mode */}
        {mode === "manual" && (
          <div className="bg-[#0d1529] border-2 border-dashed border-yellow-500/30 rounded-2xl p-5 mb-4">
            <p className="text-xs text-gray-400 mb-3">Type token or use a USB barcode scanner (auto-fills on scan):</p>
            <input
              ref={manualRef}
              autoFocus
              className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono mb-3"
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") void markAttendance(manualToken); }}
              placeholder="Token auto-fills on scan…"
            />
            <button
              disabled={loading || !manualToken.trim()}
              onClick={() => void markAttendance(manualToken)}
              className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Marking…" : "Mark Present"}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 flex items-start gap-3 ${result.success ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
            {result.success
              ? <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              : <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
            <div>
              {result.studentName && <p className="font-bold text-white">{result.studentName}</p>}
              <p className={`text-sm ${result.success ? "text-green-400" : "text-red-400"}`}>{result.message}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
