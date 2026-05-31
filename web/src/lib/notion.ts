import "server-only";
import type { Project, Reminder, Portfolio, Priority, Stage } from "./types";
export type { Project, Reminder, Portfolio, Priority, Stage } from "./types";

const API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const OPEN_STATES = ["待執行", "進行中"]; // 未結事項（計入 openItems / 任務提醒）
const CANCELLED = "已取消";
const DONE = "已完成";

function prio(name?: string | null): Priority {
  if (!name) return "中";
  if (name.includes("🔴") || name.includes("最高") || name.includes("高")) return "高";
  if (name.includes("🟢") || name.includes("一般") || name.includes("低")) return "低";
  return "中";
}

const clamp892 = (p: number) => Math.max(8, Math.min(92, Math.round(p)));

/**
 * 解析「預期時程」自由文字 → 起訖時間（ms）。免人工填日期，容忍模糊月份。
 * 規則：
 * - 明確日期（YYYY-MM-DD 或 M/D）優先；抓到 ≥2 個 → 首=起、尾=訖；1 個 → 當終點。
 * - 否則抓「N月」：≥2 個 → 首月月初=起、尾月月底=訖；1 個 → 該月月底=終點。
 * - 終點月份早於起點月份 → 視為跨年 +1；單一終點月份早於本月 → +1。
 * 年份以「今天」為基準。
 */
function parseExpectedSchedule(
  text: string | null, todayMs: number,
): { start: number | null; end: number | null } {
  if (!text) return { start: null, end: null };
  const base = new Date(todayMs);
  const year = base.getUTCFullYear();
  const curMonth = base.getUTCMonth() + 1;
  const monthEnd = (y: number, m: number) => Date.UTC(y, m, 0);     // 下月 0 號 = 本月底
  const monthStart = (y: number, m: number) => Date.UTC(y, m - 1, 1);

  // 1) 明確日期
  const iso = [...text.matchAll(/(\d{4})-(\d{1,2})-(\d{1,2})/g)]
    .map((m) => Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const md = [...text.matchAll(/(?<!\d)(\d{1,2})\/(\d{1,2})(?!\d)/g)]
    .map((m) => Date.UTC(year, +m[1] - 1, +m[2]));
  const exact = [...iso, ...md].filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
  if (exact.length >= 2) return { start: exact[0], end: exact[exact.length - 1] };
  if (exact.length === 1) return { start: null, end: exact[0] };

  // 2) 模糊月份「N月」
  const months = [...text.matchAll(/(\d{1,2})\s*月/g)].map((m) => +m[1]).filter((m) => m >= 1 && m <= 12);
  if (months.length >= 2) {
    const sm = months[0];
    const em = months[months.length - 1];
    const ey = em < sm ? year + 1 : year;
    return { start: monthStart(year, sm), end: monthEnd(ey, em) };
  }
  if (months.length === 1) {
    const em = months[0];
    const ey = em < curMonth ? year + 1 : year;
    return { start: null, end: monthEnd(ey, em) };
  }
  return { start: null, end: null };
}

/** 每個專案經 fallback 鏈解出的起訖與里程碑統計，用來算完成度。 */
interface RawSchedule {
  stage: Stage;
  brief: string | null; launch: string | null; nextDue: string | null; created: string | null;
  expStart: number | null; expEnd: number | null;
}
interface Milestones { total: number; done: number; lastDone: number; nextUndone: number; }

// 起點：Brief 收件日 → 預期時程(起) → Notion 建立時間
function startOf(r: RawSchedule): number {
  const b = r.brief ? Date.parse(r.brief) : NaN;
  if (!Number.isNaN(b)) return b;
  if (r.expStart != null) return r.expStart;
  return r.created ? Date.parse(r.created) : NaN;
}
// 終點：預計上線 → 預期時程(迄) → 下個關鍵期限
function endOf(r: RawSchedule): number {
  const l = r.launch ? Date.parse(r.launch) : NaN;
  if (!Number.isNaN(l)) return l;
  if (r.expEnd != null) return r.expEnd;
  return r.nextDue ? Date.parse(r.nextDue) : NaN;
}

/**
 * 完成度 = 里程碑分段 + 段內時間插值。
 * - 未開始：0%
 * - 有里程碑（關聯事項，排除已取消）：基線 D/N，當前段用今天落點插值
 *   上錨 = 已完成里程碑最晚截止日 ?? 專案起點；下錨 = 未完成里程碑最近截止日 ?? 專案終點
 * - 無里程碑：純時程比例（起點 → 終點）
 * 進行中一律夾 8%~92%。needsSchedule = 終點三層全缺（→ UI 標記提醒補時間）。
 */
function computeCompletion(
  r: RawSchedule, ms: Milestones | undefined, todayMs: number,
): { completion: number; needsSchedule: boolean } {
  const start = startOf(r);
  const end = endOf(r);
  const needsSchedule = Number.isNaN(end); // 預計上線 / 預期時程迄 / 下個關鍵期限 全缺
  if (r.stage === "未開始") return { completion: 0, needsSchedule };

  if (ms && ms.total > 0) {
    const { total: N, done: D } = ms;
    if (D >= N) return { completion: 92, needsSchedule }; // 里程碑全清但尚未結案
    const upper = !Number.isNaN(ms.lastDone) ? ms.lastDone : start;
    const lower = !Number.isNaN(ms.nextUndone) ? ms.nextUndone : end;
    let frac = 0;
    if (!Number.isNaN(upper) && !Number.isNaN(lower) && lower > upper) {
      frac = Math.min(1, Math.max(0, (todayMs - upper) / (lower - upper)));
    }
    return { completion: clamp892(((D + frac) / N) * 100), needsSchedule };
  }

  if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
    return { completion: clamp892(((todayMs - start) / (end - start)) * 100), needsSchedule };
  }
  return { completion: 40, needsSchedule }; // 起訖湊不齊 → 概略值
}

