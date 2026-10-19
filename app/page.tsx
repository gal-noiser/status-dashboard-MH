import {
  dailyStatusTrend,
  distinctStatuses,
  fetchLog,
  recentMessages,
  statusBreakdown,
} from "@/lib/log";
import { RefreshButton } from "@/components/RefreshButton";
import { StatusTrendChart } from "@/components/StatusTrendChart";

export const dynamic = "force-dynamic";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white px-5 py-4 flex-1 min-w-[160px] border-t-4 border-t-[#1565d8]">
      <div className="text-sm text-[#52514e]">{label}</div>
      <div className="text-3xl font-semibold mt-1 text-[#0b0b0b]">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isCompleted = status === "Completed";
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: isCompleted ? "#0ca30c1a" : "#d03b3b1a",
        color: isCompleted ? "#0ca30c" : "#d03b3b",
      }}
    >
      {status}
    </span>
  );
}

export default async function DashboardPage() {
  let error: string | null = null;
  let feed: Awaited<ReturnType<typeof fetchLog>> = {
    rows: [],
    groupNames: new Map(),
  };

  try {
    feed = await fetchLog();
  } catch (e) {
    error = e instanceof Error ? e.message : "שגיאה לא ידועה";
  }

  const { rows, groupNames } = feed;
  const statuses = statusBreakdown(rows);
  const messages = recentMessages(rows, groupNames, 5);
  const trend = dailyStatusTrend(rows, 14);
  const allStatuses = distinctStatuses(rows);
  const lastRefreshed = new Date().toLocaleString("he-IL");

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <header
        className="flex items-center justify-between gap-4 rounded-xl px-6 py-5 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #1565d8 0%, #0d47a1 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="המבזק החברתי"
            className="h-14 w-14 rounded-lg object-cover shadow-sm shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold leading-tight">
              המבזק החברתי — סטטוס הודעות
            </h1>
            <p className="text-xs text-white/70 mt-0.5">
              הסטטוס שביקון מחזיר לכל הודעה, לפי קבוצה
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <RefreshButton />
          <span className="text-[11px] text-white/60">
            ריענון אחרון: {lastRefreshed}
          </span>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-[#d03b3b]/30 bg-[#d03b3b]/5 text-[#d03b3b] px-4 py-3 text-sm">
          לא הצלחתי לשלוף נתונים מה-webhook: {error}
        </div>
      )}

      <section className="flex flex-wrap gap-4">
        <StatTile label="סה״כ נבדקו" value={String(rows.length)} />
        {statuses.map((s) => (
          <StatTile key={s.status} label={s.status} value={String(s.count)} />
        ))}
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="text-sm font-medium text-[#52514e] mb-3">
          נפח בדיקות לפי יום — 14 הימים האחרונים
        </h2>
        <StatusTrendChart data={trend} statuses={allStatuses} />
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="text-sm font-medium text-[#52514e] mb-4">
          5 ההודעות האחרונות
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-[#898781]">אין עדיין נתונים.</p>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (
              <div
                key={m.message_id}
                className="border-b border-black/5 last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-xs text-[#898781]">
                    {m.source} · {new Date(m.timestamp).toLocaleString("he-IL")}
                  </div>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {m.text ?? <span className="text-[#898781]">(אין טקסט רשום)</span>}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.groups.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-md border border-black/10 px-2 py-1"
                    >
                      <span className="text-[11px] font-medium text-[#52514e]">
                        {g.group_name}
                      </span>
                      <StatusPill status={g.result} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
