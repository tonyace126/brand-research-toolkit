"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

function Chip({ value, label, alert = false }: { value: string | number; label: string; alert?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 px-4 py-2.5 backdrop-blur">
      <div className={`text-2xl font-extrabold leading-none ${alert ? "text-red-500" : "text-ink"}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

export default function GlobeHero({
  live, synced, count, active, overdue, avg,
}: {
  live: boolean; synced: string; count: number; active: number; overdue: number; avg: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let width = 0;
    let phi = 0;
    let raf = 0;
    const onResize = () => {
      if (canvasRef.current) width = canvasRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();
    const dim = () => (width || 300) * 2;
    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: dim(),
      height: dim(),
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 1.1,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.93, 0.94, 0.97],
      markerColor: [0.357, 0.424, 1],
      glowColor: [0.92, 0.94, 1],
      markers: [{ location: [23.7, 121.0], size: 0.09 }],
    });
    const tick = () => {
      phi += 0.005;
      globe.update({ phi, width: dim(), height: dim() });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    requestAnimationFrame(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });
    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl border border-line bg-white/65 p-6 shadow-[0_18px_50px_-28px_rgba(20,22,28,.4)] backdrop-blur-xl sm:p-8">
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
            <span className={`size-1.5 rounded-full ${live ? "bg-emerald-500" : "bg-zinc-400"}`} />
            {live ? "LIVE" : "範例"} · 同步 {synced}
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-accent">//</span> 小蜜蜂
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            今天也把每個專案往前推一點 🐝　你的進度、時程與待辦，一眼掌握。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Chip value={count} label="專案" />
            <Chip value={active} label="進行中" />
            <Chip value={overdue} label="逾期" alert={overdue > 0} />
            <Chip value={`${avg}%`} label="平均完成" />
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[280px] sm:mx-0 sm:max-w-[300px]">
          <canvas
            ref={canvasRef}
            className="aspect-square w-full"
            style={{ opacity: 0, transition: "opacity 1.2s ease", contain: "layout paint size" }}
          />
        </div>
      </div>
    </section>
  );
}
