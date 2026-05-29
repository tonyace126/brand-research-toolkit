# 背景服務（macOS / launchd）

把 `serve.py` 與 `cloudflared` 設成**登入自動啟動、掛掉自動重啟**的背景服務，不用每次手動開視窗。

## 安裝

```bash
bash agent-team/dashboard/service/install-macos.sh
```

- 第一次會建立 `~/.xiaomifeng.env`（本機私有、不進 repo），請填入你的 `NOTION_TOKEN`：
  ```bash
  open -e ~/.xiaomifeng.env
  ```
  （`AGENT_TEAM_TOKEN` 與兩個資料庫 ID 已預填，可自行調整。）
- 填好後**再跑一次**安裝指令 → 服務就啟動了。

## 查目前對外網址（重開機後網址會變）

```bash
bash agent-team/dashboard/service/url-macos.sh
```
會印出（並複製到剪貼簿）目前的 `https://xxx.trycloudflare.com`，貼進手機 App 的「⚙︎ 設定終端網址」即可。

## 停用 / 移除

```bash
bash agent-team/dashboard/service/uninstall-macos.sh
```

## 注意

- 服務跑在**你的 Mac** 上：Mac 關機或睡著就會斷（手機顯示「終端機未連線」）。長掛建議插電；避免睡眠可用 `caffeinate -i`。
- 記憶體佔用很小（serve.py ~20–30MB、cloudflared ~30–50MB）。
- 想要「網址永遠不變」需自有網域的 cloudflared 具名隧道，或改用 Tailscale Funnel —— 屬進階，另議。
- 祕密只存 `~/.xiaomifeng.env`（權限 600），不會進 repo。
