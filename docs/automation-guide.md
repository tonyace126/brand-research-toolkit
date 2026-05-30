# 自動化使用說明

> 這份文件獨立於主 README，專門說明「研究完成後的自動化」這一塊。
> 三個部件**彼此獨立**，可分開啟用、分開停用，互不影響。

evaluate 一個外部工具能不能裝、再把最安全的一塊接進來 —— 這份就是接進來的成果。

## 總覽

| 部件 | 做什麼 | 啟用方式 | 預設 |
|---|---|---|---|
| 🔔 Slack 完成通知 | 發布電子報時，自動播報到 Slack 頻道 | 填 `.env` | 不發（dry-run） |
| 🔍 Notion 研究知識庫歸檔 | 發布電子報時，自動把研究存成可查詢紀錄 | 設定檔加一欄 | 不歸檔（無動作） |
| 🧭 `repo-install-eval` skill | 評估外部連結能不能安裝 | 說「評估這個連結」 | — |

**設計鐵律**：三者都是**選用、預設無動作**。沒設定就完全無感，不影響公開 plugin 行為。
觸發分層 —— 自動層只放「安全、可逆、不需確認」的通知/歸檔；發信、改 CRM 這類有後果的動作永遠不進自動層。

---

## 🔔 部件一：Slack 完成通知

**模組位置**：`prototype/slack-notify/`（與研究 skill 分離，獨立模組）

### 怎麼運作
```
發布電子報 → publish skill step 5 → notify.py → Slack 頻道
```
`notify.py` 純標準庫、自動讀同目錄 `.env`、**預設 dry-run**（要 `SLACK_LIVE=1` 才真發）。

### 啟用（兩步）
1. Slack → Incoming Webhooks → 選頻道 → 複製 webhook URL
2. 建 `.env`：
   ```bash
   cd prototype/slack-notify
   cat > .env <<'EOF'
   SLACK_WEBHOOK_URL=你的_webhook_url
   SLACK_LIVE=1
   EOF
   ```

### 手動測試
```bash
echo '{"summary":"測試","url":"https://..."}' | python3 notify.py
```
（`.env` 會自動載入，不用再手打 env）

### 停用
刪掉 `.env`，或把 `SLACK_LIVE` 拿掉 → 回到 dry-run，不再真發。

---

## 🔍 部件二：Notion 研究知識庫歸檔

**資料庫**：`🔍 品牌研究知識庫`（獨立於客戶專案，放在「個人專案區」底下）

### 怎麼運作
```
發布電子報 → publish skill step 6 → Notion 新增一筆紀錄
```
帶：主題、研究日期、涵蓋平台、聲量級距、重點摘要、發布網址、來源數。
`關聯專案` 欄**選填**：純研究時留空；要連客戶專案時才填（單向關聯，不污染客戶總表）。

### 啟用（一步）
在 `~/.config/research-publisher.json` 加一欄：
```json
"research_kb_data_source_id": "<你的知識庫 data source id>"
```
之後只要 session 連著 Notion，發布時就自動歸檔。

### 停用
拿掉 `research_kb_data_source_id` 這一欄 → 跳過歸檔，不報錯。

### 設計原則
- **聲量用級距**（🔥 爆量 / 高 / 中 / 低 / 無聲量），不用假數字 —— 延續 toolkit 的可驗證原則。
- **獨立於客戶** —— 有時只是想研究，不一定關聯客戶；保留連結彈性即可。

---

## 🧭 部件三：repo-install-eval skill

**位置**：`skills/repo-install-eval/`

要評估某個外部 repo / 工具能不能裝時，給連結 + 說「評估看看 / 能不能裝 / 安不安全」，
會自動跑固定流程：

1. **風險稽核**（閘門，唯讀）：資料外洩 / 遙測 / 隱藏付費 / 金鑰處理 / 安裝腳本 / 自動副作用 / 混淆 —— 七面向裁決表 + 證據。
2. **架構建議**：模組分開、觸發分三層。
3. **資源評估**：token、記憶體、維護腐化、scope 污染等坑。
4. **建議 + 最小安全原型**：過關才動手，先做最小、最安全的一塊驗證。

---

## 安全備忘

- 金鑰只存在本機 `.env` / `~/.config/`，皆不入版控（`.env` 已 gitignore）。
- 自動觸發只接「通知 / 歸檔」這類可逆動作；發信、寫 CRM 等永遠走手動 + 二次確認。
- 要新增整合時，先用 `repo-install-eval` 跑一輪，別直接照抄第三方的危險預設。
