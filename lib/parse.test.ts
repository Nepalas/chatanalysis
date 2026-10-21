import { expect, test } from "bun:test";
import { parseChat, senders } from "./parse";
import { computeStats } from "./stats";

test("parses Android and iOS WhatsApp lines incl. multi-line", () => {
  const raw = [
    "12/03/2024, 14:05 - דנה: היי",
    "מה קורה?",
    "[12/03/2024, 14:06:10] יוסי: הכל טוב 😂",
    "12/03/2024, 23:59 - דנה: <Media omitted>",
    "13/03/2024, 09:00 - יוסי: בוקר?",
  ].join("\n");
  const m = parseChat(raw);
  expect(m.length).toBe(3);
  expect(m[0].text).toBe("היי\nמה קורה?");
  expect(senders(m)).toContain("יוסי");
  const s = computeStats(m);
  expect(s.people.length).toBe(2);
});
