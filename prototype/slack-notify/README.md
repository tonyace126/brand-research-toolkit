# slack-notify（原型，尚未 commit）

最小、安全的「研究完成 → 發 Slack 通知」hook。借了 go-to-market-orchestrator 的概念，但**只取最安全的一塊**，並把它的危險預設改掉。

## 跟 orchestrator 的差別（為什麼這版更安全）

| | go-to-market-orchestrator | 這個原型 |
|---|---|---|
| 預設行為 | 真發（DRY_RUN 非預設） | **dry-run（要 SLACK_LIVE=1 才真發）** |
| 整合數量 | 17 個 | **1 個（只有 Slack 通知）** |
| 安裝範圍 | user 層 `~/.claude/`（全域） | **專案層 `.claude/`（只影響本 repo）** |
| 觸發事件 | 含 `Stop` + `PostToolUse *`（高頻） | **只綁 `Stop`（低頻）** |
| 副作用 | 可能自動發開發信 / 寫 CRM | **只發通知，零外發、零花費** |

## 三步上線

1. **建 webhook**：Slack → Incoming Webhooks → 選 `東尼大木羅德島` → 複製 URL。
2. **填設定**：`cp .env.example .env`，貼上 `SLACK_WEBHOOK_URL`。先別開 `SLACK_LIVE`。
3. **接 hook**：把 `hook.example.json` 的內容合併進專案的 `.claude/settings.json`。

## 測試

```bash
# dry-run：只印不發
echo '{"summary":"研究完成","url":"https://..."}' | python3 notify.py

# 確認 OK 後才真發
SLACK_LIVE=1 SLACK_WEBHOOK_URL='https://hooks.slack.com/...' \
  bash -c 'echo "{\"summary\":\"研究完成\"}" | python3 notify.py'
```

## 注意
- `.env` 要加進 `.gitignore`，**絕不 commit**。
- 通知失敗（exit 1）不應炸掉主流程；handler 已做防護。
