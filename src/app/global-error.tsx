"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-4 bg-[#e0e5ec] p-6 text-center text-[#3d4852]">
        <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-[#6b7280]">CrownScore hit an unexpected error. You can retry or return to the dashboard.</p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
