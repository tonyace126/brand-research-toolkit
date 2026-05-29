# 🐝 小蜜蜂 — 建置紀錄與操作手冊

**完成日**：2026-05-30
**一句話**：用 AI 代理團隊管控專案，並把所有專案進度／時程／待辦做成手機可看的即時 dashboard，資料以 Notion 為源頭。

---

## 系統總覽

| 層 | 內容 |
|---|---|
| 🤖 代理團隊 | 8 角色（需求/規劃/開發/審查/驗收 + 企劃/導演/剪輯），定義於 `.claude/agents/` |
| 🧠 編排 | `skills/project-orchestrator/SKILL.md`：串流程、維護資料、Notion 同步指令 |
| 🗃️ 資料 | `agent-team/data/`（repo 內 JSON/JSONL）＋ `portfolio.json`（Notion 快照，**gitignore**）|
| 📊 介面 | `dashboard/generate.py` 產生雙分頁 HTML（代理團隊 / 我的專案總覽）|
| 📒 Notion | `dashboard/sync_notion.py` 即時拉「全客戶專案總表 + 追蹤事項庫」 |
| 📱 手機 | GitHub Pages 空殼 `shell.html` + Mac 後端 `serve.py` + cloudflared 隧道 |
| ♾️ 固定網址 | `service/` launchd 背景服務 + Gist 自動發布網址，App 自動讀取 |

## 最終架構（永遠在線版）

```
📱 手機 App（GitHub Pages 空殼，永遠在線、無客戶資料）
      │  ① 讀固定 Gist → 取得目前後端網址
      ▼
📒 Gist（Mac 自動發布目前 cloudflared 網址）
      ▲  背景服務每次拿到新網址就更新
🖥️ 你的 Mac：serve.py（token 上鎖）+ cloudflared 隧道（launchd 背景自動跑）
      │
      ▼
📒 Notion（全客戶專案總表 + 追蹤事項庫）＝ 真正的資料源頭
```
- 電腦關機 → App 顯示「終端機未連線！」（資料安全，都在 Notion）。

## 日常操作

| 想做 | 怎麼做 |
|---|---|
| 看進度 | 點手機 App；按「⟳ 立即更新」即時連 Notion |
| 跑代理流程 | 對 Claude 說「我想加功能…」「我要做一支影片…」「推進 T-xxx」 |
| 更新總覽 | 對 Claude 說「更新總覽」（或 App 按更新）|
| 清理/標完成/改期 | 對 Claude 說「清理 XX」「把 OO 標完成」「改期到 X/X」 |

## 維護 / 故障排除（在 Mac，指令用完整路徑）

```bash
# 重裝/重啟背景服務
bash ~/brand-research-toolkit/agent-team/dashboard/service/install-macos.sh
# 查目前對外網址（重開機後若 App 連不到可手動查）
bash ~/brand-research-toolkit/agent-team/dashboard/service/registry-url.sh
# 停用移除
bash ~/brand-research-toolkit/agent-team/dashboard/service/uninstall-macos.sh
# 除錯日誌
cat ~/Library/Logs/xiaomifeng-publish.log
cat ~/Library/Logs/xiaomifeng-tunnel.log
launchctl list | grep xiaomifeng
```
- 祕密（NOTION_TOKEN / AGENT_TEAM_TOKEN / GIST_TOKEN）只放 `~/.xiaomifeng.env`，**不在 repo**。

## 資料與隱私

- 客戶實際資料只在：**Notion（源頭）** + **Mac 本機產生的 dashboard**。
- `portfolio.json`、`index.html` 已 gitignore，**不會進公開 repo**。
- 空殼 `shell.html` 不含任何客戶資料，故可公開放 Pages。

## 建置過程踩過的關鍵點（備忘）

1. 公開 repo 誤含客戶資料 → 清除檔案＋重寫歷史，並 gitignore 快照。
2. 手機檢視器不跑 JS → 空殼/分頁改漸進增強。
3. Notion 名稱搜尋失敗 → 改用資料庫 ID（`NOTION_PROJECTS_DB` / `NOTION_TASKS_DB`）。
4. launchd PATH 精簡導致 cloudflared 找不到（exit 127）→ `tunnel-agent.sh` 補 PATH。
5. 快速隧道網址會變 → Gist 自動發布 + 空殼自動讀取 = 一勞永逸。

## 待辦／可強化（未做）

- [ ] 把 `AGENT_TEAM_TOKEN` 從預設值換成長隨機字串（登錄網址公開，token 別太好猜）。
- [ ] 影片軌道實拍後跑完 剪輯→審片→驗收。
- [ ] 想 Mac 關機也能用 → 改放 24h 主機 / 具名隧道。
