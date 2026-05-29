#!/usr/bin/env python3
"""
agent-team dashboard 本機服務

搭配 dashboard 的「⟳ 立即更新」按鈕使用：
- 提供 dashboard 靜態頁面（http://<本機IP>:8787）
- POST /api/sync → 重新產生 dashboard，回傳 JSON

用法：
    python3 agent-team/dashboard/serve.py            # 預設 0.0.0.0:8787
    python3 agent-team/dashboard/serve.py 9000        # 指定埠號

手機釘選：手機與電腦同網路 → Safari/Chrome 開 http://<電腦IP>:8787
→ 「加入主畫面」釘成 App。按「⟳ 立即更新」即重產；電腦關機/未啟動服務時，
按鈕會跳「終端機未連線！」。

注意：/api/sync 目前會重跑 generate.py（從現有 data/ 與 portfolio.json 重產）。
若要按一下就「即時從 Notion 重拉」，需另寫 sync_notion.py（用 Notion integration
token 呼叫 Notion API 覆寫 portfolio.json）；本服務偵測到同目錄有 sync_notion.py
時會先執行它再產生。
"""

import json
import subprocess
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

HERE = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(HERE), **k)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path.rstrip("/") != "/api/sync":
            self.send_error(404)
            return
        steps, ok = [], True
        # 若有 Notion 同步腳本，先跑它（可選，需自備 token）
        notion = HERE / "sync_notion.py"
        if notion.exists():
            r = subprocess.run([sys.executable, str(notion)], capture_output=True, text=True)
            steps.append({"step": "sync_notion", "code": r.returncode, "out": (r.stdout or r.stderr)[-500:]})
            ok = ok and r.returncode == 0
        # 重產 dashboard
        r = subprocess.run([sys.executable, str(HERE / "generate.py")], capture_output=True, text=True)
        steps.append({"step": "generate", "code": r.returncode, "out": (r.stdout or r.stderr)[-500:]})
        ok = ok and r.returncode == 0

        body = json.dumps({"ok": ok, "steps": steps}, ensure_ascii=False).encode("utf-8")
        self.send_response(200 if ok else 500)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass  # 安靜模式


def main():
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"🐝 dashboard 服務啟動：http://0.0.0.0:{PORT}")
    print(f"   本機開：http://localhost:{PORT}")
    print(f"   手機開（同網路）：http://<你的電腦IP>:{PORT}")
    print("   Ctrl+C 結束。")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")


if __name__ == "__main__":
    main()
