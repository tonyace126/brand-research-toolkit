#!/usr/bin/env python3
"""
sync_notion.py — 從 Notion 重新拉取，覆寫 agent-team/data/portfolio.json

純 Python 標準庫（urllib），無需 pip install。serve.py 的 /api/sync 會自動先跑這支。

需要的環境變數：
  NOTION_TOKEN          你的 Notion integration token（必填）
  NOTION_PROJECTS_DB    （選填）專案總表 database id；不填則用名稱自動搜尋
  NOTION_TASKS_DB       （選填）追蹤事項庫 database id；不填則用名稱自動搜尋

一次性設定：
  1. Notion → Settings → Connections → 開一個 internal integration，複製 token。
  2. 把「全客戶專案總表」與「追蹤事項庫」兩個資料庫分享給該 integration
     （資料庫右上 … → Connections → 加入你的 integration）。
  3. export NOTION_TOKEN=ntn_xxx  然後跑 serve.py，或直接 `python3 sync_notion.py`。

完成度（completion）Notion 未存，會保留 portfolio.json 既有的手動估計值。
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import date
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
OUT = DATA / "portfolio.json"
API = "https://api.notion.com/v1"
TOKEN = os.environ.get("NOTION_TOKEN", "")
PROJECTS_NAME = "全客戶專案總表"
TASKS_NAME = "追蹤事項庫"

OPEN_STATES = ("待執行", "進行中")


def _req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Notion-Version", "2022-06-28")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"❌ Notion API {e.code}: {e.read().decode()[:300]}")


def find_db(name_substr, override_env):
    if os.environ.get(override_env):
        return os.environ[override_env]
    res = _req("POST", "/search", {"query": name_substr,
                                   "filter": {"value": "database", "property": "object"}})
    for r in res.get("results", []):
        title = "".join(t.get("plain_text", "") for t in r.get("title", []))
        if name_substr in title:
            return r["id"]
    raise SystemExit(f"❌ 找不到名稱含「{name_substr}」的資料庫，且分享給 integration 了嗎？")


def query_all(db_id):
    rows, cursor = [], None
    while True:
        body = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        res = _req("POST", f"/databases/{db_id}/query", body)
        rows.extend(res.get("results", []))
        if not res.get("has_more"):
            return rows
        cursor = res["next_cursor"]


# --- property getters ---
def p_title(props, key):
    return "".join(t.get("plain_text", "") for t in props.get(key, {}).get("title", [])) or ""


def p_text(props, key):
    return "".join(t.get("plain_text", "") for t in props.get(key, {}).get("rich_text", [])) or ""


def p_choice(props, key):
    pr = props.get(key, {})
    v = pr.get("select") or pr.get("status")
    return v.get("name") if v else None


def p_date(props, key):
    dt = props.get(key, {}).get("date")
    return dt.get("start") if dt else None


def p_url(props, key):
    return props.get(key, {}).get("url") or None


def p_relation(props, key):
    return [r["id"] for r in props.get(key, {}).get("relation", [])]


def p_icon(page):
    ic = page.get("icon") or {}
    return ic.get("emoji", "") if ic.get("type") == "emoji" else ""


def prio(name):
    if not name:
        return "中"
    if "🔴" in name:
        return "高"
    if "🟢" in name:
        return "低"
    return "中"


def main():
    if not TOKEN:
        raise SystemExit("❌ 未設定 NOTION_TOKEN，請 export NOTION_TOKEN=... 後再跑。")

    proj_db = find_db(PROJECTS_NAME, "NOTION_PROJECTS_DB")
    task_db = find_db(TASKS_NAME, "NOTION_TASKS_DB")

    proj_rows = query_all(proj_db)
    task_rows = query_all(task_db)

    # 保留既有手動完成度估計
    prev = {}
    if OUT.exists():
        try:
            for p in json.loads(OUT.read_text(encoding="utf-8")).get("projects", []):
                prev[p["code"]] = p.get("completion")
        except Exception:
            pass

    # 專案 page id -> code（給提醒對應）
    id2code, projects = {}, []
    for pg in proj_rows:
        pr = pg["properties"]
        stage = p_choice(pr, "階段") or "進行中"
        if stage == "完成":
            continue  # 已完成專案不列入總覽
        code = p_title(pr, "專案代碼") or pg["id"][:8]
        id2code[pg["id"]] = code
        comp = prev.get(code)
        if comp is None:
            comp = {"完成": 100, "未開始": 0}.get(stage, 40)
        projects.append({
            "code": code, "icon": p_icon(pg), "client": p_choice(pr, "客戶") or "",
            "name": p_text(pr, "專案名稱") or code, "stage": stage, "priority": prio(p_choice(pr, "優先級")),
            "completion": comp, "open_items": 0,
            "brief": p_date(pr, "Brief 收件日"), "next_due": p_date(pr, "下個關鍵期限"),
            "launch": p_date(pr, "預計上線"),
            "this_week": p_text(pr, "本週要做") or "—", "risk": p_text(pr, "風險警示") or "—",
            "contact": p_text(pr, "客戶聯絡人") or "—",
            "url": p_url(pr, "專案頁面") or f"https://www.notion.so/{pg['id'].replace('-', '')}",
        })

    by_code = {p["code"]: p for p in projects}

    # 開放事項 -> reminders；同時累加 open_items
    reminders = []
    for tk in task_rows:
        pr = tk["properties"]
        if p_choice(pr, "狀態") not in OPEN_STATES:
            continue
        rel = p_relation(pr, "關聯專案")
        codes = [id2code.get(rid) for rid in rel if id2code.get(rid)]
        for code in codes:
            by_code[code]["open_items"] += 1
        due = p_date(pr, "截止日")
        if not due:
            continue  # 沒截止日的不放進提醒列
        reminders.append({
            "text": p_title(pr, "事項名稱") or "(未命名)", "due": due,
            "project": codes[0] if codes else "", "client": p_choice(pr, "客戶") or "",
            "priority": prio(p_choice(pr, "優先級")), "type": p_choice(pr, "類型") or "",
        })

    reminders.sort(key=lambda r: r["due"])
    today = date.today().isoformat()
    out = {
        "title": "我的工作進度與規劃",
        "source": "Notion · 全客戶專案總表 + 追蹤事項庫",
        "synced_at": today, "today": today,
        "_note": "由 sync_notion.py 從 Notion 即時拉取產生；completion 為保留的手動估計值。",
        "projects": projects, "reminders": reminders,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✅ portfolio.json 已更新：{len(projects)} 專案、{len(reminders)} 筆開放提醒（基準日 {today}）")


if __name__ == "__main__":
    main()
