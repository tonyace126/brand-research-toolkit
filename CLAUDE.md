# 羅德島總控 — 專案交接

明日方舟（羅德島）風格的**個人專案控制台**：把 Notion 上的專案／追蹤事項，整理成一頁可視化儀表板（完成度、時程、當前任務、凱爾希語氣每日問候、菁英幹員）。線上以 Vercel 部署，密碼保護。

- **線上正式版**：https://brand-research-toolkit.vercel.app/
- **App 主體在 `web/`**（Next.js 16 · React 19 · Tailwind v4 · App Router）
- 倉庫是**公開**的 → ⚠️ **任何客戶資料（名稱、聯絡人、專案內容）一律不可進 git**，只能放 env / 本機。

---

## 🚀 Claude 快速上手（每次接手先讀這段，免得重新摸索浪費 token）

**位置**：`~/work/brand-research-toolkit`，app 在 `web/`。線上 https://brand-research-toolkit.vercel.app/（Vercel 綁 `main`，push 即自動部署）。

**本地跑 — ⚠️ 非互動 shell 沒有 `pnpm`（corepack shim），別試，直接用專案內 next：**
```bash
export PATH="/usr/local/bin:$PATH"     # node/npm 在這
cd ~/work/brand-research-toolkit/web
node_modules/.bin/next dev             # dev（讀 .env.local 連真實 Notion）
node_modules/.bin/next build           # 上線前驗型別
lsof -ti:3000 | xargs kill             # 用完關掉
```

**本地驗證（繞密碼門 + 連真實 Notion）：**
- 起 server 帶臨時密碼：`DASH_PASSWORD=test node_modules/.bin/next dev`
- 進站：chrome-devtools MCP `new_page` 開 `http://localhost:3000/?k=test`（寫 cookie `bk`）；或 curl 帶 `--cookie "bk=test"`。
- 驗快取/動態：`curl -sI <線上網址> | grep -iE "cache-control|x-nextjs-prerender|x-vercel-cache"`（要 `no-store`、**不該**有 `prerender`）。
- ⚠️ 截圖/輸出別讓真實客戶名外洩：驗證時 `document.querySelectorAll('.proj-grid,.bottom').forEach(e=>e.style.visibility='hidden')` 或只截單張卡。

**上線**：build 過 → `git add web/src && git commit && git push origin main`。

**完成度怎麼算**（`web/src/lib/notion.ts`）：里程碑分段+時間插值。起點 Brief收件日→預期時程(起)→建立時間；終點 預計上線→預期時程(迄)→下個關鍵期限。里程碑=追蹤事項庫關聯事項（排除已取消）。終點全缺→卡片紅字「未設預期完成時間」。Notion 專案總表有「預期時程」文字欄可寫「5月開始9月完成」。

---

## 現況（已上線）

- **明日方舟暗色「先鋒」主題** + **亮白「技術藍圖」主題**，右上角按鈕一鍵切換，選擇存 `localStorage`。
- 介面：Hero（每日凱爾希口吻問候，稱「東尼大木博士」）＋ 作戰總覽（完成度環／KPI／專案卡／任務提醒／凱爾希簡報）＋ 菁英幹員卡。
- **幹員人物上傳**：每張幹員卡可拖曳/點選上傳去背 PNG（剪影濾鏡、雙擊裁切）。持久化走 `localStorage`（見下方）。
- 資料**每次請求即時連 Notion**（`force-dynamic`），沒設 token 時顯示示範假資料。

---

## 本地開發

```bash
cd web
pnpm install        # 第一次才需要
pnpm dev            # http://localhost:3000
pnpm run build      # 上線前驗證（type-check + build）
```

### 環境變數 → 建 `web/.env.local`（已被 .gitignore，不會上傳）
```
NOTION_TOKEN=secret_xxx
NOTION_PROJECTS_DB=<全客戶專案總表 db id>
NOTION_TASKS_DB=<追蹤事項庫 db id>
DASH_PASSWORD=<進站密碼>
```
不設 → 顯示示範假資料、且無密碼閘門（`proxy.ts` 邏輯：沒設 `DASH_PASSWORD` 就放行）。

