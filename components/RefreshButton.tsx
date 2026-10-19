"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition shrink-0 disabled:opacity-60"
    >
      <span className={isPending ? "animate-spin" : ""}>↻</span>
      {isPending ? "מרענן..." : "רענון"}
    </button>
  );
}
