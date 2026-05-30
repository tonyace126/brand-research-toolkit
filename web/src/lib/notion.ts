import "server-only";
import type { Project, Reminder, Portfolio, Priority, Stage } from "./types";
export type { Project, Reminder, Portfolio, Priority, Stage } from "./types";

const API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const OPEN_STATES = ["待執行", "進行中"];

function prio(name?: string | null): Priority {
  if (!name) return "中";
  if (name.includes("🔴") || name.includes("最高") || name.includes("高")) return "高";
  if (name.includes("🟢") || name.includes("一般") || name.includes("低")) return "低";
  return "中";
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
  const today = new Date().toISOString().slice(0, 10);
  if (!token) {
    return { ...SAMPLE, today, syncedAt: today, live: false };
  }
  try {
    const projDb = process.env.NOTION_PROJECTS_DB || (await findDb("全客戶專案總表", token));
    const taskDb = process.env.NOTION_TASKS_DB || (await findDb("追蹤事項庫", token));
    const [projRows, taskRows] = await Promise.all([queryAll(projDb, token), queryAll(taskDb, token)]);

    const id2code: Record<string, string> = {};
    const projects: Project[] = [];
    for (const pg of projRows) {
      const pr = pg.properties;
      const stage = (pChoice(pr, "階段") || "進行中") as Stage;
      if (stage === "完成") continue;
      const code = pTitle(pr, "專案代碼") || pg.id.slice(0, 8);
      id2code[pg.id] = code;
      projects.push({
        code, icon: pIcon(pg), client: pChoice(pr, "客戶") || "",
        name: pText(pr, "專案名稱") || code, stage, priority: prio(pChoice(pr, "優先級")),
        completion: stage === "未開始" ? 0 : 40, openItems: 0,
        brief: pDate(pr, "Brief 收件日"), nextDue: pDate(pr, "下個關鍵期限"), launch: pDate(pr, "預計上線"),
        thisWeek: pText(pr, "本週要做") || "—", risk: pText(pr, "風險警示") || "—",
        url: pUrl(pr, "專案頁面") || `https://www.notion.so/${pg.id.replace(/-/g, "")}`,
      });
    }
    const byCode: Record<string, Project> = {};
    projects.forEach((p) => (byCode[p.code] = p));

    const reminders: Reminder[] = [];
    for (const tk of taskRows) {
      const pr = tk.properties;
      if (!OPEN_STATES.includes(pChoice(pr, "狀態") || "")) continue;
      const codes = pRel(pr, "關聯專案").map((id) => id2code[id]).filter(Boolean);
      codes.forEach((c) => byCode[c] && (byCode[c].openItems += 1));
      const due = pDate(pr, "截止日");
      if (!due) continue;
      reminders.push({
        text: pTitle(pr, "事項名稱") || "(未命名)", due, project: codes[0] || "",
        client: pChoice(pr, "客戶") || "", priority: prio(pChoice(pr, "優先級")),
        type: pChoice(pr, "類型") || "",
      });
    }
    reminders.sort((a, b) => a.due.localeCompare(b.due));
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
    { code: "DEMO-01", icon: "🐾", client: "示範客戶 A", name: "形象短片企劃", stage: "進行中", priority: "高", completion: 45, openItems: 5, brief: "2026-05-14", nextDue: "2026-06-04", launch: "2026-07-03", thisWeek: "腳本定稿、確認場景", risk: "拍攝檔期待確認", url: "#" },
    { code: "DEMO-02", icon: "🏦", client: "示範客戶 B", name: "年度數位企劃", stage: "進行中", priority: "中", completion: 30, openItems: 3, brief: "2026-05-13", nextDue: "2026-06-12", launch: "2026-08-03", thisWeek: "UX 與客戶討論", risk: "—", url: "#" },
    { code: "DEMO-03", icon: "🩺", client: "示範客戶 C", name: "公益社群短影音", stage: "未開始", priority: "中", completion: 0, openItems: 0, brief: null, nextDue: "2026-06-20", launch: "2026-06-20", thisWeek: "等 brief", risk: "—", url: "#" },
  ],
  reminders: [
    { text: "回覆客戶提案版本", due: "2026-06-02", project: "DEMO-01", client: "示範客戶 A", priority: "高", type: "我方承諾" },
    { text: "UAT 完成", due: "2026-06-04", project: "DEMO-01", client: "示範客戶 A", priority: "高", type: "我方承諾" },
    { text: "主視覺確認", due: "2026-06-05", project: "DEMO-02", client: "示範客戶 B", priority: "中", type: "對方承諾" },
  ],
};
