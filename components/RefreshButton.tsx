"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  return (
    <button
      onClick={() => {
        setSpinning(true);
        router.refresh();
        setTimeout(() => setSpinning(false), 600);
      }}
      className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition shrink-0"
    >
      <span className={spinning ? "animate-spin" : ""}>↻</span>
      רענון
    </button>
  );
}
