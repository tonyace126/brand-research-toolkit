#!/usr/bin/env python3
"""
agent-team dashboard 本機後端服務（上鎖版）

搭配 shell.html（永遠在線的空殼）使用，組成「電腦關機也會跳『終端機未連線！』」的架構。

提供：
- GET  /api/health      連線檢查（給空殼跨網域敲；用 ?token= 驗證）
- GET  /  /index.html   真 dashboard（用 ?token= 驗證並寫入 cookie）
- POST /api/sync        重新同步：有 sync_notion.py 先跑它，再跑 generate.py
- 其餘靜態檔             需通過 token

驗證：環境變數 AGENT_TEAM_TOKEN（建議設定；未設＝不驗證，僅限本機測試）。
  token 可用 ?token=... 或 cookie `tk`（dashboard 內的「立即更新」走同源 cookie）。

用法：
    AGENT_TEAM_TOKEN=你的密碼 python3 agent-team/dashboard/serve.py        # 0.0.0.0:8787
    AGENT_TEAM_TOKEN=你的密碼 python3 agent-team/dashboard/serve.py 9000

對外（讓手機在外網也連得到）：另開一條通道，例如
    cloudflared tunnel --url http://localhost:8787
把得到的網址＋token 填進空殼（shell.html）的設定即可。
"""

import os
import json
import subprocess
import sys
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from http.cookies import SimpleCookie
from pathlib import Path

HERE = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
TOKEN = os.environ.get("AGENT_TEAM_TOKEN", "")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(HERE), **k)

    # --- helpers ---
    def _query_token(self):
        q = urllib.parse.urlparse(self.path).query
        return urllib.parse.parse_qs(q).get("token", [""])[0]

    def _cookie_token(self):
        raw = self.headers.get("Cookie")
        if not raw:
            return ""
        try:
            ck = SimpleCookie(raw)
            return ck["tk"].value if "tk" in ck else ""
        except Exception:
            return ""

    def _authed(self):
        if not TOKEN:
            return True
        return self._query_token() == TOKEN or self._cookie_token() == TOKEN

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, obj, code=200, extra=None):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self._cors()
        if extra:
            for k, v in extra:
                self.send_header(k, v)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # --- methods ---
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/health":
            self._json({"ok": self._authed()}, 200 if self._authed() else 401)
            return
        if not self._authed():
            self._json({"ok": False, "error": "unauthorized"}, 401)
            return
        if path in ("/", "/index.html"):
            self._serve_index()
            return
        super().do_GET()

    def _serve_index(self):
        f = HERE / "index.html"
        if not f.exists():
            self._json({"ok": False, "error": "尚未產生 dashboard，請先跑 generate.py"}, 404)
            return
        body = f.read_bytes()
        self.send_response(200)
        # 把 token 寫進 cookie，之後同源的 /api/sync 就帶得上
        if TOKEN and self._query_token() == TOKEN:
            self.send_header("Set-Cookie", f"tk={TOKEN}; Path=/; SameSite=Lax; Max-Age=2592000")
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if urllib.parse.urlparse(self.path).path.rstrip("/") != "/api/sync":
            self.send_error(404)
            return
        if not self._authed():
            self._json({"ok": False, "error": "unauthorized"}, 401)
            return
        steps, ok = [], True
        notion = HERE / "sync_notion.py"
        if notion.exists():
            r = subprocess.run([sys.executable, str(notion)], capture_output=True, text=True)
            steps.append({"step": "sync_notion", "code": r.returncode, "out": (r.stdout or r.stderr)[-400:]})
            ok = ok and r.returncode == 0
        r = subprocess.run([sys.executable, str(HERE / "generate.py")], capture_output=True, text=True)
        steps.append({"step": "generate", "code": r.returncode, "out": (r.stdout or r.stderr)[-400:]})
        ok = ok and r.returncode == 0
        self._json({"ok": ok, "steps": steps}, 200 if ok else 500)

    def log_message(self, fmt, *args):
        pass


def main():
    if not TOKEN:
        print("⚠️  未設定 AGENT_TEAM_TOKEN — 目前無驗證，僅限本機測試。對外請務必設 token。")
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"🐝 後端啟動：http://0.0.0.0:{PORT}　(token 驗證：{'開' if TOKEN else '關'})")
    print("   Ctrl+C 結束。")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")


if __name__ == "__main__":
    main()
