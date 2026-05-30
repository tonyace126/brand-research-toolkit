---
name: project-progress-sync
description: 把 GitLab 任務進度 + Slack 討論，核對、分類後同步到 Notion 追蹤事項庫。當使用者說「更新 XX 進度」「同步 RC/法皇 進度到 Notion」「把這個專案進度更新到追蹤事項庫」「抓 #620 / 抓 UI 階段進來」時使用。全程：讀 GitLab（唯讀）→ 核對到正確的 Notion 專案 → 分類 → 提議 → 你確認 → 才寫。
---

# 專案進度同步（GitLab + Slack → Notion）

把工程端(GitLab)與討論端(Slack)的進度，核對、分類後，寫進 Notion「追蹤事項庫」，
讓總控看得到。**唯讀抓取、寫前必先給使用者確認。**

## 前置（使用者本機設定一次）

- `prototype/gitlab-sync/.env`：`GITLAB_BASE_URL` + `GITLAB_TOKEN`（唯讀 `read_api`）
- `prototype/gitlab-sync/project-map.json`：對應關係（Slack 頻道 / GitLab 專案 / Notion 大頭 / 預設分類）
- ⚠️ GitLab API 因雲端 allowlist，通常要在**本機** Claude Code 跑。

## 流程

### 1. 找專案（近期記憶連結）
從使用者的話（客戶 / 專案）對到 `project-map.json` 的條目：
- **找到** → 用該筆的 GitLab 路徑 + Notion 大頭 + 預設分類。
- **找不到 / code 不認得** → 列出近期的 code，**問使用者**「連到最近的 `<code>`，還是新增一筆對應？」確認後追加進 `project-map.json`（這就是核對痛點的解法，不亂猜）。

### 2. 抓 GitLab（唯讀）
```bash
python3 prototype/gitlab-sync/gitlab_issues.py --project "<gitlab_project_path>" --state all
```
拿到 issue 的 `state / labels / assignee / milestone / due_date / web_url`。

### 3.（選用）讀 Slack 補脈絡
讀對應頻道近期訊息，補充討論背景 / 風險。沒接 Slack 也能只靠 GitLab 跑。

### 4. 分類 + 比對
- **狀態**：`closed`→已完成；`opened` 且 label 含「進行中/Doing」→進行中；其餘 `opened`→待執行。
  （Slack 通知分不出「進行中 vs 待執行」，GitLab 的 label/assignee 才分得出 —— 這是直連 API 的價值。）
- **客戶 / 類型 / 關聯專案**：用 `project-map.json` 的預設（如 客戶=法皇、類型=主動追蹤、關聯專案=MTLR052）。
- **查重**：先讀 Notion 追蹤事項庫，比對是否已有同名/同 issue 事項，**已存在則更新、不重複建**。

### 5. 提議（先不寫）
產出「提議更新清單」(diff)：要**新增**哪些、要**改狀態**哪些，按階段分組顯示進度。

### 6. 範圍由使用者指定
**預設不全抓**。等使用者說範圍：「抓 #620」「抓 UI 階段」「全部」，才納入提議。

### 7. 確認後才寫
使用者點頭 → 寫進追蹤事項庫（新增用 create-pages、更新用 update-page），
並關聯到對應的「全客戶專案總表」大頭。

## 原則
- GitLab **唯讀**；token 在 `.env`（gitignore）。
- 寫 Notion 前**一定**先給使用者看 diff 確認。
- 不確定的 code **問，不亂建**（近期記憶連結）。
- 顆粒度：issue 層、按階段分組，讓使用者看得出「現在在哪、下一階段是什麼」。
