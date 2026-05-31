export type Stage = "進行中" | "未開始" | "完成";
export type Priority = "高" | "中" | "低";

export interface Project {
  code: string;
  icon: string;
  client: string;
  name: string;
  stage: Stage;
  priority: Priority;
  completion: number;
  openItems: number;
  brief: string | null;
  nextDue: string | null;
  nextLabel: string | null; // 下個關鍵里程碑的事項內容（來自專案頁「專案里程碑」表）
  launch: string | null;
  thisWeek: string;
  risk: string;
  url: string;
  needsSchedule: boolean; // 終點時間三層全缺 → 總控標記提醒補
  fromMilestoneTable: boolean; // true = 完成度/下個關鍵來自里程碑表（已成功解析）
}

export interface Reminder {
  text: string;
  due: string;
  project: string;
  client: string;
  priority: Priority;
  type: string;
}

export interface Portfolio {
  title: string;
  source: string;
  syncedAt: string;
  today: string;
  live: boolean;
  projects: Project[];
  reminders: Reminder[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: "active" | "idle" | "blocked";
}
