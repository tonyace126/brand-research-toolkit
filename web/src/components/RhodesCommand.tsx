"use client";

/* =====================================================================
   羅德島總控 // RhodesCommand
   Next.js 16 / React 19 / Tailwind CSS v4
   ---------------------------------------------------------------------
   用法：
     import RhodesCommand from "@/components/RhodesCommand";
     export default function Page() { return <RhodesCommand />; }
   依賴：
     · globals.css 內已合併本包提供的 token（見 nextjs/globals.css）
     · 同層放 rhodes-command.css 與 data.ts
   ===================================================================== */

import { useEffect, useState, type CSSProperties } from "react";
import "./rhodes-command.css";
import {
  rhodesData as defaultData,
  type RhodesData,
  type ProjectItem,
  type TaskItem,
  type OperatorItem,
} from "./data";

type Theme = "vanguard" | "terminal" | "hazard";

/* 把「」包成 <b> 用，給 operatorFlow */
function emphasizeQuotes(text: string): string {
  return text.replace(/「([^」]+)」/g, "<b>「$1」</b>");
}

function Ring({ p, size = 148, big = 32 }: { p: number; size?: number; big?: number }) {
  return (
    <div className="ring" style={{ ["--p" as string]: p, width: size } as CSSProperties}>
      <div className="dial" />
      <div className="ticks" />
      <div className="val">
        <b style={{ fontSize: big }}>{p}%</b>
      </div>
    </div>
  );
}

