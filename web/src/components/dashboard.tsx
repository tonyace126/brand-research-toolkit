"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import GlobeHero from "@/components/globe-hero";
import type { Portfolio, Project, Reminder, Priority, Agent } from "@/lib/types";

/* ---------- helpers ---------- */
const PRIO: Record<Priority, { dot: string; label: string }> = {
  高: { dot: "#2b6fff", label: "高" },
  中: { dot: "#9aa3af", label: "中" },
  低: { dot: "#cbd0d8", label: "低" },
};
const STAGE: Record<string, string> = {
  進行中: "#2b6fff",
  未開始: "#9aa3af",
  完成: "#16181d",
};

function parseDate(s: string): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return null;
  return new Date(s + "T00:00:00");
}
function daysBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 750;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

function Ring({ pct, color = "#2b6fff", size = 132 }: { pct: number; color?: string; size?: number }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);
  useEffect(() => {
    const t = setTimeout(() => setOff(c * (1 - pct / 100)), 80);
    return () => clearTimeout(t);
  }, [c, pct]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#262a31" strokeWidth={9} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="700" fill="#e9ebef">
        {pct}%
      </text>
    </svg>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

/* ---------- KPI ---------- */
function Kpi({ value, label, suffix = "", accent = false }: { value: number; label: string; suffix?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4 text-center shadow-[0_1px_2px_rgba(20,22,28,.04)]">
      <div className={`text-3xl font-bold leading-none ${accent ? "text-accent" : "text-ink"}`}>
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

/* ---------- Project card ---------- */
function ProjectCard({ p, today }: { p: Project; today: Date }) {
  const sc = STAGE[p.stage] ?? "#6366f1";
  const nd = parseDate(p.nextDue ?? "");
  let dueNode = <span className="text-muted">—</span>;
  if (nd) {
    const dd = daysBetween(nd, today);
    if (dd < 0) dueNode = <b className="text-red-500">{p.nextDue}（逾期 {Math.abs(dd)} 天）</b>;
    else if (dd <= 7) dueNode = <b className="text-accent">{p.nextDue}（{dd} 天後）</b>;
    else dueNode = <span className="text-ink/70">{p.nextDue}</span>;
  }
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(20,22,28,.04)] hover:border-accent/40 hover:shadow-[0_10px_30px_-12px_rgba(99,102,241,.35)]"
    >
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: sc }} />
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-muted">{p.icon} {p.client}</span>
        <span className="inline-flex items-center gap-1 font-semibold">
          <i className="size-2 rounded-full" style={{ background: PRIO[p.priority].dot }} />
          {p.priority}
        </span>
      </div>
      <div className="mt-1.5 text-[15px] font-bold text-ink">{p.code} · {p.name}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: sc + "1a", color: sc }}>
          {p.stage}
        </span>
        {p.openItems > 0 && (
          <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">未結 {p.openItems}</span>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: sc }}
          initial={{ width: 0 }}
          whileInView={{ width: `${p.completion}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted">完成度 {p.completion}%<span className="text-ink/30">（估）</span></div>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>下個關鍵 {dueNode}</span>
        <span>上線 {p.launch ?? "—"}</span>
      </div>
      <div className="mt-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs text-ink/70">📌 {p.thisWeek}</div>
      {p.risk && p.risk !== "—" && <div className="mt-1.5 text-[11px] text-red-500">⚠️ {p.risk}</div>}
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span />
        <a href={p.url} target="_blank" rel="noreferrer" className="font-semibold text-accent hover:underline">
          Notion ↗
        </a>
      </div>
    </motion.div>
  );
}

/* ---------- Reminder ---------- */
function ReminderRow({ r, today }: { r: Reminder; today: Date }) {
  const nd = parseDate(r.due);
  const dd = nd ? daysBetween(nd, today) : null;
  let tag = <span className="text-[10px] text-muted tabular-nums">{r.due}</span>;
  if (dd !== null && dd < 0) tag = <span className="whitespace-nowrap rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">逾期 {Math.abs(dd)} 天</span>;
  else if (dd === 0) tag = <span className="whitespace-nowrap rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">今天</span>;
  else if (dd !== null && dd <= 7) tag = <span className="whitespace-nowrap rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">{dd} 天後</span>;
  return (
    <div className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
      <i className="size-2.5 shrink-0 rounded-full" style={{ background: PRIO[r.priority].dot }} />
      <div className="flex-1">
        <div className="text-[13px] text-ink">{r.text}</div>
        <div className="text-[10.5px] text-muted">{r.project} · {r.client} {r.type && `· ${r.type}`}</div>
      </div>
      {tag}
    </div>
  );
}

/* ---------- main ---------- */
export default function Dashboard({ data, agents }: { data: Portfolio; agents: Agent[] }) {
  const [tab, setTab] = useState<"portfolio" | "team">("portfolio");
  const today = parseDate(data.today) ?? new Date();

  const projects = data.projects;
  const reminders = data.reminders;
  const avg = projects.length ? Math.round(projects.reduce((s, p) => s + p.completion, 0) / projects.length) : 0;
  const active = projects.filter((p) => p.stage === "進行中").length;
  const overdue = reminders.filter((r) => parseDate(r.due) && daysBetween(parseDate(r.due)!, today) < 0);
  const soon = reminders.filter((r) => { const d = parseDate(r.due); return d && daysBetween(d, today) >= 0 && daysBetween(d, today) <= 7; });
  const later = reminders.filter((r) => { const d = parseDate(r.due); return d && daysBetween(d, today) > 7; });
  const weekDue = projects.filter((p) => { const d = parseDate(p.nextDue ?? ""); return d && daysBetween(d, today) >= 0 && daysBetween(d, today) <= 7; }).length;

  const group = (title: string, items: Reminder[]) =>
    items.length ? (
      <div key={title}>
        <div className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-wide text-muted first:mt-0">{title}（{items.length}）</div>
        {items.map((r, i) => <ReminderRow key={i} r={r} today={today} />)}
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      {/* hero */}
      <GlobeHero
        live={data.live}
        synced={data.syncedAt}
        count={projects.length}
        active={active}
        overdue={overdue.length}
        avg={avg}
      />

      {/* tabs */}
      <div className="mb-6 inline-flex rounded-full border border-line bg-surface p-1 shadow-sm">
        {([["portfolio", "📊 作戰總覽"], ["team", "🛡️ 菁英幹員"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === key ? "text-white" : "text-muted hover:text-ink"}`}
          >
            {tab === key && (
              <motion.span layoutId="tabpill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "portfolio" ? (
          <motion.div key="pf" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {/* hero + kpis */}
            <div className="mb-4 grid gap-4 lg:grid-cols-[auto_1fr]">
              <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(20,22,28,.04)]">
                <Ring pct={avg} />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">平均完成度</div>
                  <div className="mt-1 text-sm text-ink/70">{projects.length} 個專案 · 進行中 {active}</div>
                  <div className="mt-1 text-sm text-ink/70">基準日 {data.today}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi value={projects.length} label="專案數" />
                <Kpi value={active} label="進行中" />
                <Kpi value={overdue.length} label="逾期提醒" accent={overdue.length > 0} />
                <Kpi value={weekDue} label="7 天內期限" />
              </div>
            </div>

            {/* project cards */}
            <motion.div initial="initial" animate="animate" transition={{ staggerChildren: 0.05 }} className="grid gap-3 sm:grid-cols-2">
              {projects.map((p) => <ProjectCard key={p.code} p={p} today={today} />)}
            </motion.div>

            {/* reminders + suggestions */}
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <section className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(20,22,28,.04)]">
                <h2 className="mb-3 flex items-center gap-2"><span className="h-4 w-1 shrink-0 bg-accent" /><span className="text-sm font-bold">當前任務提醒</span><span className="font-code text-[10px] uppercase tracking-widest text-muted">// TASKS</span></h2>
                {reminders.length ? <>{group("🔴 已逾期", overdue)}{group("🟡 7 天內", soon)}{group("⚪ 之後", later)}</> : <p className="text-sm text-muted">目前沒有開放事項 🎉</p>}
              </section>
              <section className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(20,22,28,.04)]">
                <h2 className="mb-3 flex items-center gap-2"><span className="h-4 w-1 shrink-0 bg-accent" /><span className="text-sm font-bold">凱爾希簡報</span><span className="font-code text-[10px] uppercase tracking-widest text-muted">// ADVISORY</span></h2>
                <ul className="space-y-2 text-[13px] text-ink/75">
                  {overdue.length > 0 && <li>🔴 最急：「{overdue[0].text}」已逾期，建議今天先清。</li>}
                  {weekDue > 0 && <li>⏰ 有 {weekDue} 個專案在 7 天內有關鍵期限，注意排程。</li>}
                  {active > 0 && <li>🐝 {active} 個專案同時進行中，用代理團隊把當週交付拆成任務逐一推進。</li>}
                  {!data.live && <li>⚙️ 目前是範例資料，設定 NOTION_TOKEN 後即顯示你的真實專案。</li>}
                </ul>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {agents.map((a) => (
                <motion.div key={a.id} variants={fadeUp} initial="initial" animate="animate" whileHover={{ y: -3 }}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(20,22,28,.04)]">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{a.emoji}</span>
                    <div>
                      <div className="text-sm font-bold">{a.name}</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted">{a.role}</div>
                    </div>
                  </div>
                  <div className={`mt-3 text-xs font-semibold ${a.status === "active" ? "text-accent" : "text-muted"}`}>
                    {a.status === "active" ? "● 作戰中" : "○ 待命"}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">菁英幹員編制：需求 → 規劃 → 開發 → 審查 → 驗收（＋企劃 → 導演 → 剪輯）。博士，下達指令即可調度幹員——說「我要加一個功能…」或「我要做一支影片…」，幹員就位。</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
