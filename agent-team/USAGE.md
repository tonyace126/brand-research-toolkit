# 🐝 小蜜蜂 — 代理團隊專案管理系統 · 使用懶人包

> 一句話：用一支 AI 代理團隊管控「需求 → 開發 / 製作 → 交付」，並把所有專案的
> 進度、時程、待辦在一頁 dashboard 上一眼看完。資料以你的 **Notion** 為源頭。

---

## 1. 兩個分頁

dashboard 上方可切換（手機若用內建檢視器不跑 JS，會兩頁上下堆疊，往下捲即可）：

| 分頁 | 看什麼 | 資料來源 |
|---|---|---|
| 🐝 **代理團隊** | 單一專案的代理流程、看板、每日/每週數據、Gantt | `agent-team/data/`（repo 內）|
| 📊 **我的專案總覽** | 所有專案的完成度、時程、當前任務提醒、建議 | Notion（快照）|

---

## 2. 代理團隊（8 個角色）

**軟體/一般軌道**：🧭 需求分析 → 🗺️ 規劃 → 💻 開發 → 🔍 審查 → ✅ 驗收
**影片軌道**：📝 企劃 → 🎬 導演 → ✂️ 剪輯 → 🎬 審片 → ✅ 驗收

角色定義在 `.claude/agents/`，Claude Code 會自動載入。

---

## 3. 常用指令（直接對 Claude 說）

| 你說 | 會發生什麼 |
|---|---|
| 「我想加一個功能：…」 | 🧭 需求分析建任務 → 🗺️ 規劃排程 |
| 「我要做一支影片：…」 | 📝 企劃接手寫腳本/分鏡 → 交導演 |
| 「推進 T-002」 | 依任務狀態交給對應代理往前推一棒 |
| 「這週進度如何」 | 彙總回報並刷新 dashboard |
| **「更新總覽」** | 從 Notion 重新拉專案＋待辦，重產 dashboard |
| **「清理 XX」** | 批次把過期/已結束事項標完成或取消（寫 Notion，先確認）|
| **「把 OO 標完成」** | 單筆更新 Notion 狀態 |
| **「把 OO 改期到 X/X」** | 單筆更新 Notion 截止日 |
| 「再加一個 XX 角色」 | 新增代理（如配音、美術、客戶窗口）|

---

## 4. Notion 同步流程

- 「📊 我的專案總覽」資料 = Notion「全客戶專案總表」＋「追蹤事項庫」的**快照**。
- 靜態 HTML 無法即時連 Notion，所以採**同步快照**：你說「更新總覽」才重新拉。
- 當前任務提醒 = 追蹤事項庫的開放事項（待執行/進行中），依截止日分組（逾期/7天內/之後）。
- 完成度（completion）Notion 主表沒存 %，是可手動調整的估計值；說「把某專案改成 X%」即可。

---

## 5. 隱私設定（重要）

- 客戶實際資料只存在兩個地方：**你的 Notion（源頭）** + **本機產生的 dashboard 檔**。
- `agent-team/data/portfolio.json` 與 `agent-team/dashboard/index.html` 已加入 `.gitignore`，
  **永遠不會被 commit 進 repo**，所以公開 repo 不會外洩客戶資料。
- 框架本體（程式、角色、schema）是通用的，可公開分享。

---

## 6. 怎麼看 / 更新 dashboard

```bash
# 重新產生（讀 data/ 與 portfolio.json）
python3 agent-team/dashboard/generate.py

# 瀏覽器打開
open agent-team/dashboard/index.html        # macOS
xdg-open agent-team/dashboard/index.html    # Linux
```

### 釘到手機 + 「立即更新」按鈕（自助同步）

dashboard 內建一顆 **「⟳ 立即更新」** 按鈕，搭配 `serve.py` 本機服務使用：

```bash
python3 agent-team/dashboard/serve.py        # 預設 http://0.0.0.0:8787
```

1. 手機與電腦同網路，用 **Safari / Chrome** 開 `http://<電腦IP>:8787`。
2. 瀏覽器選單 →「**加入主畫面**」即可釘成 App 圖示。
3. 按「⟳ 立即更新」→ 服務會重產 dashboard 並刷新。
4. 若電腦沒開機 / 服務沒啟動 → 按鈕會跳出 **「⚠️ 終端機未連線！」**。

> 註：按鈕只在用真正的瀏覽器（非 App 內建檢視器）開啟時有作用。
> 「立即更新」目前會重產 dashboard；要連動 Notion 即時重拉，需另設 Notion token（見 serve.py 註解）。

---

## 7. 檔案速查

```
.claude/agents/            8 個角色代理
skills/project-orchestrator/SKILL.md   編排邏輯與固定指令
agent-team/
├── USAGE.md               ← 你正在讀的懶人包
├── README.md              框架說明
├── data/                  project/agents/tasks/activity（repo 內）
│                          portfolio.json（Notion 快照，已 gitignore）
├── schema/                各資料檔 JSON Schema
└── dashboard/
    ├── generate.py        產生器（純 Python，無依賴）
    ├── serve.py           本機服務 +「立即更新」API
    └── index.html         產出的 dashboard（已 gitignore）
```
