"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import { BRAND } from "@/lib/brand";
import { KINDS, PLATFORMS, type Kind, type Platform, type Report } from "@/lib/types";
import { parseByPlatform, senders } from "@/lib/parse";
import { buildTranscript, computeStats } from "@/lib/stats";

async function readFile(f: File): Promise<string> {
  if (!f.name.toLowerCase().endsWith(".zip")) return f.text();
  const zip = await JSZip.loadAsync(await f.arrayBuffer());
  const entry = Object.values(zip.files).find((e) => !e.dir && e.name.toLowerCase().endsWith(".txt"));
  if (!entry) throw new Error("לא נמצא קובץ txt בתוך ה-zip.");
  return entry.async("string");
}

export default function Setup() {
  const [kind, setKind] = useState<Kind>();
  const [platform, setPlatform] = useState<Platform>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [report, setReport] = useState<Report>();
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const plat = PLATFORMS.find((p) => p.id === platform);

  async function run(f: File) {
    if (!kind || !platform) return;
    setErr(""); setBusy(true);
    try {
      const msgs = parseByPlatform(platform, await readFile(f));
      if (msgs.length < 30) throw new Error("לא הצלחנו לקרוא מספיק הודעות מהקובץ. ודאו שזה הייצוא הנכון.");
      const names = senders(msgs);
      if (names.length < 2) throw new Error("מצאנו משתתף אחד בלבד בקובץ.");
      const stats = computeStats(msgs);
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, stats, transcript: buildTranscript(msgs) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "שגיאה");
      setReport(j);
    } catch (e) { setErr(e instanceof Error ? e.message : "שגיאה לא צפויה"); }
    setBusy(false);
  }

  if (busy) return <div className="loading"><div className="spin" />{BRAND.character} קורא את כל ההודעות...</div>;

  if (report) return (
    <>
      <header className="bar"><button className="btn" onClick={() => { setReport(undefined); setKind(undefined); setPlatform(undefined); }}>ניתוח צ'אט נוסף +</button><Link href="/" className="avatar">🧢</Link></header>
      <article className="report">
        <h1>{report.headline}</h1>
        <div className="who-card"><span className="avatar">🧢</span><div><b>{BRAND.character}</b><div className="note" style={{ margin: 0 }}>{report.blurb}</div></div></div>
        <button className="btn ghost" style={{ width: "100%", justifyContent: "center" }}
          onClick={() => { const t = `${report.headline}\n\n${report.paragraphs.join("\n\n")}\n\n${report.closing}`; navigator.share ? navigator.share({ text: t }).catch(() => {}) : navigator.clipboard.writeText(t); }}>
          שיתוף הדוח
        </button>
        <div className="privacy">🛡️ הצ'אט המלא נקרא רק בדפדפן שלכם, ולשרת נשלח מדגם בלבד שלא נשמר.</div>
        {report.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <p><b>{report.closing}</b></p>
        {report.sections.length > 0 && (<section className="list"><h3>עוד בפנים:</h3>
          {report.sections.map((x, i) => <details key={i}><summary><span aria-hidden>{x.emoji}</span> {x.title}</summary><p>{x.text}</p></details>)}</section>)}
        {report.members.length > 0 && (<section className="list"><h3>מבט מקרוב על כל אחד</h3>
          {report.members.map((m, i) => <details key={i}><summary><span aria-hidden>{m.emoji}</span> {m.role} — {m.name}</summary><p>{m.take}</p></details>)}</section>)}
      </article>
    </>
  );

  return (
    <>
      <header className="bar"><Link href="/" className="avatar">🧢</Link><span /></header>
      <div className="wrap">
        {!kind && (<><h2>איזה צ'אט תרצו ש{BRAND.character} ינתח?</h2>
          {KINDS.map((k) => (
            <button key={k.id} className="opt" onClick={() => setKind(k.id)}>
              <span className="ic" style={{ background: k.color }}>{k.emoji}</span><span><b>{k.title}</b><small>{k.sub}</small></span>
            </button>))}</>)}
        {kind && !platform && (<><h2>מאיפה הצ'אט שלכם?</h2>
          {PLATFORMS.map((p) => (
            <button key={p.id} className="opt" onClick={() => setPlatform(p.id)}>
              <span className="ic" style={{ background: "#f3f3f3" }}>{p.emoji}</span><b>{p.title}</b>
            </button>))}
          <button className="btn ghost" onClick={() => setKind(undefined)}>חזרה</button></>)}
        {kind && plat && (<><h2>העלו את קובץ ה-{plat.title}</h2>
          <div className={`drop${drag ? " on" : ""}`} role="button" tabIndex={0}
            onClick={() => input.current?.click()} onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) run(f); }}>
            גררו לכאן קובץ או לחצו לבחירה
            <input ref={input} type="file" accept={plat.accept} hidden onChange={(e) => e.target.files?.[0] && run(e.target.files[0])} />
          </div>
          <p className="note">{plat.hint}</p>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn ghost" onClick={() => setPlatform(undefined)}>חזרה</button></>)}
      </div>
    </>
  );
}
