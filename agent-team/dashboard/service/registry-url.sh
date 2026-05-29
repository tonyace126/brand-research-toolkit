#!/bin/bash
# 印出「自動網址登錄 URL」（填進手機 App 的那個固定網址）
F="$HOME/.xiaomifeng-registry-url"
if [ -s "$F" ]; then
  URL="$(cat "$F")"
  echo "自動網址登錄 URL（填進手機 App「自動網址登錄」欄位，只需填一次）："
  echo "  $URL"
  command -v pbcopy >/dev/null && printf "%s" "$URL" | pbcopy && echo "✅ 已複製到剪貼簿"
else
  echo "還沒產生 — 確認 ~/.xiaomifeng.env 已填 GIST_TOKEN，並重跑 install-macos.sh，等 20 秒後再試。"
  echo "（除錯看： cat ~/Library/Logs/xiaomifeng-publish.log）"
fi
