import type { CommandData } from "./data";

export default function Operators({ data: D }: { data: CommandData }) {
  return (
    <div className="fadein">
      <div className="op-wrap">
        <span className="ghost-title">Operators</span>
        <div className="op-grid">
          {D.operators.map((o) => (
            <div key={o.idx} className="panel opcard ix">
              <span className="sheen" />
              <div className="ohead">
                <div className="oglyph"><span>{o.idx}</span></div>
                <div><div className="oname">{o.name}</div><div className="orole">{o.role}</div></div>
              </div>
              <div className="ostate"><span className="sd" />{o.state}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="op-foot"
        dangerouslySetInnerHTML={{ __html: D.operatorFlow.replace(/「([^」]+)」/g, "<b>「$1」</b>") }}
      />
    </div>
  );
}
