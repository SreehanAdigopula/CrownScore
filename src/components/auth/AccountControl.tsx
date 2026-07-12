"use client";

import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function AccountControl({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <span className="h-10 w-24 animate-pulse rounded-2xl bg-muted" />;
  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <span className="hidden max-w-40 truncate text-xs font-bold text-muted-foreground sm:block">
          {session.user.name || session.user.email}
        </span>
      )}
      <button
        type="button"
        aria-label="Sign out"
        title="Sign out"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        }}
        className="grid size-10 place-items-center rounded-2xl text-muted-foreground transition hover:text-foreground neu-inset neu-focus"
      >
        {compact ? <UserRound className="size-4" /> : <LogOut className="size-4" />}
      </button>
    </div>
  );
}
