"use client";
// =====================================================================
// 羅德島總控 // RhodesCommand.tsx —— 元件本體（單檔，含環/總覽/幹員）
// props: { data?: RhodesData }  未傳則用內建假資料 RHODES_DATA
// 含主題切換：暗色先鋒 ⇄ 亮白藍圖（寫入 <html data-theme>，存 localStorage）
// =====================================================================
import { useEffect, useState, type CSSProperties, type HTMLAttributes, type FC } from "react";
import { RHODES_DATA, type RhodesData } from "./data";
import HoloBrief from "./HoloBrief";
import "./rhodes-command.css";

type Theme = "vanguard" | "blueprint";

// image-slot.js 提供的 web component（在 public/，由 layout 載入）。
// 用有型別的字串標籤包裝，避免依賴全域 JSX 宣告。
const ImageSlot = "image-slot" as unknown as FC<
  HTMLAttributes<HTMLElement> & { shape?: string; placeholder?: string }
>;

/** 空值判斷：null / 空字串 / 破折號都算空 */
const isEmptyVal = (v?: string | null) =>
  v == null || v === "" || v === "—" || v === "-";

/* 完成度環 */
function Ring({ p, size = 148, big = 32 }: { p: number; size?: number; big?: number }) {
  return (
    <div className="rc-ring" style={{ "--p": p, width: size } as CSSProperties}>
      <div className="dial" />
      <div className="ticks" />
      <div className="val"><b style={{ fontSize: big }}>{p}%</b></div>
    </div>
  );
}

