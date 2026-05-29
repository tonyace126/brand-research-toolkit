# agent-team — 自動化代理團隊專案管理框架

一套**通用**的專案管理框架：用一支 5 人 AI 代理團隊管控「需求 → 開發 → 交付」全程，
所有狀態沉澱成可版本控管的資料檔，並產出一頁自包式可視化 dashboard。

> 本資料夾以 `brand-research-toolkit` 的 roadmap 當示範資料，打開 dashboard 即可看到效果。

## 它解決什麼

- 把模糊需求變成可驗收的任務，並自動排程、開發、審查、驗收
- 每個代理的流程、每日/每週數據、完成度、計畫時程都有紀錄與可視化
- 零外部依賴、可離線、可推 GitHub Pages 分享

## 代理團隊

| 代理 | 角色 | 職責 | 推進的狀態 |
|---|---|---|---|
| 🧭 `po` | 需求分析師 | 釐清需求、定義驗收標準 | → `backlog` |
| 🗺️ `planner` | 規劃師 | 拆解、估時、排里程碑 | → `planned` |
| 💻 `dev` | 開發工程師 | 實作、自測、送審 | → `in_progress` / `review` |
| 🔍 `reviewer` | 審查員 | 把關品質與正確性 | → 通過交 qa / 退回 dev |
| ✅ `qa` | 驗收員 | 對照 DoD 驗收、判定完成 | → `done` |

### 影片製作軌道（type: video）

同一套狀態機，換一組角色跑影片：

| 代理 | 角色 | 職責 | 推進的狀態 |
|---|---|---|---|
| 📝 `creative` | 企劃 | 發想、腳本、分鏡、定調 | → `backlog` / `planned` |
| 🎬 `director` | 導演 | 統籌拍攝、執行分鏡、後製審片 | → `in_progress` / `review` |
| ✂️ `editor` | 剪輯 | 後製、配樂字幕、調色、輸出 | → `in_progress` / `review` |
| ✅ `qa` | 驗收員 | 最終驗收成片 | → `done` |

影片流程：📝 企劃(腳本/分鏡) → 🎬 導演(拍攝統籌) → ✂️ 剪輯(後製) → 🎬 導演審片 → ✅ 驗收。

角色定義在 repo 根目錄 `.claude/agents/`（Claude Code 會自動載入）。
串接流程的編排邏輯在 `skills/project-orchestrator/SKILL.md`。

## 目錄結構

```
agent-team/
├── README.md                ← 你正在讀的這份
├── data/                    ← 單一真實來源（可版本控管）
│   ├── project.json         專案 meta + 里程碑
│   ├── agents.json          代理與目前狀態
│   ├── tasks.json           所有任務（狀態/完成度/估時/時程）
│   ├── activity.jsonl       事件流（每行一筆，餵每日/每週數據）
│   └── portfolio.json       我的專案總覽（Notion 快照，第二分頁用）
├── schema/                  ← 各資料檔的 JSON Schema
└── dashboard/
    ├── generate.py          產生器（純 Python 標準庫，無依賴）
    └── index.html           產出的可視化頁面（自包式）
```

## 快速開始

```bash
# 1. 產生／更新 dashboard
python3 agent-team/dashboard/generate.py

# 2. 用瀏覽器打開
open agent-team/dashboard/index.html      # macOS
xdg-open agent-team/dashboard/index.html  # Linux
```

指定基準日期（影響「近 14 天 / 近 5 週」的計算）：

```bash
python3 agent-team/dashboard/generate.py 2026-05-29
```

## Dashboard 包含

- **整體完成度**甜甜圈 + 時程進度條 + 距目標天數
- **KPI**：總任務 / 已完成 / 進行中 / 完成率 / 本週完成 / 投入工時
- **代理團隊狀態**：每個代理目前在做什麼、今日事件數、負責任務數
- **流程看板**：任務依 backlog→planned→in_progress→review→done 分欄
- **里程碑完成度**：每個里程碑的進度條與達成率
- **每日活動**（近 14 天）：事件數長條 + 任務完成標記
- **每週彙總**（近 5 週）：新增 / 完成 / 完成率
- **計畫時程 Gantt**：每個任務時間軸、進度填充、里程碑菱形、今日線
- **活動軌跡**：最近 16 筆事件

## 兩個分頁

dashboard 上方可切換：

1. **🐝 代理團隊** — 單一專案的代理流程、看板、每日/每週數據、Gantt（資料來自 `tasks.json` 等）。
2. **📊 我的專案總覽** — 跨所有專案的鳥瞰（資料來自 `portfolio.json`，以 Notion 為主）：
   - 每個專案的客戶、階段、優先級、**完成度**、下個關鍵期限、預計上線、**未結事項數**
   - **當前任務提醒**：直接來自 Notion「✅ 追蹤事項庫」的開放事項（狀態=待執行/進行中），
     依截止日分組（🔴 已逾期 / 🟡 7 天內 / ⚪ 之後），標優先級與類型（我方承諾/對方承諾/風險警示）
   - **專案時程規劃** Gantt（含今日線、關鍵期限菱形）
   - **我的建議**（自動算出：最急逾期、最近期限、優先聚焦、資料缺口、**資料衛生**：逾期未更新狀態的事項）

### 更新總覽（從 Notion 重新同步）

`portfolio.json` 是 Notion「全客戶專案總表」的快照。資料變動後，對 Claude 說
**「更新總覽」**，它會重新從 Notion 拉取專案、階段、期限、提醒，覆寫 `portfolio.json`
再重產 dashboard。完成度（`completion`）為可手動調整的估計值（Notion 主表未存 %），
可直接說「把某專案完成度改成 60%」。

> 注意：靜態 HTML 無法即時連 Notion，採「同步快照」模式 —— 需要最新數據時主動說一聲重新同步。

## 跑一輪流程（搭配 Claude Code）

對 Claude 說即可（會觸發 `project-orchestrator` skill）：

- 「我想加一個功能：…」 → po 建任務 → planner 排程
- 「推進 T-002」 → 依狀態交給對應代理一棒接一棒
- 「這週進度如何」 → 彙總回報並刷新 dashboard
- 「更新 dashboard」 → 重跑產生器

## 套用到你自己的專案

1. 複製整個 `agent-team/` 資料夾到你的 repo。
2. 改 `data/project.json`（名稱、起訖日、里程碑）。
3. 把 `data/tasks.json` 改成 `{"tasks": []}`、清空 `data/activity.jsonl`。
4. （可選）調 `data/agents.json` 的角色、emoji、顏色。
5. 開始對 Claude 提需求即可。

## 設計取捨

- **資料即真實來源**：用 JSON/JSONL 而非資料庫 — 可 diff、可 PR review、可離線。
- **dashboard 自包式**：產生器把資料 inline 進 HTML，沒有 fetch、沒有 CDN，
  任何環境（含 `file://`）都打得開。
- **代理只是 markdown**：角色用 Claude Code 子代理定義，零執行階段依賴。