// ---- Notion property getters ----
/* eslint-disable @typescript-eslint/no-explicit-any */
const pTitle = (p: any, k: string) => (p[k]?.title ?? []).map((t: any) => t.plain_text).join("") || "";
const pText = (p: any, k: string) => (p[k]?.rich_text ?? []).map((t: any) => t.plain_text).join("") || "";
const pChoice = (p: any, k: string) => (p[k]?.select ?? p[k]?.status)?.name ?? null;
const pDate = (p: any, k: string) => p[k]?.date?.start ?? null;
const pUrl = (p: any, k: string) => p[k]?.url ?? null;
const pRel = (p: any, k: string): string[] => (p[k]?.relation ?? []).map((r: any) => r.id);
const pIcon = (page: any) => (page.icon?.type === "emoji" ? page.icon.emoji : "");
/* eslint-enable @typescript-eslint/no-explicit-any */

async function notion(path: string, body: unknown, token: string) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function findDb(nameSubstr: string, token: string): Promise<string> {
  const res = await notion("/search", {
    query: nameSubstr,
    filter: { value: "database", property: "object" },
  }, token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of res.results ?? []) {
    const title = (r.title ?? []).map((t: any) => t.plain_text).join(""); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (title.includes(nameSubstr)) return r.id;
  }
  throw new Error(`找不到名稱含「${nameSubstr}」的資料庫`);
}

async function queryAll(dbId: string, token: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion(`/databases/${dbId}/query`,
      cursor ? { page_size: 100, start_cursor: cursor } : { page_size: 100 }, token);
    rows.push(...(res.results ?? []));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return rows;
}

