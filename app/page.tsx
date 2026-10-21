import Link from "next/link";
import { BRAND } from "@/lib/brand";

const circles = [["💬", "#fff"], ["🍝", "#ff8fe0"], ["🎉", "#7de0b0"], ["🧢", "#c4b0ff"], ["💌", "#ffc900"], ["🟢", "#fff"], ["🕶️", "#ffa98a"]];
const faq = [
  ["מה קורה לצ'אט שלי?", "הקובץ נקרא בדפדפן שלכם. לשרת נשלח רק מדגם טקסט קצר וסטטיסטיקות כדי לכתוב את הדוח, והוא לא נשמר."],
  ["איך מייצאים צ'אט?", "ב-WhatsApp: פתחו צ'אט, ⋮ ← עוד ← ייצוא צ'אט ← ללא מדיה. ב-Instagram ו-Messenger: הורדת המידע שלכם בפורמט JSON."],
  ["כמה זה עולה?", "בגרסה הזאת, כלום."],
  ["האם הדוח מדויק?", "הוא נכתב על ידי AI מתוך מה שכתוב בצ'אט בלבד. קחו אותו בחיוך, לא כאבחנה."],
];

export default function Home() {
  return (
    <>
      <header className="bar">
        <Link href="/" aria-label={BRAND.name}><span className="avatar">🧢</span></Link>
        <Link href="/setup" className="btn">נסו עכשיו ←</Link>
      </header>
      <main>
        <section className="hero">
          <div className="circles" aria-hidden>{circles.map(([e, c]) => <span key={e} style={{ background: c }}>{e}</span>)}</div>
          <h1>העלו צ'אט. {BRAND.character} יגיד לכם מה באמת קורה.</h1>
          <p>{BRAND.character} קורא כל הודעה וכותב מה הוא באמת חושב על כל אחד שם.</p>
          <Link href="/setup" className="btn dark">נסו עכשיו ←</Link>
        </section>
        <section className="sec">
          <h2>מה אומרים עלינו</h2>
          <div className="grid3">
            {[["נועה", "כל הזמן רבנו על אותו דבר, רק עם סיבות חדשות. הדוח מצא את הדפוס: אני שותקת, הוא לוחץ.", "🔁 זוגיות"],
              ["איתי", "שישה חברים, 40 אלף הודעות. כל אחד קיבל פרס משלו. שלחנו לקבוצה והיה בלגן של שעה.", "😂 קבוצת חברים"],
              ["יונתן", "קבוצת המשפחה: בוקר טוב של אמא ואח שמתעלם מכולם. מצחיק, ואז עדין להפתיע.", "👵 משפחה"]].map(([n, t, g]) => (
              <div className="card" key={n}><div className="who">{n}</div><p>{t}</p><div className="tag">{g}</div></div>
            ))}
          </div>
        </section>
        <section className="sec faq">
          <h2>שאלות נפוצות</h2>
          {faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </section>
        <section className="hero" style={{ paddingTop: 20 }}>
          <h1>הצ'אט שלכם הבא בתור.</h1>
          <Link href="/setup" className="btn dark">נסו עכשיו ←</Link>
        </section>
      </main>
      <footer className="foot">© 2026 {BRAND.name}</footer>
    </>
  );
}
