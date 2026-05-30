"use client";

import { useState } from "react";
import Overview from "./Overview";
import Operators from "./Operators";
import { RC_DATA, type CommandData } from "./data";
import "./command.css";

export default function CommandCenter({ data = RC_DATA }: { data?: CommandData }) {
  const [tab, setTab] = useState<"overview" | "ops">("overview");
  const D = data;

  return (
    <div className="hud-bg">
      <div className="shell">
        <div className="hero">
          <div className="eyebrow"><span className="live-dot" />LIVE · 同步 {D.syncDate}</div>
          <h1 className="h-hero" style={{ marginTop: 18 }}>羅德島總控</h1>
          <p className="flavor">{D.flavor}</p>
          <div className="statbar">
            <div className="panel cut stat ix"><span className="sheen" /><div className="num">{D.stats.total}</div><div className="lbl">作戰專案</div></div>
            <div className="panel cut stat ix"><span className="sheen" /><div className="num">{D.stats.active}</div><div className="lbl">進行中</div></div>
            <div className="panel cut stat ix"><span className="sheen" /><div className="num">{D.stats.overdue}</div><div className="lbl">逾期</div></div>
            <div className="panel cut stat ix"><span className="sheen" /><div className="num accent">{D.stats.readiness}%</div><div className="lbl">戰備度</div></div>
          </div>
        </div>

        <div className="tabrow">
          <div className="seg">
            <button aria-selected={tab === "overview"} onClick={() => setTab("overview")}>作戰總覽</button>
            <button aria-selected={tab === "ops"} onClick={() => setTab("ops")}>菁英幹員</button>
          </div>
        </div>

        {tab === "overview" ? <Overview data={D} /> : <Operators data={D} />}
      </div>
    </div>
  );
}
