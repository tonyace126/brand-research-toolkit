# 📱 永遠在線版 — 手機釘選 + 立即更新（B 架構）設定步驟

目標：手機上釘一顆 App，電腦開著就能看最新總覽並「立即更新」；電腦關機時 App 仍打得開，
並顯示「⚠️ 終端機未連線！」。客戶資料只在你電腦 + Notion，空殼頁不含任何客戶資料。

```
📱 空殼(GitHub Pages，永遠在線) ──檢查──▶ 🖥️ 你電腦 serve.py(token 上鎖) ──▶ Notion
                              ◀─通→轉進真 dashboard / 不通→「終端機未連線！」
```

---

## 一、電腦端（每次要用時啟動）

1. **啟動後端**（設一組你自己的密碼當 token）：
   ```bash
   AGENT_TEAM_TOKEN=自己設一組密碼 python3 agent-team/dashboard/serve.py
   ```
2. **開對外通道**（讓手機在外網也連得到）。最簡單用 Cloudflare 快速通道（免帳號）：
   ```bash
   # 安裝：brew install cloudflared（mac）/ 或到 Cloudflare 官網下載
   cloudflared tunnel --url http://localhost:8787
   ```
   會得到一個網址，例如 `https://xxxx-yyyy.trycloudflare.com` → 記下來。
   > 快速通道每次重開網址會變；要固定網址可改用「具名通道（需 Cloudflare 帳號+網域）」或 Tailscale。

---

## 二、空殼頁上線（一次性）

空殼 `agent-team/dashboard/shell.html` **不含客戶資料**，可安心放公開 GitHub Pages：

1. 把這個分支合併到 `main`（或將 Pages 來源設為這個分支）。
2. repo → **Settings → Pages** → Source 選 `main` /（root）→ 存檔。
3. 你的空殼網址會是：
   ```
   https://tonyace126.github.io/brand-research-toolkit/agent-team/dashboard/shell.html
   ```

---

## 三、手機端（一次性）

1. 用 **Safari** 開上面的空殼網址。
2. 第一次會出現設定欄 → 填：
   - **後端網址**：第一步的 cloudflared 網址（如 `https://xxxx.trycloudflare.com`）
   - **Token**：你設的 `AGENT_TEAM_TOKEN`
3. 按「儲存並連線」→ 通了會自動轉進 dashboard。
4. Safari 分享鍵 →「**加入主畫面**」→ 釘成 App 圖示。

設定只存在這支手機（localStorage），不會上傳。

---

## 四、日常使用

| 情境 | 結果 |
|---|---|
| 電腦開著 + serve.py + cloudflared 都在跑 | 點 App → 看最新總覽，按「⟳ 立即更新」即重產 |
| 電腦關機 / 服務沒開 | 點 App → 顯示「⚠️ 終端機未連線！」+ 重試鈕 |
| cloudflared 重開、網址變了 | App 內點「⚙︎ 設定終端網址」更新網址即可 |

---

## 五、讓「立即更新」真的連 Notion（選配）

目前 `/api/sync` 會重產 dashboard（用電腦上現有的資料）。要做到**按一下就即時從 Notion 重拉**，
需在 `agent-team/dashboard/` 放一支 `sync_notion.py`（用 Notion integration token 呼叫 API
覆寫 `portfolio.json`）。`serve.py` 偵測到它就會在重產前先執行。

> 這支要先到 Notion → Settings → Connections → 開一個 integration 拿 token，並把相關資料庫分享給它。
> 需要的話跟我說，我幫你把 `sync_notion.py` 寫好。

---

## 重要前提

- dashboard 顯示的客戶資料來自**你電腦上的 `portfolio.json`**（已 gitignore，不在 repo）。
  全新 clone 的電腦上沒有這份，要先用 Claude 跑「更新總覽」或設好 `sync_notion.py` 來產生。
- 對外一定要設 `AGENT_TEAM_TOKEN`，否則任何人拿到 cloudflared 網址就能看到你的客戶資料。