function ThemeMini({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const opts: [Theme, string][] = [
    ["vanguard", "先鋒"],
    ["terminal", "終端"],
    ["hazard", "警戒"],
  ];
  return (
    <div className="theme-mini">
      <span className="lab">THEME</span>
      {opts.map(([k, l]) => (
        <button key={k} aria-pressed={theme === k} onClick={() => setTheme(k)}>
          {l}
        </button>
      ))}
    </div>
  );
}

function ProjectCard({ p }: { p: ProjectItem }) {
  return (
    <div className="panel pcard ix">
      <span className="sheen" />
      <div className="topline accent" />
      <div className="ptop">
        <div className="client">
          <span className="glyph">{p.tag}</span>
          {p.client}
        </div>
        <div className="prio">
          <span className="dot" />
          {p.priority}
        </div>
      </div>
      <div className="pcode">{p.code}</div>
      <h3>{p.title}</h3>
      <span className="tag active">{p.status}</span>
      <div className="pbarlbl">完成度 {p.progress}%（估）</div>
      <div className="bar">
        <i style={{ width: `${p.progress}%` }} />
      </div>
      <div className="keyrow">
        <span>
          下個關鍵 <b>{p.next}</b>
        </span>
        <span>
          上線 <b>{p.launch}</b>
        </span>
      </div>
      <div className="pin">
        <span className="tk" />
        {p.pin}
      </div>
      <div className="pfoot">
        <span className="notion">Notion ↗</span>
      </div>
    </div>
  );
}

function TaskRow({ t, plain }: { t: TaskItem; plain?: boolean }) {
  return (
    <div className="task">
      <span className={"tdot" + (t.hot ? "" : " idle")} />
      <div className="tmain">
        <div className="ttitle">{t.title}</div>
        <div className="tmeta">{t.meta}</div>
      </div>
      <span className={"tdue" + (plain ? " plain" : "")}>{t.due}</span>
    </div>
  );
}

function Overview({ data }: { data: RhodesData }) {
  const s = data.stats;
  return (
    <div>
      <div className="ov-top">
        <div className="panel hud is-accent ringcard ix">
          <span className="sheen" />
          <Ring p={s.readiness} size={120} big={26} />
          <div className="meta">
            <b>平均完成度</b>
            <br />
            {s.total} 個專案 · 進行中 {s.active}
            <br />
            基準日 {data.syncDate}
          </div>
        </div>
        <div className="panel cut kpi ix">
          <span className="sheen" />
          <div className="idx">// 0x01</div>
          <div className="num">{s.total}</div>
          <div className="lbl">專案數</div>
        </div>
        <div className="panel cut kpi ix">
          <span className="sheen" />
          <div className="idx">// 0x02</div>
          <div className="num" style={{ color: "var(--color-cyan)" }}>{s.active}</div>
          <div className="lbl">進行中</div>
        </div>
        <div className="panel cut kpi ix">
          <span className="sheen" />
          <div className="idx">// 0x03</div>
          <div className="num">{s.overdue}</div>
          <div className="lbl">逾期提醒</div>
        </div>
        <div className="panel cut kpi ix">
          <span className="sheen" />
          <div className="idx">// 0x04</div>
          <div className="num" style={{ color: "var(--color-accent)" }}>{data.due7}</div>
          <div className="lbl">7 天內期限</div>
        </div>
      </div>

      <div className="sect">
        <span className="ghost-title">Ops</span>
        <div className="sec-head">
          <span className="bar" />
          <h2>作戰專案</h2>
          <span className="en">OPERATIONS</span>
        </div>
        <div className="proj-grid">
          {data.projects.map((p) => (
            <ProjectCard key={p.code} p={p} />
          ))}
        </div>
      </div>

      <div className="bottom">
        <span className="ghost-title" style={{ left: "-2px" }}>Brief</span>
        <div className="panel tasks">
          <div className="sec-head">
            <span className="bar" />
            <h2>當前任務提醒</h2>
            <span className="en">TASKS</span>
          </div>
          <div className="task-group-lbl">
            <span className="gd" style={{ background: "var(--color-warning)" }} />
            7 天內（{data.tasks.within7.length}）
          </div>
          {data.tasks.within7.map((t, i) => (
            <TaskRow key={`w${i}`} t={t} />
          ))}
          <div className="task-group-lbl">
            <span className="gd" style={{ background: "var(--color-muted)", opacity: 0.6 }} />
            之後（{data.tasks.later.length}）
          </div>
          {data.tasks.later.map((t, i) => (
            <TaskRow key={`l${i}`} t={t} plain />
          ))}
        </div>

        <div className="panel advisory">
          <div className="sec-head">
            <span className="bar" />
            <h2>凱爾希簡報</h2>
            <span className="en">ADVISORY</span>
          </div>
          {data.advisory.map((a, i) => (
            <div key={i} className="adv-item">
              <span className="ai" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Operators({ data }: { data: RhodesData }) {
  return (
    <div>
      <div className="op-wrap">
        <span className="ghost-title">Operators</span>
        <div className="op-grid">
          {data.operators.map((o: OperatorItem) => (
            <div key={o.idx} className="panel opcard ix">
              <span className="sheen" />
              <div className="ohead">
                <div className="oglyph">
                  <span>{o.idx}</span>
                </div>
                <div>
                  <div className="oname">{o.name}</div>
                  <div className="orole">{o.role}</div>
                </div>
              </div>
              <div className="ostate">
                <span className="sd" />
                {o.state}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="op-foot"
        dangerouslySetInnerHTML={{ __html: emphasizeQuotes(data.operatorFlow) }}
      />
    </div>
  );
}

export default function RhodesCommand({ data = defaultData }: { data?: RhodesData }) {
  const [tab, setTab] = useState<"overview" | "ops">("overview");
  const [theme, setTheme] = useState<Theme>("vanguard");

  // 換膚：把 data-theme 寫到 <html>，讓 token 變體生效
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="rc-root hud-bg">
      <div className="shell">
        <div className="hero">
          <div className="eyebrow">
            <span className="live-dot" />
            LIVE · 同步 {data.syncDate}
          </div>
          <h1 className="h-hero" style={{ marginTop: 18 }}>
            羅德島總控
          </h1>
          <p className="flavor">{data.flavor}</p>
          <div className="statbar">
            <div className="panel cut stat ix">
              <span className="sheen" />
              <div className="num">{data.stats.total}</div>
              <div className="lbl">作戰專案</div>
            </div>
            <div className="panel cut stat ix">
              <span className="sheen" />
              <div className="num">{data.stats.active}</div>
              <div className="lbl">進行中</div>
            </div>
            <div className="panel cut stat ix">
              <span className="sheen" />
              <div className="num">{data.stats.overdue}</div>
              <div className="lbl">逾期</div>
            </div>
            <div className="panel cut stat ix">
              <span className="sheen" />
              <div className="num accent">{data.stats.readiness}%</div>
              <div className="lbl">戰備度</div>
            </div>
          </div>
        </div>

        <div className="tabrow">
          <div className="seg">
            <button aria-selected={tab === "overview"} onClick={() => setTab("overview")}>
              作戰總覽
            </button>
            <button aria-selected={tab === "ops"} onClick={() => setTab("ops")}>
              菁英幹員
            </button>
          </div>
          <ThemeMini theme={theme} setTheme={setTheme} />
        </div>

        {tab === "overview" ? <Overview data={data} /> : <Operators data={data} />}
      </div>
    </div>
  );
}
