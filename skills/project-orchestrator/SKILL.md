---
name: project-orchestrator
description: 編排一個自動化代理團隊來管控專案需求與開發（需求分析→規劃排程→開發→審查→驗收），並維護可視化 dashboard。當使用者說「管理這個專案」「我有個新需求」「推進 T-xxx」「跑一輪開發流程」「更新 dashboard」「這週進度如何」「排程一下」時使用。串接 .claude/agents/ 的 5 個角色子代理，讀寫 agent-team/data/ 資料檔，並用 agent-team/dashboard/generate.py 重產可視化頁面。
---

# 專案編排器（Project Orchestrator）

把一個專案的「需求 → 開發 → 交付」全程交給一支 5 人代理團隊跑，所有狀態沉澱成
可版本控管的資料檔，並產出一頁可視化 dashboard。這是一套**通用框架**，可套用到任何專案。

## 團隊與流程

```
🧭 需求分析師(po) → 🗺️ 規劃師(planner) → 💻 開發(dev) → 🔍 審查(reviewer) → ✅ 驗收(qa)
   backlog            planned              in_progress      review            done
```

每個角色的完整職責定義在 `.claude/agents/`（`product-owner` / `planner` /
`developer` / `reviewer` / `qa`）。它們是 Claude Code 子代理，可用 Task/Agent 分派。

### 影片製作軌道（type: video）

同一套狀態機，換一組角色跑影片任務：

```
📝 企劃(creative) → 🎬 導演(director) → ✂️ 剪輯(editor) → 🎬 導演審片 → ✅ 驗收(qa)
   backlog/planned    in_progress         in_progress/review   review        done
```

何時走這條：任務 `type` 為 `video`。路由規則：
- `backlog` → `creative`（發想 + 腳本/分鏡，定案後 `planned`）
- `planned` → `director`（規劃拍攝、統籌素材，`in_progress`）
- 素材到位 → `editor`（後製、輸出成片，完成後 `review`）
- `review` → `director` 審片（通過交 `qa`／退回交 `editor`）
- `qa` 驗收通過 → `done`

新增其他角色：在 `.claude/agents/` 加一個 `<role>.md`、在 `agents.json` 加一筆、
（若是新任務類型）擴充 `schema/tasks.schema.json` 的 `type` enum 與 dashboard 的 tag 樣式即可。

## 資料層（單一真實來源）

全部在 `agent-team/data/`，schema 在 `agent-team/schema/`：

| 檔案 | 內容 |
|---|---|
| `project.json` | 專案 meta、起訖日、里程碑 |
| `agents.json` | 5 個代理、目前狀態與手上任務 |
| `tasks.json` | 所有需求/任務（狀態、指派、完成度、估時、時程）|
| `activity.jsonl` | append-only 事件流（每行一筆，餵每日/每週數據）|

## 編排器要做的事

### A. 有新需求進來
1. 分派 `product-owner` 釐清並建立任務（寫入 `tasks.json`，記錄到 `activity.jsonl`）。
2. 分派 `planner` 拆解、估時、排里程碑（`backlog → planned`）。
3. 回報使用者新任務摘要，問要不要立刻開工。

### B. 推進某任務（「跑一輪」/「推進 T-xxx」）
依任務目前 `status` 分派對應代理，一棒接一棒：
- `planned` → `developer`（開工，`in_progress`）
- `in_progress`（progress≈90）→ `developer` 送審 → `reviewer`
- `review` → `reviewer`（通過交 `qa`／退回交 `dev`）
- reviewer 通過 → `qa` 驗收（通過才 `done`、`completed` 填日期）

每次代理動完資料檔，**編排器負責重新產生 dashboard**（見下）。

### C. 狀態查詢（「這週進度」/「完成度」）
直接讀資料檔彙總回報，並確保 dashboard 是最新的。

## 我的專案總覽（Notion 同步）

第二分頁「📊 我的專案總覽」資料來自 `agent-team/data/portfolio.json`，以 Notion 為主。
固定指令：

### 「更新總覽」/「同步 Notion」
從 Notion 重新拉取，覆寫 `portfolio.json`，再重產 dashboard：
1. 用 `notion-search` 找到專案總表資料庫，讀其 data source
   → 每個專案的 客戶/階段/優先級/下個關鍵期限/預計上線/本週要做/風險。
2. 讀追蹤事項庫的開放事項（狀態=待執行/進行中）→ 寫成 `reminders`
   （含 截止日/優先級/類型/客戶/專案），並回填每個專案的 `open_items` 未結數。
   （資料源 URL 每個工作區不同，用 `notion-search` 即時取得，不寫死在 repo。）
3. `completion` 為手動估計值，更新時保留原值（除非使用者另行指定）。
4. 重跑 `python3 agent-team/dashboard/generate.py`。

### 「清理 XX」/「把 OO 標完成/取消」（會寫進 Notion）
更新追蹤事項庫的 `狀態`（select：待執行/進行中/已完成/已取消），用 `notion-update-page`
的 `update_properties`，properties `{"狀態": "已完成"}`。**寫 Notion 前一定先確認範圍與目標狀態**
（哪些事項、標完成還是取消），批次完成後同步更新 `portfolio.json` 並重產 dashboard。

> 智慧判斷預設：已做完只是忘了打勾 → 已完成；被取代/不做了 → 已取消；過期事件的籌備事項視為已完成。
> 不確定是否仍活著的事項（如未來檔期、跨期任務）預設**保留不動**，先問使用者。

> 注意：靜態 HTML 無法即時連 Notion，採「同步快照」模式 —— 使用者說「更新總覽」才重新拉取。

## 維護資料的硬規則

- **id 連續**：新任務取現有最大 `T-0xx` +1。
- **狀態單向推進**：`backlog→planned→in_progress→review→done`；退件才回退，並在 activity 記錄。
- **只有 qa 能設 `done`**：開發/審查不得跳級判定完成。
- **每個動作都要留痕**：在 `activity.jsonl` append 一行 `{ts, agent, task, action, detail}`，`ts` 用 ISO 8601 含時區。
- **不編造**：估時、完成度、日期據實填；沒做的事不要記。
- **同步代理狀態**：改 `tasks.json` 時一併更新 `agents.json` 的 `status` / `current_task`。

## 重新產生 Dashboard

任何資料變動後執行：

```bash
python3 agent-team/dashboard/generate.py            # 以最新活動日期為基準
python3 agent-team/dashboard/generate.py 2026-05-29 # 指定基準日
```

產出 `agent-team/dashboard/index.html`（自包式、無外部依賴，瀏覽器直接開）。
內容：整體完成度甜甜圈、KPI、代理團隊狀態、流程看板、里程碑完成度、
每日活動（近 14 天）、每週彙總（近 5 週）、計畫時程 Gantt、活動軌跡。

要對外分享可推到 GitHub Pages，或搭配本 repo 的 `publish-research-html` skill。

## 套用到新專案

1. 複製 `agent-team/` 整個資料夾。
2. 改 `data/project.json`（專案名、起訖日、里程碑），清空 `tasks.json` 的 `tasks: []`、`activity.jsonl`。
3. 視需要調 `agents.json`（角色、emoji、顏色）。
4. 對 Claude 說「我有個新需求…」即可開跑。
