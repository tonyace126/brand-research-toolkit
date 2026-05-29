#!/usr/bin/env python3
"""
把目前的對外網址發布到一個固定的 GitHub Gist，供手機 App「自動網址登錄」讀取。

環境變數：
  GIST_TOKEN   GitHub Personal Access Token（classic，勾 gist 權限即可）

用法： python3 publish-url.py https://xxxx.trycloudflare.com
- 第一次會建立一個 secret gist，把 gist id 存到 ~/.xiaomifeng-gist-id、
  把可讀的 raw 網址存到 ~/.xiaomifeng-registry-url（拿這個填進 App）。
- 之後每次更新同一個 gist（網址固定不變）。
"""
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

TOKEN = os.environ.get("GIST_TOKEN", "")
ID_FILE = os.path.expanduser("~/.xiaomifeng-gist-id")
URL_FILE = os.path.expanduser("~/.xiaomifeng-registry-url")
API = "https://api.github.com"
FILENAME = "xiaomifeng-backend.json"


def gh(method, path, body):
    data = json.dumps(body).encode()
    r = urllib.request.Request(API + path, data=data, method=method)
    r.add_header("Authorization", "Bearer " + TOKEN)
    r.add_header("Accept", "application/vnd.github+json")
    r.add_header("User-Agent", "xiaomifeng")
    with urllib.request.urlopen(r, timeout=20) as resp:
        return json.loads(resp.read())


def main():
    if not TOKEN:
        print("沒有 GIST_TOKEN，略過發布。")
        return
    url = sys.argv[1] if len(sys.argv) > 1 else ""
    content = json.dumps({"url": url, "ts": datetime.now(timezone.utc).isoformat()})
    files = {FILENAME: {"content": content}}
    gid = ""
    if os.path.exists(ID_FILE):
        gid = open(ID_FILE).read().strip()
    try:
        if gid:
            res = gh("PATCH", f"/gists/{gid}", {"files": files})
        else:
            res = gh("POST", "/gists", {
                "description": "xiaomifeng backend url registry",
                "public": False, "files": files,
            })
            open(ID_FILE, "w").write(res["id"])
        login = res["owner"]["login"]
        gid = res["id"]
        raw = f"https://gist.githubusercontent.com/{login}/{gid}/raw/{FILENAME}"
        open(URL_FILE, "w").write(raw)
        print(raw)
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"gist API {e.code}: {e.read().decode()[:200]}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
