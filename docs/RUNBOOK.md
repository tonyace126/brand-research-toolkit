# 🐝 小蜜蜂 — 完整流程 Runbook（本地端 / 雲端兩種做法）

> 你的專案儀表板有「**兩種跑法**」，這份文件把兩種都留底，以後照著做就能重現。
> 資料源頭永遠是你的 **Notion**（全客戶專案總表 + 追蹤事項庫）。

---

## 系統有哪些部分

| 部分 | 位置 | 說明 |
|---|---|---|
| 代理團隊（8 角色） | `.claude/agents/` | 需求/規劃/開發/審查/驗收 + 企劃/導演/剪輯 |
| 編排 skill | `skills/project-orchestrator/` | 串流程、Notion 同步指令 |
| **A. Python 靜態版** | `agent-team/` | 產生靜態 HTML，搭配本機服務 + cloudflared 給手機看（快照式，有「立即更新」鈕）|
| **B. Next.js 現代版** | `web/` | React/Tailwind，直連 Notion 即時資料，可本地跑或部署 Vercel |

目前正式在用的是 **B（Next.js）部署在 Vercel**。

---

## 🌩️ 做法一：雲端（Vercel）— 推薦，永遠在線

**特性**：永遠在線、不需要 Mac 開著、每次開啟即時抓 Notion、密碼保護。

**正式網址**：`https://brand-research-toolkit.vercel.app/`（輸入 `DASH_PASSWORD` 進入）

**部署 / 重建步驟**
1. vercel.com 用 GitHub 登入 → Add New → Project → Import `brand-research-toolkit`
2. **Root Directory = `web`**、Framework = Next.js（自動）
3. 環境變數（Settings → Environment Variables）：
   - `NOTION_TOKEN` = 你的 Notion token
   - `DASH_PASSWORD` = 進站密碼
   - `NOTION_PROJECTS_DB` = 〈全客戶專案總表的 database id〉
   - `NOTION_TASKS_DB` = 〈追蹤事項庫的 database id〉
4. Deploy

**改東西怎麼上線**：改 `web/` 的程式 → `git push` → **Vercel 自動重新部署**，網址不變。

**即時同步**：開啟/重新整理頁面就抓最新 Notion，無需按更新。

---

## 💻 做法二：本地端（你的 Mac）— 不想依賴雲端時

### 2-A. 本地跑 Next.js 版（看現代 UI）
```bash
cd ~/brand-research-toolkit/web
npm install            # 第一次或更新依賴時
cp .env.example .env.local   # 填 NOTION_TOKEN（要看真實資料才需要）
npm run dev            # http://localhost:3000
```
- 沒填 token → 顯示範例資料；填了 → 即時抓你的 Notion。
- 只在這台電腦看；要手機看需另開通道（這正是雲端版解決的事）。

### 2-B. 舊的 Python 靜態版 + 手機（快照式）
```bash
# 產生 dashboard
python3 ~/brand-research-toolkit/agent-team/dashboard/generate.py
open ~/brand-research-toolkit/agent-team/dashboard/index.html

# 給手機看（背景服務 + 對外通道）
bash ~/brand-research-toolkit/agent-team/dashboard/service/install-macos.sh
bash ~/brand-research-toolkit/agent-team/dashboard/service/registry-url.sh   # 拿固定登錄網址
# 手機空殼：https://tonyace126.github.io/brand-research-toolkit/agent-team/dashboard/shell.html
```
- 這版是「快照」，按手機上的「⟳ 立即更新」才會重新連 Notion。
- 停用：`bash ~/brand-research-toolkit/agent-team/dashboard/service/uninstall-macos.sh`

---

## 該用哪一個？

| 需求 | 用 |
|---|---|
| 平常用、手機隨時看、不想顧電腦 | **A. 雲端 Vercel**（現用）|
| 純本地、不想上雲、開發/改 UI | **2-A. 本地跑 Next** |
| 不想開新帳號、想要手機自助更新 | **2-B. Python 版 + Mac 服務** |

> 三種共用同一個 Notion 來源，資料一致。雲端版上線後，本地那兩套變成備援/開發用，可留可收。

---

## 密鑰放哪（都不進 repo）
- 雲端：Vercel 環境變數
- 本地 Next：`web/.env.local`
- 本地 Python：`~/.xiaomifeng.env`
- Notion token、DB id、密碼請存在你的私人筆記（不要 commit）。
