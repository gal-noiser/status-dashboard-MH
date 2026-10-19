"use client";

import { useState } from "react";
import type { DayBucket } from "@/lib/log";

const CRITICAL = "#d03b3b";
const MUTED = "#898781";
const GRID = "#e1e0d9";
const TEXT_SECONDARY = "#52514e";

export function FailureTrendChart({ data }: { data: DayBucket[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const width = 720;
  const height = 220;
  const padLeft = 32;
  const padBottom = 24;
  const padTop = 12;
  const plotW = width - padLeft - 8;
  const plotH = height - padTop - padBottom;

  const max = Math.max(1, ...data.map((d) => d.failed));
  const barW = plotW / data.length;

  return (
    <div className="viz-root relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="כשלים שקטים לפי יום"
      >
        {[0, 0.5, 1].map((t) => {
          const y = padTop + plotH * (1 - t);
          return (
            <line
              key={t}
              x1={padLeft}
              x2={width - 8}
              y1={y}
              y2={y}
              stroke={GRID}
              strokeWidth={1}
            />
          );
        })}
        <text x={4} y={padTop + 4} fontSize={11} fill={MUTED}>
          {max}
        </text>
        <text x={4} y={padTop + plotH + 4} fontSize={11} fill={MUTED}>
          0
        </text>

        {data.map((d, i) => {
          const h = (d.failed / max) * plotH;
          const x = padLeft + i * barW + barW * 0.2;
          const y = padTop + plotH - h;
          const isHover = hover === i;
          const showLabel = i % Math.ceil(data.length / 7) === 0;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barW * 0.6}
                height={Math.max(h, d.failed > 0 ? 2 : 0)}
                rx={4}
                fill={CRITICAL}
                opacity={isHover ? 1 : 0.85}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={padLeft + i * barW}
                y={padTop}
                width={barW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              {showLabel && (
                <text
                  x={padLeft + i * barW + barW / 2}
                  y={height - 6}
                  fontSize={10}
                  fill={MUTED}
                  textAnchor="middle"
                >
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute rounded-md border px-2 py-1 text-xs shadow-sm"
          style={{
            background: "#fcfcfb",
            borderColor: "rgba(11,11,11,0.10)",
            color: TEXT_SECONDARY,
            left: `${((hover + 0.5) / data.length) * 100}%`,
            top: 0,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-medium" style={{ color: "#0b0b0b" }}>
            {data[hover].date}
          </div>
          <div>כשלים: {data[hover].failed}</div>
          <div>נבדקו: {data[hover].checked}</div>
        </div>
      )}
    </div>
  );
}
