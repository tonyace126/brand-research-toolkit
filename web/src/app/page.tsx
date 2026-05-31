import RhodesCommand from "@/components/command/RhodesCommand";
import { RHODES_DATA } from "@/components/command/data";
import type { RhodesData, ProjectItem, TaskItem } from "@/components/command/data";
import { getPortfolio } from "@/lib/notion";
import { headers } from "next/headers";
import type { Portfolio, Project, Reminder } from "@/lib/types";

// 每次請求都即時連 Notion（不要在 build 時靜態化）
export const dynamic = "force-dynamic";
export const revalidate = 0;                // 關掉 ISR（清掉線上預設的 5 分鐘 stale-time 快取）
export const fetchCache = "force-no-store"; // 所有 fetch 一律不快取，每次重抓 Notion

const DAY = 86_400_000;

/* 凱爾希口吻每日問候（原創台詞，稱呼「東尼大木博士」）。依當年第幾天輪替。 */
const FLAVORS = [
  "別皺眉，東尼大木博士。情勢仍在掌控之中——確認過，就繼續前進。",
  "醒著就好好用腦，東尼大木博士。今天的羅德島，交給你下判斷。",
  "數據不會說謊，東尼大木博士。該整理的我都擺好了，剩下的是你的決定。",
  "情況我看過了，東尼大木博士。沒有意外，但別鬆懈——意外從不打招呼。",
  "又是一天，東尼大木博士。別問累不累，先把眼前的任務理清楚。",
  "保持清醒，東尼大木博士。羅德島不需要完美，只需要你持續往前。",
  "我已就位，東尼大木博士。當你準備好下令，幹員隨時候命。",
];

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / DAY);
}

/** 由專案代碼／客戶推導 2–4 字徽記 */
function tagOf(p: Project): string {
  const fromCode = p.code.match(/^[A-Za-z]+/)?.[0];
  const base = fromCode || p.client || p.code;
  return base.slice(0, 4).toUpperCase();
}

/** 天數差（截止日相對今天，可為負＝逾期） */
function daysUntil(due: string, todayMs: number): number {
  const d = Date.parse(due);
  if (Number.isNaN(d)) return Number.POSITIVE_INFINITY;
  return Math.round((d - todayMs) / DAY);
}

function dueLabel(due: string, n: number): string {
  if (!Number.isFinite(n)) return due;
  if (n < 0) return `逾期 ${Math.abs(n)} 天`;
  if (n === 0) return "今天";
  return `${n} 天後`;
}

function reminderMeta(r: Reminder): string {
  return [r.project, r.client, r.type].filter(Boolean).join(" · ");
}

/** Portfolio（Notion）→ RhodesData（元件） */
function toRhodes(pf: Portfolio): RhodesData {
  const parsed = Date.parse(pf.today);
  const base = Number.isNaN(parsed) ? Date.now() : parsed;

  const projects: ProjectItem[] = pf.projects.map((p) => ({
    code: p.code,
    client: p.client || "—",
    tag: tagOf(p),
    priority: p.priority,
    title: p.name,
    status: p.stage,
    progress: p.completion,
    next: p.nextDue || "—",
    launch: p.launch || "—",
    pin: p.risk && p.risk !== "—" ? p.risk : p.thisWeek && p.thisWeek !== "—" ? p.thisWeek : "—",
    url: p.url || "#",
  }));

  const within7: TaskItem[] = [];
  const later: TaskItem[] = [];
  let overdue = 0;
  let due7 = 0;
  for (const r of pf.reminders) {
    const n = daysUntil(r.due, base);
    if (n < 0) overdue += 1;
    if (n >= 0 && n <= 7) due7 += 1;
    const task: TaskItem = {
      title: r.text,
      meta: reminderMeta(r),
      due: n <= 7 ? dueLabel(r.due, n) : r.due,
      hot: r.priority === "高",
    };
    (n <= 7 ? within7 : later).push(task);
  }

  const total = projects.length;
  const active = projects.filter((p) => p.status === "進行中").length;
  const readiness = total
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / total)
    : 0;

  const advisory: string[] = [];
  if (overdue > 0) advisory.push(`有 ${overdue} 個項目已逾期，建議優先處理或與對方重新議定期限。`);
  if (due7 > 0) advisory.push(`有 ${due7} 個任務在 7 天內到期，先確認排程與交付。`);
  advisory.push(`${active} 個專案同時進行中，把當週交付拆成任務逐一推進——對幹員下令即可調度。`);

  return {
    syncDate: pf.syncedAt,
    flavor: FLAVORS[dayOfYear(new Date(base)) % FLAVORS.length],
    stats: { total, active, overdue, readiness },
    due7,
    projects,
    tasks: { within7, later },
    advisory,
    operators: RHODES_DATA.operators,
    operatorFlow: RHODES_DATA.operatorFlow,
  };
}

export default async function Page() {
  await headers(); // 讀 request-time API → 強制動態渲染，杜絕被靜態預渲染 / CDN 快取（force-dynamic 在線上未生效的保險）
  const pf = await getPortfolio();
  return <RhodesCommand data={toRhodes(pf)} />;
}
