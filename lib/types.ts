export type Report = {
  headline: string; // punchy title with 1-2 emoji
  blurb: string; // one-line caption under the character card
  paragraphs: string[]; // the letter itself, first person, witty
  closing: string; // short sign-off line
  sections: { emoji: string; title: string; text: string }[]; // "עוד בפנים": 4 themed mini-sections
  members: { name: string; emoji: string; role: string; take: string }[]; // closer look at each person
};
export type Kind = "couple" | "friends" | "friend" | "family" | "work" | "other";
export type Platform = "whatsapp" | "imessage" | "instagram" | "messenger";

export const KINDS: { id: Kind; title: string; sub: string; emoji: string; color: string }[] = [
  { id: "couple", title: "זוגיות", sub: "בן/בת זוג, משהו לא מוגדר, אקס...", emoji: "💌", color: "#ff8fe0" },
  { id: "friends", title: "קבוצת חברים", sub: "חבר'ה מהתואר, קבוצת טיול, קבוצת ספורט...", emoji: "😂", color: "#ffc900" },
  { id: "friend", title: "חבר או חברה", sub: "בסטי, חברים מהילדות, חברים מהעבודה...", emoji: "🫶", color: "#7de0b0" },
  { id: "family", title: "משפחה", sub: "קבוצת המשפחה, אמא או אבא, אחים...", emoji: "🏡", color: "#ffa98a" },
  { id: "work", title: "עבודה / צוות", sub: "קבוצת הצוות, קולגות, הבוס...", emoji: "📋", color: "#8fa8f0" },
  { id: "other", title: "אחר", sub: "שותפים לדירה, שכנים, כל דבר אחר...", emoji: "🤷", color: "#c4b0ff" },
];
export const PLATFORMS: { id: Platform; title: string; emoji: string; hint: string; accept: string }[] = [
  { id: "whatsapp", title: "WhatsApp", emoji: "💬", accept: ".txt,.zip", hint: "בצ'אט: ⋮ ← עוד ← ייצוא צ'אט ← ללא מדיה. מעלים את קובץ ה-txt (או ה-zip)." },
  { id: "imessage", title: "iMessage", emoji: "🟢", accept: ".txt", hint: "ייצוא טקסט של השיחה (למשל מאפליקציית ייצוא ל-iMessage), בפורמט 'שם: הודעה'." },
  { id: "instagram", title: "Instagram", emoji: "📸", accept: ".json", hint: "הגדרות ← 'המידע שלך' ← הורדת המידע (JSON). מעלים את message_1.json של השיחה." },
  { id: "messenger", title: "Messenger", emoji: "🔵", accept: ".json", hint: "Facebook ← הורדת המידע שלך (JSON). מעלים את message_1.json של השיחה." },
];
