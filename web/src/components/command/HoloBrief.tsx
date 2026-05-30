"use client";
// =====================================================================
// 羅德島總控 // HoloBrief.tsx —— 全息簡報開場（凱爾希）
// 純 React 19 / Next.js 16，無外部套件。立繪用 <img> props（figureSrc）。
// 樣式見 holo.css（基礎層）＋ blueprint-theme.css ⑨ 區（藍圖覆寫）。
// =====================================================================
import { useEffect, useRef, useState } from "react";
import "./holo.css";

export interface HoloBriefProps {
  /** 進行中專案數（台詞用） */
  activeCount: number;
  /** 7 天內到期數（台詞用） */
  due7Count: number;
  /** 逾期數，預設 0；>0 時台詞改成警示句 */
  overdueCount?: number;
  /** 戰備度 %，有給才多一句「本週戰備度 N%」 */
  readiness?: number;
  /** 同步日期字串（預設台詞沒用到，給自訂 lines 時可帶） */
  syncDate?: string;
  /** 凱爾希立繪去背 PNG（放 public/，例 /kaltsit.png）。不給則顯示青色剪影 */
  figureSrc?: string;
  /** 完全自訂台詞（含 <b> 高亮），給了就覆蓋預設台詞 */
  lines?: string[];
  /** localStorage key，預設 "rc_holo_seen"。想「每天一次」可帶日期 */
  storageKey?: string;
}

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "");

export default function HoloBrief({
  activeCount,
  due7Count,
  overdueCount = 0,
  readiness,
  syncDate,
  figureSrc,
  lines,
  storageKey = "rc_holo_seen",
}: HoloBriefProps) {
  const BRIEF_LINES =
    lines ??
    ([
      "歡迎回來，博士。",
      readiness != null ? `羅德島本週戰備度 <b>${readiness}%</b>。` : null,
      `<b>${activeCount}</b> 個專案進行中，<b>${due7Count}</b> 項在 7 天內到期。`,
      overdueCount > 0
        ? `注意：有 <b>${overdueCount}</b> 項逾期，請優先處理。`
        : "今日無逾期項目。請確認本週部署。",
    ].filter(Boolean) as string[]);

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [li, setLi] = useState(0);
  const [typed, setTyped] = useState("");
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.forEach((t) => window.clearInterval(t));
    timers.current = [];
  };

  const openBrief = () => {
    setLi(0);
    setTyped("");
    setOpen(true);
    requestAnimationFrame(() => setShow(true));
  };

  const closeBrief = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    setShow(false);
    timers.current.push(window.setTimeout(() => setOpen(false), 500));
  };

  // 第一次自動播；之後靠「重播簡報」
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {}
    if (!seen) openBrief();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // 打字機
  useEffect(() => {
    if (!open) return;
    const plain = stripTags(BRIEF_LINES[li] ?? "");
    let n = 0;
    setTyped("");
    const iv = window.setInterval(() => {
      n++;
      setTyped(plain.slice(0, n));
      if (n >= plain.length) {
        window.clearInterval(iv);
        timers.current.push(
          window.setTimeout(() => {
            if (li < BRIEF_LINES.length - 1) setLi(li + 1);
          }, 1100)
        );
      }
    }, 46);
    timers.current.push(iv);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [li, open]);

  const isLast = li >= BRIEF_LINES.length - 1;
  const fullPlain = stripTags(BRIEF_LINES[li] ?? "");
  const lineDone = typed.length === fullPlain.length;
  const display = lineDone ? BRIEF_LINES[li] ?? "" : typed;

  return (
    <>
      {open && (
        <div className={`holo ${show ? "show" : "hide"}`} role="dialog" aria-label="凱爾希簡報">
          <div className="holo-grid" />
          <div className="holo-stage">
            <div className={`holo-figure${figureSrc ? " filled" : ""}`}>
              <div className="holo-cone" />
              {figureSrc && <img className="holo-slot" src={figureSrc} alt="" draggable={false} />}
              <div className="holo-glitch" />
              <div className="tear" />
              <div className="silh" />
            </div>
            <div className="holo-base" />

            <div className="holo-dialog">
              <div className="holo-name">
                <span className="live-dot" />
                KAL&apos;TSIT // 凱爾希 · 全息簡報
              </div>
              <p
                className="holo-line"
                dangerouslySetInnerHTML={{
                  __html: display + (isLast && lineDone ? "" : '<span class="caret"></span>'),
                }}
              />
              <div className="holo-dots">
                {BRIEF_LINES.map((_, i) => (
                  <i key={i} className={i <= li ? "on" : ""} />
                ))}
              </div>
              <div className="holo-actions">
                {!isLast && (
                  <button className="btn ghost" onClick={() => setLi(BRIEF_LINES.length - 1)}>
                    略過
                  </button>
                )}
                <button className="btn primary" onClick={closeBrief}>
                  {isLast ? "進入總控 →" : "繼續 →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <button className="holo-replay" onClick={openBrief}>
          <span className="live-dot" />
          重播簡報
        </button>
      )}
    </>
  );
}
