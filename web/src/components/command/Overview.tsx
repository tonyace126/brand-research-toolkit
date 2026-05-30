import Ring from "./Ring";
import type { CommandData } from "./data";

export default function Overview({ data: D }: { data: CommandData }) {
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
            基準日 {D.syncDate}
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
              <div className="keyrow"><span>下個關鍵 <b>{p.next}</b></span><span>上線 <b>{p.launch}</b></span></div>
              <div className="pin"><span className="tk" />{p.pin}</div>
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
