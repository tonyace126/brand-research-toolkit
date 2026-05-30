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
  return (
    <div className="rounded-xl border border-line bg-surface/70 px-4 py-2.5 backdrop-blur-sm">
      <div className={`text-2xl font-black leading-none ${alert ? "text-danger" : "text-ink"}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

function Emblem() {
  return (
    <svg viewBox="0 0 120 120" className="size-full" fill="none">
      {/* 外圈刻度環（緩轉） */}
      <g className="spin-slow" stroke="currentColor" strokeWidth="1" opacity="0.5">
        <circle cx="60" cy="60" r="56" strokeDasharray="2 6" />
      </g>
      <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      {/* 菱形外框 */}
      <rect x="60" y="14" width="65" height="65" transform="rotate(45 60 14)" stroke="var(--color-accent)" strokeWidth="2" opacity="0.9" />
      {/* 內部上升箭頭（羅德島意象，原創幾何） */}
      <path d="M60 36 L82 78 H64 V92 H56 V78 H38 Z" fill="var(--color-accent)" opacity="0.18" />
      <path d="M60 36 L82 78 H64 V92 H56 V78 H38 Z" stroke="var(--color-accent)" strokeWidth="2" />
      {/* 角落點 */}
      <circle cx="60" cy="8" r="2.5" fill="var(--color-accent)" />
      <circle cx="112" cy="60" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="8" cy="60" r="2" fill="currentColor" opacity="0.6" />
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
      {/* 漂浮徽章 */}
      <div className="pointer-events-none absolute -top-2 right-0 z-0 hidden text-ink sm:block" aria-hidden>
        <div className="floaty size-40 text-ink/80 md:size-48">
          <Emblem />
        </div>
        <div className="mt-1 text-right font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          RHODES // 0x05
        </div>
      </div>

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
