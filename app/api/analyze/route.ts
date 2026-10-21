import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { KINDS, type Report } from "@/lib/types";

export const maxDuration = 120;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), win = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
  win.push(now); hits.set(ip, win);
  return win.length > 6;
}

const SYSTEM = `אתה "${BRAND.character}", דמות AI חדה, מצחיקה ואנושית שקוראת צ'אטים וכותבת עליהם מכתב אישי בעברית.
כללים:
- כתוב בגוף ראשון, בעברית מדוברת וזורמת, בטון של חבר שאומר את האמת בחיוך: ישיר, שנון, ובסוף חם.
- הסתמך רק על מה שכתוב בצ'אט ובנתונים. אל תמציא אירועים, שמות או ציטוטים. ציטוט חייב להופיע בפועל בתמליל.
- התייחס לכל משתתף בשמו. תן לכל אחד תפקיד/פרס מצחיק, ותצביע על דפוס אמיתי (מי יוזם, מי נעלם, מי שולח הודעות לילה, שינוי לאורך זמן).
- אל תאבחן אנשים ואל תחרוץ גורל. אם יש כאב אמיתי בשיחה, היה עדין. אל תעודד התנהגות מזיקה.
- אורך: 6 עד 9 פסקאות קצרות-בינוניות. פתח בפנייה קולעת לקוראים, סיים בעצה או שורה חמה.
- "sections": בדיוק 4 מקטעים נוספים, כל אחד עם כותרת בסגנון "<שם קצר>: <שאלה או הבטחה>" ופסקה קצרה (2-3 משפטים). לדוגמה: מסדר זיהוי (מי אתם ומה הבעיה שלכם), ציר הרשע (אויבים או דמויות שמחוץ לקבוצה שחוזרות בשיחה), רגעי הזהב (שטויות שאי אפשר להמציא, עם ציטוט אמיתי), התחזית (איך זה ייגמר באמת). התאם את הכותרות לשיחה.
- "members": אובייקט לכל משתתף מהנתונים, עד 8: name כפי שמופיע בנתונים (בלי אימוג'י שבתוך השם), emoji אחד, role = כינוי קצר ומצחיק של 3-6 מילים לתפקיד האמיתי שלו בקבוצה, take = משפט אחד.
- אל תכלול בדוח קודים, סיסמאות, כתובות, מספרי טלפון או קישורים, גם אם הם מופיעים בצ'אט.
החזר JSON בלבד, בלי טקסט נוסף, במבנה: {"headline": string (כותרת חדה עם 1-2 אימוג'י), "blurb": string (שורה אחת מתחת לדמות), "paragraphs": string[], "closing": string, "sections": [{"emoji": string, "title": string, "text": string}], "members": [{"name": string, "emoji": string, "role": string, "take": string}]}`;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (limited(ip)) return NextResponse.json({ error: "יותר מדי בקשות. נסו שוב מאוחר יותר." }, { status: 429 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "השרת לא מוגדר (חסר ANTHROPIC_API_KEY)." }, { status: 500 });

  let body: { transcript?: string; stats?: unknown; kind?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "בקשה לא תקינה." }, { status: 400 }); }
  const transcript = String(body.transcript ?? "").slice(0, 80000);
  const kind = KINDS.find((k) => k.id === body.kind);
  if (transcript.length < 200 || !kind) return NextResponse.json({ error: "אין מספיק הודעות לניתוח." }, { status: 400 });

  const client = new Anthropic();
  try {
    const res = await client.messages.create({
      model: process.env.ANALYZE_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 4500,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `סוג הצ'אט: ${kind.title}\n\nנתונים סטטיסטיים (JSON):\n${JSON.stringify(body.stats)}\n\nתמליל (מדגם):\n${transcript}`,
      }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const r = JSON.parse(json) as Report;
    if (!r.headline || !Array.isArray(r.paragraphs)) throw new Error("bad shape");
    r.sections = Array.isArray(r.sections) ? r.sections : [];
    r.members = Array.isArray(r.members) ? r.members : [];
    return NextResponse.json(r); // nothing is stored
  } catch (e) {
    console.error("analyze failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "הניתוח נכשל. נסו שוב." }, { status: 502 });
  }
}