---

## 從本地發佈上線

**Vercel 已綁定這個 repo 的 `main` 分支 → 推 `main` 就自動部署。**
```bash
git add .
git commit -m "說明改了什麼"
git push origin main        # 推上去後 Vercel 自動 build & deploy，約 1–2 分鐘上線
```
- Vercel 專案的 **Root Directory = `web`**；env 變數（NOTION_*/DASH_PASSWORD）設在 Vercel 專案設定的 Production scope。
- 線上資料同步：因為 `force-dynamic`，每次開頁都重新連 Notion，不需手動更新。

---

## 檔案地圖

```
web/
├─ src/app/
│  ├─ page.tsx              伺服端：連 Notion → toRhodes() 映射成 RhodesData → 傳給元件
│  ├─ layout.tsx            <html data-theme="vanguard">、載入 globals/blueprint-theme、image-slot.js
│  ├─ globals.css           設計 token（@theme 顏色/字型/切角/發光）+ :root + data-theme 變體
│  ├─ blueprint-theme.css   亮白技術藍圖主題（[data-theme="blueprint"] 覆寫層）
│  ├─ locked/page.tsx       密碼輸入頁
│  └─ proxy.ts              密碼閘門（cookie bk / ?k=；middleware 在此版叫 "proxy"）
├─ src/components/command/
│  ├─ RhodesCommand.tsx     單檔元件（環/總覽/幹員）+ 主題切換鈕；吃 data prop
│  ├─ rhodes-command.css    HUD 元件層 + 頁面佈局 + 幹員剪影卡(.opfig) 樣式
│  └─ data.ts               型別 RhodesData + 假資料 RHODES_DATA（佔位用，無客戶資料）
├─ src/lib/
│  ├─ notion.ts             伺服端連 Notion REST，getPortfolio() → Portfolio
│  └─ types.ts              Portfolio / Project / Reminder 型別
└─ public/image-slot.js     人物上傳 web component（custom element <image-slot>）
```

---

## 重要慣例 / 注意事項

1. **隱私**：repo 公開。`data.ts` 範例只放「示範客戶 A/B/C」。真實客戶資料只能來自 Notion（env），**不可寫進任何被 git 追蹤的檔**。改完可自查：
   `grep -riE "客戶真名|聯絡人名" web/src web/public`（應為空）。
2. **主題系統**：暗色＝預設（不設或 `data-theme="vanguard"`）；亮白＝`data-theme="blueprint"`。新增主題就在 globals.css 加 `[data-theme="xxx"]{…}`。切換鈕在 `RhodesCommand.tsx`。
3. **資料映射**：要改「任務怎麼分群、徽記怎麼算、戰備度公式、每日問候台詞」都在 `page.tsx` 的 `toRhodes()` 與 `FLAVORS`。
4. **image-slot 持久化**：原版走 design 工具的 `window.omelette`；本專案已加 `localStorage` fallback（`public/image-slot.js` 的 `HAS_LS`/`save`/`load`）。所以線上上傳的圖**存在使用者該裝置的瀏覽器**，換裝置/清快取會消失（非後端儲存）。
5. **Next.js 16 是改版過的**：寫 App Router 程式前，先看 `web/AGENTS.md` 的提醒（API 可能與舊版不同）。
6. **`<image-slot>` 在 TSX**：React 19 的 JSX 型別命名空間問題 → 用 `RhodesCommand.tsx` 裡的字串標籤包裝 `const ImageSlot = "image-slot" as unknown as FC<…>`，不要靠全域 `global.d.ts`。

---

## 還原點 / 版本

- `main` 目前 = **v3 藍圖版完整**（含主題切換 + 人物上傳 + localStorage）。
- 想回某個狀態：`git log --oneline` 找 commit，`git checkout <sha>` 或 `git revert`。
