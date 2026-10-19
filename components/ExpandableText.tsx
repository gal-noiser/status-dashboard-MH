"use client";

import { useState } from "react";

const TRUNCATE_AT = 180;

export function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= TRUNCATE_AT) {
    return <p className="text-sm mt-1 whitespace-pre-wrap">{text}</p>;
  }

  return (
    <p className="text-sm mt-1 whitespace-pre-wrap">
      {expanded ? text : `${text.slice(0, TRUNCATE_AT)}…`}{" "}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-[#1565d8] text-xs font-medium hover:underline"
      >
        {expanded ? "הצג פחות" : "קרא עוד"}
      </button>
    </p>
  );
}
