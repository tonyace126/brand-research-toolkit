"use client";

function Stat({ value, label, alert = false }: { value: string | number; label: string; alert?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white/55 px-4 py-2.5 backdrop-blur-sm">
      <div className={`text-2xl font-black leading-none ${alert ? "text-red-500" : "text-ink"}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

export default function GlobeHero({
  live, synced, count, active, overdue, avg,
}: {
  live: boolean; synced: string; count: number; active: number; overdue: number; avg: number;
}) {
  return (
    <section className="relative mb-8 pt-1">
      {/* 巨型淡化背景字（方舟風） */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 -z-0 select-none font-black leading-none tracking-tighter text-ink/[0.045]"
        style={{ fontSize: "clamp(96px, 18vw, 220px)" }}
      >
        BEE
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/60 px-3 py-1 text-xs font-bold text-accent backdrop-blur-sm">
          <span className={`size-1.5 rounded-full ${live ? "bg-accent" : "bg-zinc-400"}`} />
          {live ? "LIVE" : "範例"} · 同步 {synced}
        </div>

        <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
          <span className="text-accent">//</span> 小蜜蜂
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          今天也把每個專案往前推一點 🐝　你的進度、時程與待辦，一眼掌握。
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Stat value={count} label="專案" />
          <Stat value={active} label="進行中" />
          <Stat value={overdue} label="逾期" alert={overdue > 0} />
          <Stat value={`${avg}%`} label="平均完成" />
        </div>
      </div>
    </section>
  );
}
