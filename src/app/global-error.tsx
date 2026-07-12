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
      <body className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-4 bg-[#e6ebe9] p-6 text-center text-[#111916]">
        <h1 className="font-heading text-2xl tracking-tight">Something went wrong</h1>
        <p className="text-sm text-[#5a6963]">CrownScore hit an unexpected error. You can retry or return to the dashboard.</p>
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
