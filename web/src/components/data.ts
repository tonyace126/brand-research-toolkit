// 羅德島總控 // 資料型別與範例資料
// 把 rhodesData 換成你線上 app 的真實資料即可（型別已定義好）。

export type Priority = "高" | "中" | "低";

export interface ProjectItem {
  code: string;
  client: string;
  tag: string;        // 客戶代號徽記（2–4 字）
  priority: Priority;
  title: string;
  status: string;     // 例：進行中 / 待啟動 / 驗收中
  progress: number;   // 0–100
  next: string;       // 下個關鍵日（"—" 表未定）
  launch: string;     // 上線日
  pin: string;        // 釘選備註
}

export interface TaskItem {
  title: string;
  meta: string;       // 例：DEMO-01 · 示範客戶 A · 我方承諾
  due: string;        // "5 天後" 或 "2026-06-11"
  hot: boolean;       // 是否為重點（藍點 vs 灰點）
}

export interface OperatorItem {
  name: string;
  role: string;       // 英文職稱（大寫）
  idx: string;        // 編號 "01"…
  state: string;      // 例：待命 / 作戰中
}

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

export const rhodesData: RhodesData = {
  // 註：此範例為佔位資料（repo 為公開）。實際畫面由 page.tsx 傳入的 Notion live 資料覆蓋。
  syncDate: "2026-01-01",
  flavor: "別皺眉，東尼大木博士。情勢仍在掌控之中——確認過，就繼續前進。",
  stats: { total: 3, active: 3, overdue: 0, readiness: 40 },
  due7: 1,
  projects: [
    { code: "DEMO-01", client: "示範客戶 A", tag: "A", priority: "高",
      title: "形象短片企劃",
      status: "進行中", progress: 45, next: "—", launch: "—", pin: "—" },
    { code: "DEMO-02", client: "示範客戶 B", tag: "B", priority: "中",
      title: "年度數位企劃",
      status: "進行中", progress: 40, next: "—", launch: "—", pin: "—" },
    { code: "DEMO-03", client: "示範客戶 C", tag: "C", priority: "中",
      title: "公益社群短影音",
      status: "進行中", progress: 30, next: "2026-02-01", launch: "—", pin: "等 brief" },
  ],
  tasks: {
    within7: [
      { title: "回覆提案版本", meta: "DEMO-01 · 示範客戶 A · 我方承諾", due: "5 天後", hot: true },
      { title: "主視覺確認", meta: "DEMO-02 · 示範客戶 B · 對方承諾", due: "6 天後", hot: false },
    ],
    later: [
      { title: "交付印刷檔", meta: "DEMO-01 · 示範客戶 A · 我方承諾", due: "2026-02-11", hot: true },
      { title: "客戶教育訓練", meta: "DEMO-02 · 示範客戶 B · 我方承諾", due: "2026-02-22", hot: false },
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
  operatorFlow:
    "菁英幹員編制：需求 → 規劃 → 開發 → 審查 → 驗收（＋企劃 → 導演 → 剪輯）。博士，下達指令即可調度幹員——說「我要加一個功能…」或「我要做一支影片…」，幹員就位。",
};
