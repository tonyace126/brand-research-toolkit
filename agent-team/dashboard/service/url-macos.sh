#!/bin/bash
# 印出目前的 cloudflared 對外網址（從背景服務的 log 撈）
LOG="$HOME/Library/Logs/xiaomifeng-tunnel.log"
URL="$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG" 2>/dev/null | tail -1)"
if [ -n "$URL" ]; then
  echo "目前對外網址："
  echo "  $URL"
  echo "（複製貼進手機 App 的「⚙︎ 設定終端網址」即可）"
  command -v pbcopy >/dev/null && printf "%s" "$URL" | pbcopy && echo "✅ 已複製到剪貼簿"
else
  echo "還沒抓到網址 — 服務可能剛啟動，等幾秒再跑一次；"
  echo "或檢查服務狀態： launchctl list | grep xiaomifeng"
fi
