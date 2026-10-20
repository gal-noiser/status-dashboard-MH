"use client";

import { useState, useTransition } from "react";
import { reportErrorToTelegram } from "@/lib/reportError";

export function ReportErrorButton({
  groupName,
  reason,
  messageText,
}: {
  groupName: string;
  reason: string | null;
  messageText: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState<"idle" | "ok" | "error">("idle");

  return (
    <button
      type="button"
      disabled={isPending || sent === "ok"}
      onClick={() =>
        startTransition(async () => {
          const result = await reportErrorToTelegram({ groupName, reason, messageText });
          setSent(result.ok ? "ok" : "error");
        })
      }
      className="mt-2 w-full rounded border border-black/10 px-2 py-1 text-[11px] font-medium text-[#52514e] hover:bg-black/5 disabled:opacity-60"
    >
      {sent === "ok" ? "✓ נשלח" : sent === "error" ? "שגיאה — נסי שוב" : isPending ? "שולח..." : "שלחי לערוץ השגיאות"}
    </button>
  );
}
