"use client";
/* Captured data URLs are local previews and cannot use Next image optimization. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, RotateCcw, ShieldX, Sun, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapGuideToVideo } from "@/features/check-ins/guide-crop";
import { preloadHealthModel } from "@/features/check-ins/hair-health-detector";
import { CAPTURE_KEY } from "@/lib/crownscore-client";

const GUIDE_BOUNDS = { left: 0.31, top: 0.28, width: 0.38, height: 0.3 };

type CameraState = "loading" | "ready" | "denied" | "unsupported" | "captured";

export function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [state, setState] = useState<CameraState>("loading");
  const [preview, setPreview] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const router = useRouter();

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("ready");
      preloadHealthModel();
    } catch {
      setState("denied");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void start());
    return () => {
      stop();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [start, stop]);

  const snap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const crop = mapGuideToVideo(video.videoWidth, video.videoHeight, video.clientWidth, video.clientHeight, GUIDE_BOUNDS);
    canvas.width = 900;
    canvas.height = 900;
    canvas.getContext("2d")?.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, 900, 900);
    const image = canvas.toDataURL("image/webp", 0.78);
    setPreview(image);
    sessionStorage.setItem(CAPTURE_KEY, image);
    setState("captured");
    stop();
  };

  const countdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    let value = 3;
    setCount(value);
    countdownRef.current = setInterval(() => {
      value -= 1;
      if (value === 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCount(null);
        snap();
      } else {
        setCount(value);
      }
    }, 700);
  };

  const retake = () => {
    setPreview(null);
    setState("loading");
    void start();
  };

  if (state === "denied" || state === "unsupported") {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center p-5">
        <div className="glass-panel max-w-md rounded-[32px] p-7 text-center">
          <ShieldX className="mx-auto size-8 text-[#b45309]" />
          <h2 className="mt-5 font-heading text-2xl font-extrabold tracking-tight">
            {state === "denied" ? "Camera access is blocked" : "Camera is not available"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {state === "denied"
              ? "Allow camera access in your browser settings, then try again. A photo is required for a visible-health score."
              : "Use a modern browser with camera support on localhost or HTTPS. A photo is required for a visible-health score."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {state === "denied" && (
              <Button className="w-full" onClick={() => { setState("loading"); void start(); }}>
                Try camera again
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-zinc-950">
      <video ref={videoRef} playsInline muted className={`absolute inset-0 size-full object-cover ${state === "captured" ? "hidden" : ""}`} />
      <canvas ref={canvasRef} className="hidden" />
      {preview && <img src={preview} alt="Captured scalp preview" className="absolute inset-0 size-full object-cover" />}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_38%_30%_at_50%_43%,transparent_0%,transparent_75%,rgba(9,9,11,.78)_76%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[43%] h-[30%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-emerald-300/80 shadow-[0_0_0_1px_rgba(0,0,0,.35)]">
        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-emerald-300" />
        <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-emerald-300" />
      </div>
      {count && <div className="absolute inset-0 grid place-items-center bg-zinc-950/35 text-7xl font-semibold backdrop-blur-sm">{count}</div>}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <div className="glass-panel rounded-full px-3 py-2 text-xs">Align the crown inside the guide</div>
        <div className="glass-panel flex items-center gap-2 rounded-full px-3 py-2 text-xs text-emerald-200">
          <Check className="size-3" />
          Stable
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 pb-8">
        <div className="mx-auto mb-5 flex max-w-sm justify-center gap-2">
          <span className="glass-panel flex items-center gap-2 rounded-full px-3 py-2 text-xs">
            <Sun className="size-3 text-emerald-300" />
            Use even light
          </span>
          <span className="glass-panel flex items-center gap-2 rounded-full px-3 py-2 text-xs">
            <ScanLine className="size-3 text-emerald-300" />
            Fill the guide
          </span>
        </div>
        {state === "captured" ? (
          <div className="mx-auto flex max-w-sm gap-3">
            <Button variant="secondary" className="h-12 flex-1" onClick={retake}>
              <RotateCcw />
              Retake
            </Button>
            <Button className="h-12 flex-1" onClick={() => router.push("/check-in/questionnaire")}>
              Use photo
              <Check />
            </Button>
          </div>
        ) : (
          <button
            disabled={state !== "ready"}
            onClick={countdown}
            aria-label="Capture photo"
            className="mx-auto grid size-20 place-items-center rounded-full border-4 border-white bg-white/20 transition active:scale-95 disabled:opacity-40"
          >
            <span className="grid size-14 place-items-center rounded-full bg-white text-zinc-950">
              <Camera className="size-6" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
