# HTML 範本客製化指南

## 為什麼用 CSS 變數
範本只用 8 個 CSS 變數控制視覺。要客製不需要碰範本本身，只要在你的 GitHub Pages repo 根目錄放一個 override CSS 檔。

## 可調的變數

| 變數 | 預設值 | 用途 |
|---|---|---|
| `--color-bg` | `#ffffff` | 頁面背景色 |
| `--color-text` | `#1a1a1a` | 主文字色 |
| `--color-muted` | `#6b7280` | 副資訊（meta、來源）色 |
| `--color-accent` | `#2563eb` | 強調色（連結、邊框） |
| `--color-border` | `#e5e7eb` | 分隔線、表格框線 |
| `--color-card` | `#f9fafb` | 表頭、TL;DR 卡片背景 |
| `--font-sans` | system + Inter + PingFang TC | 主字型 |
| `--max-width` | `760px` | 內容區寬度上限 |
| `--radius` | `8px` | 圓角半徑 |

## 步驟

### 1. 建立 override CSS
在你的 GitHub Pages repo 根目錄新建 `my-theme.css`（檔名隨意）：

```css
:root {
  --color-bg: #faf7f2;
  --color-accent: #c8553d;
  --font-sans: "Noto Serif TC", serif;
}
```

只寫想覆蓋的變數，其他繼承預設。

### 2. 寫入設定檔
編輯 `~/.config/research-publisher.json`：
```json
{
  ...
  "theme_overrides": "my-theme.css"
}
```

### 3. 重新產出
下次跑 publish-research-html，產出的 HTML 會自動 `<link>` 你的 CSS。

## 進階：完全自訂 layout

要改的不只是顏色字型（例如要加 hero 區塊、要改 grid layout）：

1. 把 `assets/newsletter-template.html` 拷貝出來、自己改
2. 把改好的範本路徑寫入設定檔（v1 暫不支援，v2 會加 `template_path` 欄位）
3. 或直接 fork 整個 plugin、改自己的版

## 範例

`assets/theme-vars.css` 是 範例主題（米色 + 暖紅 + 思源黑體 / 思源宋體）。

## 字型建議

中文字型載入較慢，建議用 system fallback：
```css
--font-sans: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif;
```

要用網路字型（Noto Serif TC、Noto Sans TC）：在 override CSS 開頭加 `@import url(...);`。注意速度。
