import { dailyTrend, fetchLog, recentFailures, summarize } from "@/lib/log";
import { FailureTrendChart } from "@/components/FailureTrendChart";

export const dynamic = "force-dynamic";

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "critical";
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white px-5 py-4 flex-1 min-w-[160px]">
      <div className="text-sm text-[#52514e]">{label}</div>
      <div
        className="text-3xl font-semibold mt-1"
        style={{ color: tone === "critical" ? "#d03b3b" : "#0b0b0b" }}
      >
        {value}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  let error: string | null = null;
  let rows: Awaited<ReturnType<typeof fetchLog>> = [];

  try {
    rows = await fetchLog();
  } catch (e) {
    error = e instanceof Error ? e.message : "שגיאה לא ידועה";
  }

  const { checked, failed, failureRate } = summarize(rows);
  const trend = dailyTrend(rows, 14);
  const failures = recentFailures(rows, 25);

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">סטטוס הודעות — כשלים שקטים</h1>
        <p className="text-sm text-[#52514e] mt-1">
          המבזק החברתי (Beacon) · הודעות WhatsApp שביקון החזיר עליהן הצלחה אך לא הגיעו בפועל
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-[#d03b3b]/30 bg-[#d03b3b]/5 text-[#d03b3b] px-4 py-3 text-sm">
          לא הצלחתי לשלוף נתונים מה-webhook: {error}
        </div>
      )}

      <section className="flex flex-wrap gap-4">
        <StatTile label="סה״כ נבדקו" value={String(checked)} />
        <StatTile
          label="כשלים שקטים"
          value={String(failed)}
          tone={failed > 0 ? "critical" : "default"}
        />
        <StatTile
          label="שיעור כשל"
          value={`${(failureRate * 100).toFixed(1)}%`}
          tone={failureRate > 0 ? "critical" : "default"}
        />
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="text-sm font-medium text-[#52514e] mb-3">
          כשלים ליום — 14 הימים האחרונים
        </h2>
        <FailureTrendChart data={trend} />
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="text-sm font-medium text-[#52514e] mb-3">כשלים אחרונים</h2>
        {failures.length === 0 ? (
          <p className="text-sm text-[#898781]">אין כשלים רשומים.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-black/10 text-[#898781]">
                  <th className="py-2 font-normal">זמן</th>
                  <th className="py-2 font-normal">מקור</th>
                  <th className="py-2 font-normal">קבוצה</th>
                  <th className="py-2 font-normal">סיבה</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((f, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-2 whitespace-nowrap">
                      {new Date(f.timestamp).toLocaleString("he-IL")}
                    </td>
                    <td className="py-2">{f.source}</td>
                    <td className="py-2 font-mono text-xs">{f.group_id}</td>
                    <td className="py-2">{f.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
