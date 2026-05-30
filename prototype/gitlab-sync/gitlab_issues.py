#!/usr/bin/env python3
"""
gitlab-sync — 唯讀抓取 GitLab issue（原型，Phase 2）

只讀不寫。從 .env 讀 GITLAB_BASE_URL + GITLAB_TOKEN，抓指定專案的 issue，
輸出乾淨 JSON 給 skill 做分類 / 比對 Notion。

用法:
  python3 gitlab_issues.py --project "Group/your-project"
  python3 gitlab_issues.py --project "Group/your-project" --state opened
  python3 gitlab_issues.py --project "Group/your-project" --milestone "MTLR052"

需要 .env（同目錄，已 gitignore）:
  GITLAB_BASE_URL=https://gitlab.example.com
  GITLAB_TOKEN=<read_api 唯讀 token>

備註:因雲端 session 有網路 allowlist，這支通常要在你本機跑。
"""

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request


def load_env() -> None:
    """自動載入同目錄 .env（若存在）。已存在的環境變數優先。"""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key, val = key.strip(), val.strip().strip("'\"")
            if key and key not in os.environ:
                os.environ[key] = val


def fetch_issues(base: str, token: str, project: str, state: str, milestone: str | None) -> list:
    """分頁抓完所有 issue（唯讀）。"""
    proj = urllib.parse.quote(project, safe="")
    out, page = [], 1
    while True:
        q = {"state": state, "per_page": "100", "page": str(page)}
        if milestone:
            q["milestone"] = milestone
        url = f"{base}/api/v4/projects/{proj}/issues?" + urllib.parse.urlencode(q)
        req = urllib.request.Request(url, headers={"PRIVATE-TOKEN": token})
        with urllib.request.urlopen(req, timeout=20) as resp:
            batch = json.load(resp)
        if not batch:
            break
        out.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return out


def simplify(issue: dict) -> dict:
    """只留分類 / 比對需要的欄位。"""
    return {
        "iid": issue.get("iid"),
        "title": issue.get("title"),
        "state": issue.get("state"),  # opened / closed
        "labels": issue.get("labels", []),  # 團隊若用 label 標進度，可據此分「進行中」
        "assignee": (issue.get("assignee") or {}).get("name"),
        "milestone": (issue.get("milestone") or {}).get("title"),
        "due_date": issue.get("due_date"),
        "web_url": issue.get("web_url"),
        "updated_at": issue.get("updated_at"),
        "closed_at": issue.get("closed_at"),
    }


def main() -> int:
    load_env()
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True, help="GitLab 專案路徑，如 Group/your-project")
    ap.add_argument("--state", default="all", choices=["all", "opened", "closed"])
    ap.add_argument("--milestone", default=None)
    args = ap.parse_args()

    base = os.environ.get("GITLAB_BASE_URL", "").rstrip("/")
    token = os.environ.get("GITLAB_TOKEN", "")
    if not base or not token:
        print("[ERROR] 需要 GITLAB_BASE_URL 與 GITLAB_TOKEN（放同目錄 .env）", file=sys.stderr)
        return 1

    try:
        issues = [simplify(i) for i in fetch_issues(base, token, args.project, args.state, args.milestone)]
    except Exception as e:  # noqa: BLE001
        print(f"[ERROR] 抓取失敗：{e}", file=sys.stderr)
        return 1

    print(json.dumps(issues, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
