export type LogRow = {
  timestamp: string;
  source: string;
  message_id: string;
  group_id: string;
  result: string;
  reason: string | null;
};

export type DayBucket = {
  date: string; // YYYY-MM-DD
  checked: number;
  failed: number;
};

const WEBHOOK_URL = "https://hook.eu2.make.com/okxipu2auc4c3l2b8bkxqlspd3wweuxk";

export async function fetchLog(): Promise<LogRow[]> {
  const res = await fetch(WEBHOOK_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Log feed failed: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data as LogRow[];
}

export function isFailure(row: LogRow): boolean {
  return row.result !== "Completed";
}

export function summarize(rows: LogRow[]) {
  const checked = rows.length;
  const failed = rows.filter(isFailure).length;
  return {
    checked,
    failed,
    failureRate: checked === 0 ? 0 : failed / checked,
  };
}

export function dailyTrend(rows: LogRow[], days = 14): DayBucket[] {
  const buckets = new Map<string, DayBucket>();
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, checked: 0, failed: 0 });
  }

  for (const row of rows) {
    const key = row.timestamp?.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.checked += 1;
    if (isFailure(row)) bucket.failed += 1;
  }

  return Array.from(buckets.values());
}

export function recentFailures(rows: LogRow[], limit = 20): LogRow[] {
  return rows
    .filter(isFailure)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);
}
