"use client";

import { useState } from "react";
import type { DayStatusBucket } from "@/lib/log";

const CATEGORICAL = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#6250d6", // violet
  "#e34948", // red
];

const MUTED = "#898781";
const GRID = "#e1e0d9";
const TEXT_SECONDARY = "#52514e";

export function StatusTrendChart({
  data,
  statuses,
}: {
  data: DayStatusBucket[];
  statuses: string[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const colorFor = (status: string) =>
    CATEGORICAL[statuses.indexOf(status) % CATEGORICAL.length];

  const width = 720;
  const height = 220;
  const padLeft = 32;
  const padBottom = 24;
  const padTop = 12;
  const plotW = width - padLeft - 8;
  const plotH = height - padTop - padBottom;

  const totals = data.map((d) =>
    Object.values(d.counts).reduce((a, b) => a + b, 0)
  );
  const max = Math.max(1, ...totals);
  const barW = plotW / data.length;

  return (
    <div className="viz-root relative">
      {statuses.length > 1 && (
        <div className="flex flex-wrap gap-3 mb-3 text-xs" style={{ color: TEXT_SECONDARY }}>
          {statuses.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: colorFor(s) }}
              />
              {s}
            </span>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="נפח בדיקות לפי יום וסטטוס"
      >
        {[0, 0.5, 1].map((t) => {
          const y = padTop + plotH * (1 - t);
          return (
            <line key={t} x1={padLeft} x2={width - 8} y1={y} y2={y} stroke={GRID} strokeWidth={1} />
          );
        })}
        <text x={4} y={padTop + 4} fontSize={11} fill={MUTED}>
          {max}
        </text>
        <text x={4} y={padTop + plotH + 4} fontSize={11} fill={MUTED}>
          0
        </text>

        {data.map((d, i) => {
          const x = padLeft + i * barW + barW * 0.2;
          const barWidth = barW * 0.6;
          let yCursor = padTop + plotH;
          const isHover = hover === i;
          const showLabel = i % Math.ceil(data.length / 7) === 0;

          return (
            <g key={d.date}>
              {statuses.map((s) => {
                const count = d.counts[s] ?? 0;
                if (count === 0) return null;
                const h = (count / max) * plotH;
                yCursor -= h;
                return (
                  <rect
                    key={s}
                    x={x}
                    y={yCursor}
                    width={barWidth}
                    height={h}
                    fill={colorFor(s)}
                    opacity={isHover ? 1 : 0.88}
                  />
                );
              })}
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
          {Object.entries(data[hover].counts).map(([s, c]) => (
            <div key={s}>
              {s}: {c}
            </div>
          ))}
          {Object.keys(data[hover].counts).length === 0 && <div>אין נתונים</div>}
        </div>
      )}
    </div>
  );
}
