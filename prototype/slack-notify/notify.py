#!/usr/bin/env python3
"""
slack-notify — 最小、安全的 Slack 通知 handler（原型）

設計原則（對應稽核紅旗）：
- 安全預設：預設就是 DRY_RUN，只印不發。要真發必須明確 export SLACK_LIVE=1。
- 零依賴：只用 Python 標準庫（urllib），不需 pip install。
- 只做一件事：把一則摘要送到你自己的 Slack Incoming Webhook，不碰任何外發/CRM/花錢的東西。

用法：
  # 手動測試（dry-run，只印 payload）
  echo '{"summary":"研究完成","url":"https://..."}' | python3 notify.py

  # 真發（需先在 Slack 建 Incoming Webhook 並填 .env）
  SLACK_LIVE=1 SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...' \
    echo '{"summary":"研究完成"}' | python3 notify.py

被 hook 觸發時，Claude Code 會把事件 JSON 從 stdin 餵進來。
"""

import json
import os
import sys
import urllib.request


def build_message(event: dict) -> str:
    """把事件資料組成一則 Slack 訊息。欄位都是可選的，缺了就略過。"""
    summary = event.get("summary") or "品牌研究完成"
    lines = [f":white_check_mark: *{summary}*（自動觸發）"]
    if event.get("topic"):
        lines.append(f"> :mag: *主題*：{event['topic']}")
    if event.get("platforms"):
        lines.append(f"> :bar_chart: *平台*：{event['platforms']}")
    if event.get("url"):
        lines.append(f"> :link: *發布網址*：{event['url']}")
    return "\n".join(lines)


def main() -> int:
    # 1. 從 stdin 讀事件（hook 會餵 JSON；手動測試也可）
    raw = sys.stdin.read().strip() if not sys.stdin.isatty() else ""
    try:
        event = json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        event = {"summary": raw}  # 不是 JSON 就當純文字摘要

    text = build_message(event)
    payload = {"text": text}

    # 2. 安全預設：除非明確 SLACK_LIVE=1，否則只印不發
    live = os.environ.get("SLACK_LIVE") == "1"
    webhook = os.environ.get("SLACK_WEBHOOK_URL", "")

    if not live:
        print("[DRY-RUN] 未送出。以下是會送到 Slack 的內容：", file=sys.stderr)
        print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
        print("[DRY-RUN] 要真發請：export SLACK_LIVE=1 並設定 SLACK_WEBHOOK_URL", file=sys.stderr)
        return 0

    if not webhook:
        print("[ERROR] SLACK_LIVE=1 但沒有 SLACK_WEBHOOK_URL，拒絕送出。", file=sys.stderr)
        return 1

    # 3. 真發（只打你自己的 webhook，別無他處）
    req = urllib.request.Request(
        webhook,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"[LIVE] 已送出，HTTP {resp.status}", file=sys.stderr)
        return 0
    except Exception as e:  # noqa: BLE001 — 通知失敗不該炸掉主流程
        print(f"[ERROR] 送出失敗：{e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
