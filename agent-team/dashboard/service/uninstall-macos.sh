#!/bin/bash
# 停用並移除小蜜蜂背景服務
LA="$HOME/Library/LaunchAgents"
UID_NUM="$(id -u)"
for label in com.xiaomifeng.backend com.xiaomifeng.tunnel; do
  launchctl bootout "gui/$UID_NUM/$label" 2>/dev/null || launchctl unload "$LA/$label.plist" 2>/dev/null || true
  rm -f "$LA/$label.plist"
done
echo "✅ 背景服務已停用並移除。（~/.xiaomifeng.env 保留，要刪自行 rm）"
