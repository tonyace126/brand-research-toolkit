#!/bin/bash
# 由 launchd 啟動：跑 cloudflared 隧道，並在拿到網址後自動發布到 Gist（若有設 GIST_TOKEN）。

# launchd 的 PATH 很精簡，這裡補上 Homebrew / python 常見位置，確保找得到 cloudflared、python3
for p in /opt/homebrew/bin /opt/homebrew/sbin /usr/local/bin /Library/Frameworks/Python.framework/Versions/*/bin; do
  [ -d "$p" ] && PATH="$p:$PATH"
done
export PATH

source "$HOME/.xiaomifeng.env" 2>/dev/null
HERE="$(cd "$(dirname "$0")" && pwd)"
LOG="$HOME/Library/Logs/xiaomifeng-tunnel.log"
PUBLOG="$HOME/Library/Logs/xiaomifeng-publish.log"
CF="$(command -v cloudflared)"
PY="$(command -v python3)"
: > "$LOG"

if [ -z "$CF" ]; then echo "找不到 cloudflared（PATH=$PATH）" >>"$LOG"; exit 127; fi

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
