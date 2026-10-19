export type ScenarioStatus = {
  id: number;
  name: string;
  isActive: boolean;
};

const MAKE_BASE = "https://eu2.make.com/api/v2";

const WATCHED_SCENARIOS = [
  { id: 8281393, name: "בוט הפצה" },
  { id: 9428733, name: "בוט תרגום" },
  { id: 9951823, name: "סטטוס הודעות V2" },
];

export async function fetchMakeStatus(): Promise<ScenarioStatus[]> {
  const token = process.env.MAKE_API_TOKEN;
  if (!token) {
    throw new Error("MAKE_API_TOKEN not configured");
  }

  const results = await Promise.all(
    WATCHED_SCENARIOS.map(async (s) => {
      const res = await fetch(`${MAKE_BASE}/scenarios/${s.id}`, {
        headers: { Authorization: `Token ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        return { id: s.id, name: s.name, isActive: false };
      }
      const data = await res.json();
      return {
        id: s.id,
        name: s.name,
        isActive: Boolean(data?.scenario?.isActive),
      };
    })
  );

  return results;
}