/* 作戰總覽 */
function Overview({ data: D }: { data: RhodesData }) {
  const s = D.stats;
  return (
    <div className="fadein">
      <div className="ov-top">
        <div className="panel hud is-accent ringcard ix">
          <span className="sheen" />
          <Ring p={s.readiness} size={120} big={26} />
          <div className="meta">
            <b>平均完成度</b><br />
            {D.stats.total} 個專案 · 進行中 {s.active}<br />
            基準日 <span style={{ whiteSpace: "nowrap" }}>{D.syncDate}</span>
          </div>
        </div>
        <div className="panel cut kpi ix"><span className="sheen" /><div className="idx">// 0x01</div><div className="num">{s.total}</div><div className="lbl">專案數</div></div>
        <div className="panel cut kpi ix"><span className="sheen" /><div className="idx">// 0x02</div><div className="num" style={{ color: "var(--color-cyan)" }}>{s.active}</div><div className="lbl">進行中</div></div>
        <div className="panel cut kpi ix"><span className="sheen" /><div className="idx">// 0x03</div><div className="num">{s.overdue}</div><div className="lbl">逾期提醒</div></div>
        <div className="panel cut kpi ix"><span className="sheen" /><div className="idx">// 0x04</div><div className="num" style={{ color: "var(--color-accent)" }}>{D.due7}</div><div className="lbl">7 天內期限</div></div>
      </div>

      <div className="sect">
        <span className="ghost-title">Ops</span>
        <div className="sec-head"><span className="bar" /><h2>作戰專案</h2><span className="en">OPERATIONS</span></div>
        <div className="proj-grid">
          {D.projects.map((p) => (
            <div key={p.code} className="panel pcard ix">
              <span className="sheen" />
              <div className="topline accent" />
              <div className="ptop">
                <div className="client"><span className="glyph">{p.tag}</span>{p.client}</div>
                <div className="prio"><span className="dot" />{p.priority}</div>
              </div>
              <div className="pcode">{p.code}</div>
              <h3>{p.title}</h3>
              <span className="tag active">{p.status}</span>
              <div className="pbarlbl">完成度 {p.progress}%（估）</div>
              <div className="bar"><i style={{ width: `${p.progress}%` }} /></div>
              {(() => {
                const noNext = isEmptyVal(p.next);
                const noLaunch = isEmptyVal(p.launch);
                if (noNext && noLaunch) return null; // 兩者皆空 → 整列收掉
                return (
                  <div className="keyrow">
                    <span className={noNext ? "kv-empty" : ""}>下個關鍵 <b>{noNext ? "—" : p.next}</b></span>
                    <span className={noLaunch ? "kv-empty" : ""}>上線 <b>{noLaunch ? "—" : p.launch}</b></span>
                  </div>
                );
              })()}
              {isEmptyVal(p.pin) ? null : <div className="pin"><span className="tk" />{p.pin}</div>}
              <div className="pfoot"><span className="notion">Notion ↗</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom">
        <span className="ghost-title" style={{ left: "-2px" }}>Brief</span>
        <div className="panel tasks">
          <div className="sec-head"><span className="bar" /><h2>當前任務提醒</h2><span className="en">TASKS</span></div>
          <div className="task-group-lbl"><span className="gd" style={{ background: "var(--color-warning)" }} />7 天內（{D.tasks.within7.length}）</div>
          {D.tasks.within7.map((t, i) => (
            <div key={i} className="task">
              <span className="tdot" />
              <div className="tmain"><div className="ttitle">{t.title}</div><div className="tmeta">{t.meta}</div></div>
              <span className="tdue">{t.due}</span>
            </div>
          ))}
          <div className="task-group-lbl"><span className="gd" style={{ background: "var(--color-muted)", opacity: 0.6 }} />之後（{D.tasks.later.length}）</div>
          {D.tasks.later.map((t, i) => (
            <div key={i} className="task">
              <span className={"tdot" + (t.hot ? "" : " idle")} />
              <div className="tmain"><div className="ttitle">{t.title}</div><div className="tmeta">{t.meta}</div></div>
              <span className="tdue plain">{t.due}</span>
            </div>
          ))}
        </div>

        <div className="panel advisory">
          <div className="sec-head"><span className="bar" /><h2>凱爾希簡報</h2><span className="en">ADVISORY</span></div>
          {D.advisory.map((a, i) => (
            <div key={i} className="adv-item"><span className="ai" /><span>{a}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 菁英幹員 */
function Operators({ data: D }: { data: RhodesData }) {
  return (
    <div className="fadein">
      <div className="op-wrap">
        <span className="ghost-title">Operators</span>
        <div className="op-grid">
          {D.operators.map((o) => (
            <div key={o.idx} className="panel opcard ix">
              <span className="sheen" />
              <span className="opcode">{o.role.slice(0, 3).toUpperCase()}-{o.idx} // 0x{o.idx}</span>
              <span className="opscan" />
              {/* 人物剪影上傳區（image-slot.js 提供的 web component） */}
              <ImageSlot id={`op-fig-${o.idx}`} className="opfig" shape="rect" placeholder="人物去背 PNG" />
              <div className="ohead">
                <div className="oglyph"><span>{o.idx}</span></div>
                <div><div className="oname">{o.name}</div><div className="orole">{o.role}</div></div>
              </div>
              <div className="ostate"><span className="sd" />{o.state}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="op-foot" dangerouslySetInnerHTML={{ __html: D.operatorFlow.replace(/「([^」]+)」/g, "<b>「$1」</b>") }} />
    </div>
  );
}

/* 元件本體 */
export default function RhodesCommand({ data = RHODES_DATA }: { data?: RhodesData }) {
  const [tab, setTab] = useState<"overview" | "ops">("overview");
  const [theme, setTheme] = useState<Theme>("vanguard");

  // 載入時讀回上次選的主題；切換時寫入 <html data-theme> 與 localStorage
  useEffect(() => {
    const saved = localStorage.getItem("rhodes-theme");
    if (saved === "blueprint" || saved === "vanguard") {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "blueprint" ? "vanguard" : "blueprint";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("rhodes-theme", next);
  }

  return (
    <div className="hud-bg">
      <HoloBrief
        activeCount={data.stats.active}
        due7Count={data.due7}
        overdueCount={data.stats.overdue}
        readiness={data.stats.readiness}
        syncDate={data.syncDate}
        figureSrc="/kaltsit.png"
      />
      <div className="shell">
        <div className="hero">
          <div className="eyebrow"><span className="live-dot" />LIVE · 同步 {data.syncDate}</div>
          <h1 className="h-hero" style={{ marginTop: 18 }}>羅德島總控</h1>
          <p className="flavor">{data.flavor}</p>
          <div className="statbar">
            <div className="panel cut stat ix"><span className="sheen" /><div className="num">{data.stats.total}</div><div className="lbl">作戰專案</div></div>
            <div className="panel cut stat ix"><span className="sheen" /><div className="num">{data.stats.active}</div><div className="lbl">進行中</div></div>
            <div className="panel cut stat ix"><span className="sheen" /><div className="num">{data.stats.overdue}</div><div className="lbl">逾期</div></div>
            <div className="panel cut stat ix"><span className="sheen" /><div className="num accent">{data.stats.readiness}%</div><div className="lbl">戰備度</div></div>
          </div>
        </div>

        <div className="tabrow">
          <div className="seg">
            <button aria-selected={tab === "overview"} onClick={() => setTab("overview")}>作戰總覽</button>
            <button aria-selected={tab === "ops"} onClick={() => setTab("ops")}>菁英幹員</button>
          </div>
          <button className="btn ghost theme-toggle" onClick={toggleTheme}>
            {theme === "vanguard" ? "切到亮白藍圖" : "切到暗色先鋒"}
          </button>
        </div>

        {tab === "overview" ? <Overview data={data} /> : <Operators data={data} />}
      </div>
    </div>
  );
}
