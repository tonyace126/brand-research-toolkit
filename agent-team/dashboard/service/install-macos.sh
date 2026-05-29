#!/bin/bash
# 小蜜蜂 — macOS 背景服務安裝（launchd）
# 用法： bash agent-team/dashboard/service/install-macos.sh
# 作用：把 serve.py 與 cloudflared 設成登入時自動啟動、掛掉自動重啟的背景服務。
set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
DASH="$(cd "$HERE/.." && pwd)"                 # agent-team/dashboard
PY="$(command -v python3 || true)"
CF="$(command -v cloudflared || true)"
ENVFILE="$HOME/.xiaomifeng.env"
LA="$HOME/Library/LaunchAgents"
LOG="$HOME/Library/Logs"
UID_NUM="$(id -u)"
mkdir -p "$LA" "$LOG"

[ -z "$PY" ] && { echo "❌ 找不到 python3"; exit 1; }
[ -z "$CF" ] && { echo "❌ 找不到 cloudflared，請先 brew install cloudflared"; exit 1; }

# 1) 祕密設定檔（只在本機、不進 repo）
if [ ! -f "$ENVFILE" ]; then
  cat > "$ENVFILE" <<EOF
# 小蜜蜂後端設定（本機私有，請填好 NOTION_TOKEN）
export AGENT_TEAM_TOKEN="1206"
export NOTION_TOKEN=""
export NOTION_PROJECTS_DB="2fbd052d1cca46399314bb68e947c3c6"
export NOTION_TASKS_DB="bb4adbb2ff95426494a6d709eaed3270"
EOF
  chmod 600 "$ENVFILE"
  echo "📝 已建立 $ENVFILE"
  echo "   請先用編輯器填入 NOTION_TOKEN，再重跑一次本腳本。"
  echo "   開啟指令：  open -e $ENVFILE"
  exit 0
fi

# 2) 後端服務 plist
cat > "$LA/com.xiaomifeng.backend.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.xiaomifeng.backend</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-lc</string>
    <string>source "$ENVFILE"; exec "$PY" "$DASH/serve.py"</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LOG/xiaomifeng-backend.log</string>
  <key>StandardErrorPath</key><string>$LOG/xiaomifeng-backend.log</string>
</dict></plist>
EOF

# 3) 隧道服務 plist
cat > "$LA/com.xiaomifeng.tunnel.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.xiaomifeng.tunnel</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-lc</string>
    <string>exec "$CF" tunnel --url http://localhost:8787</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LOG/xiaomifeng-tunnel.log</string>
  <key>StandardErrorPath</key><string>$LOG/xiaomifeng-tunnel.log</string>
</dict></plist>
EOF

# 4) 載入（新版用 bootstrap，失敗則退回 load）
load_one() {
  local label="$1" plist="$2"
  launchctl bootout "gui/$UID_NUM/$label" 2>/dev/null || true
  launchctl bootstrap "gui/$UID_NUM" "$plist" 2>/dev/null || {
    launchctl unload "$plist" 2>/dev/null || true
    launchctl load -w "$plist"
  }
}
: > "$LOG/xiaomifeng-tunnel.log"
load_one com.xiaomifeng.backend "$LA/com.xiaomifeng.backend.plist"
load_one com.xiaomifeng.tunnel  "$LA/com.xiaomifeng.tunnel.plist"

echo "✅ 背景服務已安裝並啟動（登入時自動跑、掛掉自動重啟）。"
echo ""
echo "等 5–10 秒後，查目前對外網址："
echo "  bash $HERE/url-macos.sh"
echo ""
echo "停用／移除： bash $HERE/uninstall-macos.sh"
