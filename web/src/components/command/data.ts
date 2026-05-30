// =====================================================================
// 羅德島總控 // data.ts —— 型別 + 假資料（public repo 安全，無真實客戶）
// 線上畫面由 page.tsx 傳入的 Notion live 資料覆蓋；RHODES_DATA 僅為佔位。
// =====================================================================

export interface ProjectItem {
  code: string; client: string; tag: string; priority: string;
  title: string; status: string; progress: number;
  next: string; launch: string; pin: string;
  url: string; // 該專案的 Notion 頁面連結（"#" 或空 = 無連結）
}
export interface TaskItem { title: string; meta: string; due: string; hot: boolean; }
export interface OperatorItem { name: string; role: string; idx: string; state: string; }

export interface RhodesData {
  syncDate: string;
  flavor: string;
  stats: { total: number; active: number; overdue: number; readiness: number };
  due7: number;
  projects: ProjectItem[];
  tasks: { within7: TaskItem[]; later: TaskItem[] };
  advisory: string[];
  operators: OperatorItem[];
  operatorFlow: string;
}

export const RHODES_DATA: RhodesData = {
  syncDate: "2026-01-01",
  flavor: "別皺眉，東尼大木博士。情勢仍在掌控之中——確認過，就繼續前進。",
  stats: { total: 3, active: 3, overdue: 0, readiness: 40 },
  due7: 1,
  projects: [
    { code: "PRJ-A01", client: "示範客戶 A", tag: "A", priority: "高",
      title: "形象短片企劃",
      status: "進行中", progress: 45, next: "—", launch: "—", pin: "—", url: "#" },
    { code: "PRJ-B01", client: "示範客戶 B", tag: "B", priority: "中",
      title: "年度數位企劃",
      status: "進行中", progress: 40, next: "—", launch: "—", pin: "—", url: "#" },
    { code: "PRJ-C01", client: "示範客戶 C", tag: "C", priority: "中",
      title: "公益社群短影音",
      status: "進行中", progress: 30, next: "2026-02-01", launch: "—", pin: "等 brief", url: "#" },
  ],
  tasks: {
    within7: [
      { title: "回覆提案版本", meta: "PRJ-A01 · 示範客戶 A · 我方承諾", due: "5 天後", hot: true },
      { title: "主視覺確認", meta: "PRJ-B01 · 示範客戶 B · 對方承諾", due: "6 天後", hot: false },
    ],
    later: [
      { title: "交付印刷檔", meta: "PRJ-A01 · 示範客戶 A · 我方承諾", due: "2026-02-11", hot: true },
      { title: "客戶教育訓練", meta: "PRJ-B01 · 示範客戶 B · 我方承諾", due: "2026-02-22", hot: false },
    ],
  },
  advisory: [
    "有 1 個任務在 7 天內到期，先確認排程與交付。",
    "3 個專案同時進行中，把當週交付拆成任務逐一推進——對幹員下令即可調度。",
  ],
  operators: [
    { name: "需求分析師", role: "PRODUCT-OWNER", idx: "01", state: "待命" },
    { name: "專案規劃師", role: "PLANNER", idx: "02", state: "待命" },
    { name: "開發工程師", role: "DEVELOPER", idx: "03", state: "待命" },
    { name: "程式審查員", role: "REVIEWER", idx: "04", state: "待命" },
    { name: "品質驗收員", role: "QA", idx: "05", state: "待命" },
    { name: "企劃", role: "CREATIVE-PLANNER", idx: "06", state: "待命" },
    { name: "導演", role: "DIRECTOR", idx: "07", state: "待命" },
    { name: "剪輯", role: "EDITOR", idx: "08", state: "待命" },
  ],
  operatorFlow: "菁英幹員編制：需求 → 規劃 → 開發 → 審查 → 驗收（＋企劃 → 導演 → 剪輯）。博士，下達指令即可調度幹員——說「我要加一個功能」或「我要做一支影片」，幹員就位。",
};
