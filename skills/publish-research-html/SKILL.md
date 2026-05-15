---
name: publish-research-html
description: Convert any research result (tables, summaries, sources) into a clean, responsive HTML newsletter and optionally auto-push to a GitHub Pages repo. Use when user says "做成 HTML", "推到 my-shares", "publish as newsletter", "把這份報告做成電子報", "發到網頁版", or after completing any research task that should be shareable.
---

# Publish Research HTML

把任何研究結果（表格、摘要、來源）轉成乾淨響應式 HTML 電子報，可選擇自動 push 到 GitHub Pages。

## 何時使用
- 研究剛做完想分享
- 把對話內容沉澱成可長期存取的網址
- 內部 / 客戶 / 公開電子報

## 流程（4 步）

### 1. 讀設定檔
讀 `~/.config/research-publisher.json`：
- 存在 → 直接使用
- 不存在 → 跑 setup（見下方）

### 2. 整理輸入
從研究結果擷取：
- **title**：頁面標題
- **tldr**：100 字內摘要
- **body**：主要內容（含表格、段落、卡片清單）
- **sources**：來源連結清單
- **slug**：英文 kebab-case 檔名（例：`2026-05-tw-bank-viral-videos`）

### 3. 套用範本
讀 `assets/newsletter-template.html`，做變數替換：

| Token | 內容 |
|---|---|
| `{{TITLE}}` | 頁面標題 |
| `{{TLDR}}` | TL;DR 摘要 |
| `{{AUTHOR}}` | 設定檔的 default_author |
| `{{DATE}}` | 今天日期（YYYY-MM-DD） |
| `{{YEAR}}` | 今年（footer 用） |
| `{{READ_TIME}}` | 估計閱讀分鐘（每 500 字 ≈ 1 分鐘） |
| `{{HOME_URL}}` | 設定檔的 shares_base_url |
| `{{BODY}}` | 主要內容 HTML |
| `{{SOURCES}}` | `<li>` 清單 |
| `{{THEME_OVERRIDE_LINK}}` | 若 theme_overrides 設定存在則 `<link rel="stylesheet" href="...">`，否則空字串 |

寫到 `<shares_repo_path>/<slug>.html`。

### 4. 詢問是否 push
顯示產出路徑 + 預覽連結（`file://`），問：「Push 到 GitHub Pages 嗎？」
- y → 執行 git add/commit/push（見下方）
- n → 結束（檔案已在本機）

## Setup 流程（首次使用）

互動式問 5 題：

```
1. GitHub Pages repo 本機絕對路徑？
   例：/Users/wangyigong/my-shares
2. 對外網址（不含尾斜線）？
   例：https://tonyace126.github.io/my-shares
3. 作者署名？
   例：Tony Wang
4. 要用自訂主題嗎？(y/n，n = 通用範本)
5. （若上題 y）自訂主題 CSS 檔名（放在 repo 根目錄）？
   例：my-theme.css
```

寫入 `~/.config/research-publisher.json`：
```json
{
  "shares_repo_path": "...",
  "shares_base_url": "...",
  "default_author": "...",
  "theme_overrides": "..." 或 null
}
```

驗證：
- 確認 repo 路徑存在 + 是 git repo
- 模擬產出 `_setup-test.html`（不 commit），確認可寫
- 不真的 push

## Push 流程

```bash
cd <shares_repo_path>
git add <slug>.html
git commit -m "Add: <title>"
git push
```

完成後：
- 顯示對外網址：`<shares_base_url>/<slug>.html`
- 提醒「1-2 分鐘後 GitHub Pages 部署完成」

## 命名規範
- 檔名：英文 kebab-case + 主題明確
- 好：`2026-05-tw-bank-viral-videos.html`
- 爛：`research.html`、`report-final-v2.html`
- **不動 index.html**（首頁邏輯使用者自管）

## CSS 變數客製化
詳見 `references/customization-guide.md`。

## GitHub Pages 第一次設定
詳見 `references/github-pages-setup.md`。

## 錯誤處理
- repo 路徑不存在 → 提示先建 GH Pages repo（連 setup guide）
- git push 失敗 → 顯示錯誤、保留 HTML 檔、不刪除
- theme_overrides 檔不存在 → 警告但繼續產出（用預設主題）
