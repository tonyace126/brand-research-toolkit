#!/bin/bash
# 由 launchd 啟動：跑 cloudflared 隧道，並在拿到網址後自動發布到 Gist（若有設 GIST_TOKEN）。
source "$HOME/.xiaomifeng.env" 2>/dev/null
HERE="$(cd "$(dirname "$0")" && pwd)"
LOG="$HOME/Library/Logs/xiaomifeng-tunnel.log"
PUBLOG="$HOME/Library/Logs/xiaomifeng-publish.log"
CF="$(command -v cloudflared)"
PY="$(command -v python3)"
: > "$LOG"

"$CF" tunnel --url http://localhost:8787 >>"$LOG" 2>&1 &
CFPID=$!

# 背景：偵測網址變化就發布
(
  last=""
  while kill -0 "$CFPID" 2>/dev/null; do
    url=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG" | tail -1)
    if [ -n "$url" ] && [ "$url" != "$last" ] && [ -n "$GIST_TOKEN" ]; then
      "$PY" "$HERE/publish-url.py" "$url" >>"$PUBLOG" 2>&1 && last="$url"
    fi
    sleep 15
  done
) &

wait "$CFPID"
