"use server";

const TELEGRAM_CHAT_ID = "-1003751675021";

export async function reportErrorToTelegram(params: {
  groupName: string;
  reason: string | null;
  messageText: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }

  const text = [
    "🔁 *דיווח ידני מהדשבורד*",
    `קבוצה: ${params.groupName}`,
    `סיבה: ${params.reason || "(לא צוינה סיבה)"}`,
    params.messageText ? `טקסט: ${params.messageText}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: body };
  }

  return { ok: true };
}