export async function getPortfolio(): Promise<Portfolio> {
  const token = process.env.NOTION_TOKEN;
  // 用台灣時區算「今天」，避免伺服器 UTC 比台灣慢 8 小時、凌晨時日期落後一天。
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
  if (!token) {
    return { ...SAMPLE, today, syncedAt: today, live: false };
  }
  try {
    const projDb = process.env.NOTION_PROJECTS_DB || (await findDb("全客戶專案總表", token));
    const taskDb = process.env.NOTION_TASKS_DB || (await findDb("追蹤事項庫", token));
    const [projRows, taskRows] = await Promise.all([queryAll(projDb, token), queryAll(taskDb, token)]);

    const todayMs = Date.parse(today);

    // 第 1 趟：建立專案（completion 先占位，第 3 趟回填）+ 記錄各案起訖原料。
    const id2code: Record<string, string> = {};
    const projects: Project[] = [];
    const rawByCode: Record<string, RawSchedule> = {};
    for (const pg of projRows) {
      const pr = pg.properties;
      const stage = (pChoice(pr, "階段") || "進行中") as Stage;
      if (stage === "完成") continue;
      const code = pTitle(pr, "專案代碼") || pg.id.slice(0, 8);
      id2code[pg.id] = code;
      const brief = pDate(pr, "Brief 收件日");
      const nextDue = pDate(pr, "下個關鍵期限");
      const launch = pDate(pr, "預計上線");
      const created: string | null = pg.created_time ?? null;
      const exp = parseExpectedSchedule(pText(pr, "預期時程"), todayMs);
      projects.push({
        code, icon: pIcon(pg), client: pChoice(pr, "客戶") || "",
        name: pText(pr, "專案名稱") || code, stage, priority: prio(pChoice(pr, "優先級")),
        completion: 0, openItems: 0, needsSchedule: false,
        brief, nextDue, launch,
        thisWeek: pText(pr, "本週要做") || "—", risk: pText(pr, "風險警示") || "—",
        url: pUrl(pr, "專案頁面") || `https://www.notion.so/${pg.id.replace(/-/g, "")}`,
      });
      rawByCode[code] = { stage, brief, launch, nextDue, created, expStart: exp.start, expEnd: exp.end };
    }
    const byCode: Record<string, Project> = {};
    projects.forEach((p) => (byCode[p.code] = p));

    // 第 2 趟：掃事項 → 里程碑統計（排除已取消）+ openItems + 任務提醒（未結 + 有截止日）。
    const milestones: Record<string, Milestones> = {};
    const reminders: Reminder[] = [];
    for (const tk of taskRows) {
      const pr = tk.properties;
      const status = pChoice(pr, "狀態") || "";
      if (status === CANCELLED) continue;
      const codes = pRel(pr, "關聯專案").map((id) => id2code[id]).filter(Boolean);
      const due = pDate(pr, "截止日");
      const dueMs = due ? Date.parse(due) : NaN;
      const isDone = status === DONE;
      for (const c of codes) {
        const m = milestones[c] ?? (milestones[c] = { total: 0, done: 0, lastDone: NaN, nextUndone: NaN });
        m.total += 1;
        if (isDone) {
          m.done += 1;
          if (!Number.isNaN(dueMs)) m.lastDone = Number.isNaN(m.lastDone) ? dueMs : Math.max(m.lastDone, dueMs);
        } else if (!Number.isNaN(dueMs)) {
          m.nextUndone = Number.isNaN(m.nextUndone) ? dueMs : Math.min(m.nextUndone, dueMs);
        }
      }
      if (OPEN_STATES.includes(status)) {
        codes.forEach((c) => byCode[c] && (byCode[c].openItems += 1));
        if (due) {
          reminders.push({
            text: pTitle(pr, "事項名稱") || "(未命名)", due, project: codes[0] || "",
            client: pChoice(pr, "客戶") || "", priority: prio(pChoice(pr, "優先級")),
            type: pChoice(pr, "類型") || "",
          });
        }
      }
    }
    reminders.sort((a, b) => a.due.localeCompare(b.due));

    // 第 3 趟：回填完成度 + 缺時間提醒旗標。
    for (const p of projects) {
      const r = computeCompletion(rawByCode[p.code], milestones[p.code], todayMs);
      p.completion = r.completion;
      p.needsSchedule = r.needsSchedule;
    }

    return {
      title: "我的工作進度與規劃", source: "Notion · 全客戶專案總表 + 追蹤事項庫",
      syncedAt: today, today, live: true, projects, reminders,
    };
  } catch (e) {
    console.error("Notion fetch failed, fallback to sample:", e);
    return { ...SAMPLE, today, syncedAt: today, live: false };
  }
}

// ---- 範例資料（沒 token / 連線失敗時用） ----
const SAMPLE: Portfolio = {
  title: "我的工作進度與規劃",
  source: "範例資料（未連 Notion）",
  syncedAt: "—", today: "—", live: false,
  projects: [
    { code: "DEMO-01", icon: "🐾", client: "示範客戶 A", name: "形象短片企劃", stage: "進行中", priority: "高", completion: 45, openItems: 5, needsSchedule: false, brief: "2026-05-14", nextDue: "2026-06-04", launch: "2026-07-03", thisWeek: "腳本定稿、確認場景", risk: "拍攝檔期待確認", url: "#" },
    { code: "DEMO-02", icon: "🏦", client: "示範客戶 B", name: "年度數位企劃", stage: "進行中", priority: "中", completion: 30, openItems: 3, needsSchedule: false, brief: "2026-05-13", nextDue: "2026-06-12", launch: "2026-08-03", thisWeek: "UX 與客戶討論", risk: "—", url: "#" },
    { code: "DEMO-03", icon: "🩺", client: "示範客戶 C", name: "公益社群短影音", stage: "未開始", priority: "中", completion: 0, openItems: 0, needsSchedule: true, brief: null, nextDue: null, launch: null, thisWeek: "等 brief", risk: "—", url: "#" },
  ],
  reminders: [
    { text: "回覆客戶提案版本", due: "2026-06-02", project: "DEMO-01", client: "示範客戶 A", priority: "高", type: "我方承諾" },
    { text: "UAT 完成", due: "2026-06-04", project: "DEMO-01", client: "示範客戶 A", priority: "高", type: "我方承諾" },
    { text: "主視覺確認", due: "2026-06-05", project: "DEMO-02", client: "示範客戶 B", priority: "中", type: "對方承諾" },
  ],
};
