import type { Msg } from "./parse";

export type PersonStats = {
  name: string; messages: number; share: number; avgWords: number;
  initiated: number; medianReplyMin: number | null; lateNight: number; questions: number; topEmoji: string[];
};
export type ChatStats = { total: number; days: number; first: number; last: number; people: PersonStats[] };

const EMOJI = /\p{Extended_Pictographic}/gu;
const GAP = 6 * 3600_000; // a new "conversation" starts after 6h of silence

export function computeStats(msgs: Msg[], maxPeople = 8): ChatStats {
  const by = new Map<string, Msg[]>();
  for (const m of msgs) (by.get(m.from) ?? by.set(m.from, []).get(m.from)!).push(m);
  const names = [...by.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, maxPeople).map(([n]) => n);
  const init = new Map<string, number>(), replies = new Map<string, number[]>();
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1];
    if (!prev || m.t - prev.t > GAP) init.set(m.from, (init.get(m.from) ?? 0) + 1);
    else if (prev.from !== m.from) (replies.get(m.from) ?? replies.set(m.from, []).get(m.from)!).push((m.t - prev.t) / 60000);
  });
  const people = names.map((name) => {
    const ms = by.get(name)!;
    const em = new Map<string, number>();
    let words = 0, late = 0, q = 0;
    for (const m of ms) {
      words += m.text.split(/\s+/).length;
      const h = new Date(m.t).getHours(); if (h >= 0 && h < 5) late++;
      if (m.text.includes("?")) q++;
      for (const e of m.text.match(EMOJI) ?? []) em.set(e, (em.get(e) ?? 0) + 1);
    }
    const r = (replies.get(name) ?? []).sort((a, b) => a - b);
    return {
      name, messages: ms.length, share: ms.length / msgs.length, avgWords: +(words / ms.length).toFixed(1),
      initiated: init.get(name) ?? 0, medianReplyMin: r.length ? +r[Math.floor(r.length / 2)].toFixed(1) : null,
      lateNight: late, questions: q, topEmoji: [...em.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e),
    };
  });
  const first = msgs[0].t, last = msgs[msgs.length - 1].t;
  return { total: msgs.length, days: Math.max(1, Math.round((last - first) / 86400000)), first, last, people };
}

// Compact transcript for the model: whole chat if short, else evenly spread windows plus the most recent messages.
export function buildTranscript(msgs: Msg[], budgetChars = 60000): string {
  const fmt = (m: Msg) => `${new Date(m.t).toISOString().slice(0, 10)} ${m.from}: ${m.text.slice(0, 280)}`;
  const all = msgs.map(fmt);
  if (all.join("\n").length <= budgetChars) return all.join("\n");
  const recent = all.slice(-Math.floor(all.length * 0.0) - 300);
  const rest = all.slice(0, all.length - recent.length);
  const win = 25, n = Math.max(1, Math.floor((budgetChars * 0.65) / (win * 70)));
  const picked: string[] = [];
  for (let i = 0; i < n; i++) {
    const s = Math.floor((i * (rest.length - win)) / Math.max(1, n - 1));
    picked.push(`--- קטע ${i + 1} ---`, ...rest.slice(Math.max(0, s), s + win));
  }
  picked.push("--- הודעות אחרונות ---", ...recent);
  return picked.join("\n").slice(0, budgetChars);
}
