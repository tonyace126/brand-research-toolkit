import Dashboard from "@/components/dashboard";
import { getPortfolio } from "@/lib/notion";
import type { Agent } from "@/lib/types";

// 每次請求都即時連 Notion（不要在 build 時靜態化）
export const dynamic = "force-dynamic";

const AGENTS: Agent[] = [
  { id: "po", name: "需求分析師", role: "product-owner", emoji: "🧭", status: "idle" },
  { id: "planner", name: "專案規劃師", role: "planner", emoji: "🗺️", status: "idle" },
  { id: "dev", name: "開發工程師", role: "developer", emoji: "💻", status: "idle" },
  { id: "reviewer", name: "程式審查員", role: "reviewer", emoji: "🔍", status: "idle" },
  { id: "qa", name: "品質驗收員", role: "qa", emoji: "✅", status: "idle" },
  { id: "creative", name: "企劃", role: "creative-planner", emoji: "📝", status: "idle" },
  { id: "director", name: "導演", role: "director", emoji: "🎬", status: "idle" },
  { id: "editor", name: "剪輯", role: "editor", emoji: "✂️", status: "idle" },
];

export default async function Page() {
  const data = await getPortfolio();
  return (
    <main>
      <Dashboard data={data} agents={AGENTS} />
    </main>
  );
}
