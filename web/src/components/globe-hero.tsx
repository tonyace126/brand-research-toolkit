"use client";

const OPERATOR = "東尼大木";

// 凱爾希口吻 · 每天不同語氣（依當天日期輪替）
const GREETINGS = [
  `歡迎回來，${OPERATOR}博士。當前態勢已整理於下，過目。`,
  `博士，你來了。數據在此，不必多言。`,
  `又是一天。專案不會自己前進——但全局我已替你看著。`,
  `別皺眉，${OPERATOR}。情況仍在掌控之中，確認即可。`,
  `時間有限，博士。挑要緊的先動手。`,
  `你回來就好。該標記的，我都標記了。`,
  `保持清醒，${OPERATOR}博士。下面是今日的作戰概況。`,
];

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function Stat({ value, label, alert = false }: { value: string | number; label: string; alert?: boolean }) {
  if (alert) {
    return (
      <div className="rounded-xl bg-danger px-4 py-2.5 text-white shadow-[0_0_26px_-6px_rgba(255,77,79,0.7)]">
        <div className="text-2xl font-black leading-none">{value}</div>
        <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">{label}</div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-line bg-surface/70 px-4 py-2.5 backdrop-blur-sm">
      <div className="text-2xl font-black leading-none text-ink">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

function Emblem() {
  return (
    <svg viewBox="0 0 120 120" className="size-full" fill="none">
      {/* 外圈刻度環（緩轉） */}
      <g className="spin-slow" stroke="currentColor" strokeWidth="1" opacity="0.4">
        <circle cx="60" cy="62" r="56" strokeDasharray="2 7" />
      </g>
      <circle cx="60" cy="62" r="47" stroke="currentColor" strokeWidth="1" opacity="0.18" />
      {/* 三角外框（原創構型，非官方標誌） */}
      <path d="M60 16 L104 96 H16 Z" stroke="var(--color-accent)" strokeWidth="2" opacity="0.9" />
      {/* 內部上升標記 */}
      <path d="M60 40 L80 80 H66 V90 H54 V80 H40 Z" fill="var(--color-accent)" opacity="0.16" />
      <path d="M60 40 L80 80 H66 V90 H54 V80 H40 Z" stroke="var(--color-accent)" strokeWidth="2" />
      {/* 底線 + 端點 */}
      <line x1="26" y1="101" x2="94" y2="101" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="60" cy="10" r="2.5" fill="var(--color-accent)" />
      <circle cx="26" cy="101" r="1.8" fill="currentColor" opacity="0.6" />
      <circle cx="94" cy="101" r="1.8" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export default function GlobeHero({
  live, synced, count, active, overdue, avg,
}: {
  live: boolean; synced: string; count: number; active: number; overdue: number; avg: number;
}) {
  const greeting = GREETINGS[dayOfYear(new Date()) % GREETINGS.length];

  return (
    <section className="relative mb-8 pt-1">
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs font-bold text-accent backdrop-blur-sm">
          <span className={`size-1.5 rounded-full ${live ? "bg-accent" : "bg-zinc-500"}`} />
          {live ? "LIVE" : "範例"} · 同步 {synced}
        </div>

        <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
          <span className="text-accent">//</span> 羅德島總控
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{greeting}</p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Stat value={count} label="作戰專案" />
          <Stat value={active} label="進行中" />
          <Stat value={overdue} label="逾期" alert={overdue > 0} />
          <Stat value={`${avg}%`} label="戰備度" />
        </div>
      </div>
    </section>
  );
}
