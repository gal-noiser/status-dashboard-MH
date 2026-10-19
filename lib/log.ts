export type LogRow = {
  timestamp: string;
  source: string;
  message_id: string;
  group_id: string;
  result: string;
  reason: string | null;
  text: string | null;
};

export type StatusCount = {
  status: string;
  count: number;
};

export type MessageGroup = {
  group_id: string;
  result: string;
};

export type MessageSummary = {
  message_id: string;
  text: string | null;
  source: string;
  timestamp: string;
  groups: MessageGroup[];
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

export function statusBreakdown(rows: LogRow[]): StatusCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = row.result ?? "(ללא סטטוס)";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export type DayStatusBucket = {
  date: string; // YYYY-MM-DD
  counts: Record<string, number>;
};

export function distinctStatuses(rows: LogRow[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    seen.add(row.result ?? "(ללא סטטוס)");
  }
  return Array.from(seen);
}

export function dailyStatusTrend(rows: LogRow[], days = 14): DayStatusBucket[] {
  const buckets = new Map<string, DayStatusBucket>();
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, counts: {} });
  }

  for (const row of rows) {
    const key = row.timestamp?.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const status = row.result ?? "(ללא סטטוס)";
    bucket.counts[status] = (bucket.counts[status] ?? 0) + 1;
  }

  return Array.from(buckets.values());
}

export function recentMessages(rows: LogRow[], limit = 5): MessageSummary[] {
  const byMessage = new Map<string, LogRow[]>();
  for (const row of rows) {
    const list = byMessage.get(row.message_id) ?? [];
    list.push(row);
    byMessage.set(row.message_id, list);
  }

  const summaries: MessageSummary[] = Array.from(byMessage.entries()).map(
    ([message_id, group_rows]) => {
      const latest = group_rows.reduce((a, b) =>
        a.timestamp > b.timestamp ? a : b
      );
      return {
        message_id,
        text: group_rows.find((r) => r.text)?.text ?? null,
        source: latest.source,
        timestamp: latest.timestamp,
        groups: group_rows.map((r) => ({
          group_id: r.group_id,
          result: r.result,
        })),
      };
    }
  );

  return summaries
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);
}
