"use client";
/* Captured data URLs are local previews and cannot use Next image optimization. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, RotateCcw, ShieldX, Sun, ScanLine, Upload } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<CameraState>("loading");
  const [preview, setPreview] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
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
    sessionStorage.removeItem(CAPTURE_KEY);
    setState("loading");
    void start();
  };

  const handleUploadedPhoto = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setFileError("Choose a JPG, PNG, or WebP image smaller than 8 MB.");
      return;
    }
    try {
      const source = await createImageBitmap(file);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cropSize = Math.min(source.width, source.height);
      canvas.width = 900;
      canvas.height = 900;
      canvas
        .getContext("2d")
        ?.drawImage(
          source,
          (source.width - cropSize) / 2,
          (source.height - cropSize) / 2,
          cropSize,
          cropSize,
          0,
          0,
          900,
          900
        );
      source.close();
      const image = canvas.toDataURL("image/webp", 0.78);
      setPreview(image);
      sessionStorage.setItem(CAPTURE_KEY, image);
      stop();
      setState("captured");
    } catch {
      setFileError("That image could not be opened. Try a different photo.");
    }
  };

  if (state === "denied" || state === "unsupported") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-5">
        <div className="glass-panel max-w-md rounded-[32px] p-7 text-center">
          <ShieldX className="mx-auto size-8 text-[#b45309]" />
          <h2 className="mt-5 font-heading text-2xl font-extrabold tracking-tight">
            {state === "denied" ? "Camera access is blocked" : "Camera is not available"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {state === "denied"
              ? "Allow camera access in your browser settings, or choose an existing crown photo."
              : "Use a modern browser on localhost or HTTPS, or choose an existing crown photo."}
          </p>
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void handleUploadedPhoto(event.target.files?.[0])}
          />
          <div className="mt-6 flex flex-col gap-3">
            <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload />
              Choose a photo
            </Button>
            {state === "denied" && (
              <Button variant="outline" className="w-full" onClick={() => { setState("loading"); void start(); }}>
                Try camera again
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
          {fileError && <p role="alert" className="mt-4 text-sm font-bold text-destructive">{fileError}</p>}
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Use an evenly lit, top-down photo with the crown centered. The selected image stays in this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      <video ref={videoRef} playsInline muted className={`absolute inset-0 size-full object-cover ${state === "captured" ? "hidden" : ""}`} />
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleUploadedPhoto(event.target.files?.[0])}
      />
      {preview && <img src={preview} alt="Captured scalp preview" className="absolute inset-0 size-full object-cover" />}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_42%_34%_at_50%_42%,transparent_0%,transparent_72%,rgba(9,9,11,.82)_76%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-[min(34vw,30vh)] w-[min(52vw,38vh)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-accent/70 shadow-[0_0_0_1px_rgba(0,0,0,.35)] sm:h-[30%] sm:w-[38%]">
        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-accent" />
        <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-accent" />
      </div>
      {count && <div className="absolute inset-0 grid place-items-center bg-zinc-950/35 font-mono text-7xl font-semibold backdrop-blur-sm">{count}</div>}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="max-w-[58%] rounded-full border border-white/20 bg-zinc-950/55 px-3 py-2 text-[11px] font-bold leading-snug text-white backdrop-blur-md sm:max-w-none sm:text-xs">
          Align the crown inside the guide
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-accent/30 bg-zinc-950/55 px-3 py-2 text-[11px] font-bold text-[#8ecdb8] backdrop-blur-md sm:text-xs">
          <Check className="size-3" />
          Ready
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-5 flex max-w-sm flex-wrap justify-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/55 px-3 py-2 text-[11px] font-bold text-white/90 backdrop-blur-md sm:text-xs">
            <Sun className="size-3 text-accent" />
            Even light
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/55 px-3 py-2 text-[11px] font-bold text-white/90 backdrop-blur-md sm:text-xs">
            <ScanLine className="size-3 text-accent" />
            Fill guide
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
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choose an existing photo"
              className="grid size-12 place-items-center rounded-full border border-white/25 bg-zinc-950/55 text-white backdrop-blur-md transition hover:bg-zinc-900 neu-focus"
            >
              <Upload className="size-5" />
            </button>
            <button
              type="button"
              disabled={state !== "ready"}
              onClick={countdown}
              aria-label="Capture photo"
              className="grid size-20 place-items-center rounded-full border-4 border-white bg-white/20 transition active:scale-95 disabled:opacity-40 neu-focus"
            >
              <span className="grid size-14 place-items-center rounded-full bg-white text-zinc-950">
                <Camera className="size-6" />
              </span>
            </button>
            <span className="size-12" aria-hidden />
          </div>
        )}
        {fileError && <p role="alert" className="mx-auto mt-3 max-w-sm text-center text-xs font-bold text-red-200">{fileError}</p>}
      </div>
    </div>
  );
}
