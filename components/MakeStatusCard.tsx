import type { ScenarioStatus } from "@/lib/makeStatus";

export function MakeStatusCard({
  statuses,
  error,
}: {
  statuses: ScenarioStatus[];
  error: string | null;
}) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-sm font-medium text-[#52514e] mb-3">מצב Make</h2>
      {error ? (
        <p className="text-sm text-[#d03b3b]">לא הצלחתי לבדוק: {error}</p>
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {statuses.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 text-sm">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: s.isActive ? "#0ca30c" : "#d03b3b" }}
                title={s.isActive ? "פעיל" : "כבוי"}
              />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
