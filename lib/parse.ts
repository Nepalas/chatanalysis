export type Msg = { t: number; from: string; text: string };

// WhatsApp Android: "12/03/2024, 14:05 - Name: text"   iOS: "[12/03/2024, 14:05:33] Name: text"
const WA = /^[‎‏]*\[?(\d{1,4})[./-](\d{1,2})[./-](\d{1,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M|am|pm)?\]?\s*(?:-\s*)?([^:]{1,60}?):\s([\s\S]*)$/;
const SYSTEM = /(<attached: |changed this group|changed the group|created group|disappearing messages|<This message was edited>|הצפנה מקצה|end-to-end|<Media omitted>|<המדיה הושמטה>|image omitted|תמונה הושמטה|omitted$)/i;

function toTime(a: number, b: number, c: number, h: number, m: number, ap?: string): number {
  // decide day/month order: a value >12 reveals it; default day-first (most of the world)
  let y = c, d = a, mo = b;
  if (a > 31) { y = a; mo = b; d = c; }
  else if (b > 12 && a <= 12) { mo = a; d = b; }
  if (y < 100) y += 2000;
  let hh = h;
  if (ap) { const pm = /pm/i.test(ap); if (pm && hh < 12) hh += 12; if (!pm && hh === 12) hh = 0; }
  return new Date(y, mo - 1, d, hh, m).getTime();
}

export function parseChat(raw: string): Msg[] {
  const lines = raw.replace(/\r/g, "").split("\n");
  const out: Msg[] = [];
  for (const line of lines) {
    const m = WA.exec(line);
    if (m) {
      const text = m[8].replace(/[\u200e\u200f]/g, "").trim();
      out.push({ t: toTime(+m[1], +m[2], +m[3], +m[4], +m[5], m[6]), from: m[7].replace(/[\u200e\u200f]/g, "").trim(), text });
    } else if (out.length && line.trim()) {
      out[out.length - 1].text += "\n" + line.trim(); // multi-line message
    }
  }
  return out.filter((x) => x.text && !SYSTEM.test(x.text) && !Number.isNaN(x.t));
}

export function senders(msgs: Msg[]): string[] {
  const c = new Map<string, number>();
  for (const m of msgs) c.set(m.from, (c.get(m.from) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
}

// Instagram / Messenger "Download your information" JSON. Meta writes UTF-8 bytes as latin1 escapes, so fix that.
const fixMojibake = (s: string) => {
  try { return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(s, (c) => c.charCodeAt(0))); } catch { return s; }
};
export function parseMetaJson(raw: string): Msg[] {
  const j = JSON.parse(raw) as { messages?: { sender_name?: string; timestamp_ms?: number; content?: string }[] };
  return (j.messages ?? [])
    .filter((m) => m.content && m.sender_name && m.timestamp_ms)
    .map((m) => ({ t: m.timestamp_ms!, from: fixMojibake(m.sender_name!), text: fixMojibake(m.content!) }))
    .sort((a, b) => a.t - b.t);
}

// Fallback for plain exports without timestamps we recognise: "Name: text" per line (time = line order).
export function parseSimple(raw: string): Msg[] {
  const out: Msg[] = [];
  raw.replace(/\r/g, "").split("\n").forEach((l, i) => {
    const m = /^([^:\n]{1,40}):\s(.+)$/.exec(l);
    if (m) out.push({ t: i * 60000, from: m[1].trim(), text: m[2].trim() });
  });
  return out;
}

export function parseByPlatform(platform: string, raw: string): Msg[] {
  if (platform === "instagram" || platform === "messenger") return parseMetaJson(raw);
  const a = parseChat(raw);
  return a.length >= 5 ? a : parseSimple(raw);
}
