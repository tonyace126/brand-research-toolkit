import type { CSSProperties } from "react";

export default function Ring({ p, size = 148, big = 32 }: { p: number; size?: number; big?: number }) {
  return (
    <div className="ring" style={{ "--p": p, width: size } as CSSProperties}>
      <div className="dial" />
      <div className="ticks" />
      <div className="val"><b style={{ fontSize: big }}>{p}%</b></div>
    </div>
  );
}
