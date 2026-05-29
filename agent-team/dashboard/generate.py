#!/usr/bin/env python3
"""
agent-team dashboard 產生器

從 agent-team/data/ 的 JSON/JSONL 讀資料，產出一個自包式（inline CSS/SVG、
無外部依賴）的 HTML dashboard：代理流程看板、完成度、每日/每週數據、計畫時程
Gantt、活動軌跡。

用法：
    python3 agent-team/dashboard/generate.py            # 用最新活動日期當「今天」
    python3 agent-team/dashboard/generate.py 2026-05-29 # 指定基準日期
"""

import json
import sys
import html
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = Path(__file__).resolve().parent / "index.html"

STATUS_ORDER = ["backlog", "planned", "in_progress", "review", "done"]
STATUS_LABEL = {
    "backlog": "Backlog",
    "planned": "已規劃",
    "in_progress": "進行中",
    "review": "審查中",
    "done": "已完成",
    "blocked": "卡關",
}
STATUS_COLOR = {
    "backlog": "#6b7280",
    "planned": "#46a6c8",
    "in_progress": "#f5c451",
    "review": "#b18cf0",
    "done": "#5fd38a",
    "blocked": "#ff5638",
}
ACCENT = "#ff5638"


# ----------------------------------------------------------------------------
# 讀資料
# ----------------------------------------------------------------------------
def load_json(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def load_jsonl(name):
    rows = []
    for line in (DATA / name).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def d(s):
    return date.fromisoformat(s) if s else None


def esc(s):
    return html.escape(str(s)) if s is not None else ""


# ----------------------------------------------------------------------------
# 計算
# ----------------------------------------------------------------------------
def build():
    project = load_json("project.json")
    agents = load_json("agents.json")["agents"]
    tasks = load_json("tasks.json")["tasks"]
    activity = load_jsonl("activity.jsonl")

    pf_path = DATA / "portfolio.json"
    portfolio = json.loads(pf_path.read_text(encoding="utf-8")) if pf_path.exists() else None

    # 基準「今天」：argv 指定，否則取最新活動日期，否則專案起始日
    if len(sys.argv) > 1:
        today = d(sys.argv[1])
    else:
        ev_dates = [datetime.fromisoformat(e["ts"]).date() for e in activity]
        today = max(ev_dates) if ev_dates else d(project["start_date"])

    agent_by_id = {a["id"]: a for a in agents}
    ms_by_id = {m["id"]: m for m in project["milestones"]}

    # --- 整體指標 ---
    total = len(tasks)
    done = sum(1 for t in tasks if t["status"] == "done")
    in_prog = sum(1 for t in tasks if t["status"] in ("in_progress", "review"))
    est_total = sum(t.get("estimate_hours", 0) for t in tasks)
    spent_total = sum(t.get("spent_hours", 0) for t in tasks)
    # 加權完成度（依估時加權的 progress）
    if est_total > 0:
        overall = round(sum(t["progress"] * t.get("estimate_hours", 0) for t in tasks) / est_total)
    else:
        overall = round(sum(t["progress"] for t in tasks) / total) if total else 0
    done_rate = round(done / total * 100) if total else 0

    start = d(project["start_date"])
    target = d(project["target_date"])
    days_left = (target - today).days
    elapsed = (today - start).days
    span = (target - start).days or 1
    time_pct = max(0, min(100, round(elapsed / span * 100)))

    # --- 本週 / 上週彙總 ---
    def week_key(dt):
        iso = dt.isocalendar()
        return (iso[0], iso[1])

    this_week = week_key(today)
    created_by_week = Counter()
    completed_by_week = Counter()
    for t in tasks:
        if t.get("created"):
            created_by_week[week_key(d(t["created"]))] += 1
        if t.get("completed"):
            completed_by_week[week_key(d(t["completed"]))] += 1
    week_done = completed_by_week[this_week]

    # --- 每日活動（近 14 天）---
    days = [today - timedelta(days=i) for i in range(13, -1, -1)]
    ev_per_day = Counter(datetime.fromisoformat(e["ts"]).date() for e in activity)
    done_per_day = Counter(d(t["completed"]) for t in tasks if t.get("completed"))
    daily = [(dt, ev_per_day.get(dt, 0), done_per_day.get(dt, 0)) for dt in days]

    # --- 每週彙總（近 5 週）---
    weeks = []
    cur = today - timedelta(days=today.weekday())  # 本週一
    for i in range(4, -1, -1):
        wk_monday = cur - timedelta(weeks=i)
        wk = week_key(wk_monday)
        c = created_by_week.get(wk, 0)
        cm = completed_by_week.get(wk, 0)
        rate = round(cm / c * 100) if c else 0
        weeks.append((wk_monday, c, cm, rate))

    # --- 今日 / 任務數 by agent ---
    today_ev_by_agent = Counter(
        e["agent"] for e in activity if datetime.fromisoformat(e["ts"]).date() == today
    )
    tasks_by_agent = Counter(t["assignee"] for t in tasks if t.get("assignee"))

    # --- 里程碑完成度 ---
    ms_stats = []
    for m in project["milestones"]:
        mt = [t for t in tasks if t.get("milestone") == m["id"]]
        mdone = sum(1 for t in mt if t["status"] == "done")
        mpct = round(sum(t["progress"] for t in mt) / len(mt)) if mt else 0
        ms_stats.append((m, len(mt), mdone, mpct))

    # --- 看板 ---
    board = {s: [t for t in tasks if t["status"] == s] for s in STATUS_ORDER}
    blocked = [t for t in tasks if t["status"] == "blocked"]

    ctx = dict(
        project=project, agents=agents, tasks=tasks, activity=activity,
        agent_by_id=agent_by_id, ms_by_id=ms_by_id, today=today,
        total=total, done=done, in_prog=in_prog, overall=overall,
        done_rate=done_rate, est_total=est_total, spent_total=spent_total,
        days_left=days_left, time_pct=time_pct, week_done=week_done,
        daily=daily, weeks=weeks, today_ev_by_agent=today_ev_by_agent,
        tasks_by_agent=tasks_by_agent, ms_stats=ms_stats, board=board,
        blocked=blocked, start=start, target=target, span=span,
        portfolio=portfolio,
    )
    return ctx


# ----------------------------------------------------------------------------
# SVG 元件
# ----------------------------------------------------------------------------
def donut(pct, color=ACCENT, size=128, label=None):
    r = size / 2 - 10
    cx = cy = size / 2
    c = 2 * 3.14159265 * r
    dash = c * pct / 100
    label = label if label is not None else f"{pct}%"
    return f"""<svg viewBox="0 0 {size} {size}" width="{size}" height="{size}" class="donut">
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#262a33" stroke-width="10"/>
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="10"
    stroke-dasharray="{dash:.1f} {c:.1f}" stroke-linecap="butt"
    transform="rotate(-90 {cx} {cy})"/>
  <text x="{cx}" y="{cy}" text-anchor="middle" dominant-baseline="central"
    font-size="28" font-weight="600" fill="#e7e5e0">{label}</text>
</svg>"""


def daily_chart(daily):
    w, h = 720, 180
    pad_l, pad_b, pad_t = 30, 24, 10
    plot_w = w - pad_l - 10
    plot_h = h - pad_b - pad_t
    maxv = max([ev for _, ev, _ in daily] + [1])
    n = len(daily)
    gap = plot_w / n
    bw = gap * 0.55
    bars = []
    for i, (dt, ev, dn) in enumerate(daily):
        x = pad_l + i * gap + (gap - bw) / 2
        bh = (ev / maxv) * plot_h
        y = pad_t + plot_h - bh
        bars.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{bh:.1f}" '
            f'rx="2" fill="{ACCENT}"><title>{dt.isoformat()}：{ev} 事件，{dn} 完成</title></rect>'
        )
        if ev:
            bars.append(
                f'<text x="{x + bw/2:.1f}" y="{y - 3:.1f}" text-anchor="middle" '
                f'font-size="9" fill="#8b909b" font-family="Oswald,sans-serif">{ev}</text>'
            )
        # 完成標記
        if dn:
            bars.append(
                f'<circle cx="{x + bw/2:.1f}" cy="{pad_t + plot_h + 8:.1f}" r="4" '
                f'fill="{STATUS_COLOR["done"]}"><title>{dn} 個任務完成</title></circle>'
            )
        lbl = dt.strftime("%m/%d")
        bars.append(
            f'<text x="{x + bw/2:.1f}" y="{h - 6:.1f}" text-anchor="middle" '
            f'font-size="8.5" fill="#5b606b" font-family="Oswald,sans-serif">{lbl}</text>'
        )
    base = pad_t + plot_h
    return (
        f'<svg viewBox="0 0 {w} {h}" class="chart" preserveAspectRatio="xMidYMid meet">'
        f'<line x1="{pad_l}" y1="{base}" x2="{w-10}" y2="{base}" stroke="#2a2e37"/>'
        + "".join(bars)
        + "</svg>"
    )


def gantt(ctx):
    tasks = sorted(ctx["tasks"], key=lambda t: (t.get("started") or t.get("created") or "9999"))
    start, target, span = ctx["start"], ctx["target"], ctx["span"]
    today = ctx["today"]
    left = 250
    row_h = 26
    w = 960
    plot_w = w - left - 20
    top = 40
    h = top + len(tasks) * row_h + 20

    def x_of(dt):
        return left + max(0, min(1, (dt - start).days / span)) * plot_w

    parts = [f'<svg viewBox="0 0 {w} {h}" class="gantt" preserveAspectRatio="xMidYMin meet">']

    # 月份格線
    cur = date(start.year, start.month, 1)
    while cur <= target:
        x = x_of(cur)
        parts.append(f'<line x1="{x:.1f}" y1="{top-8}" x2="{x:.1f}" y2="{h-10}" stroke="#1f232b"/>')
        parts.append(f'<text x="{x+3:.1f}" y="{top-12}" font-size="10" fill="#5b606b" font-family="Oswald,sans-serif">{cur.strftime("%Y/%m")}</text>')
        cur = date(cur.year + (cur.month // 12), (cur.month % 12) + 1, 1)

    # 今日線
    tx = x_of(today)
    parts.append(f'<line x1="{tx:.1f}" y1="{top-8}" x2="{tx:.1f}" y2="{h-10}" stroke="{ACCENT}" stroke-dasharray="3 3"/>')
    parts.append(f'<text x="{tx+3:.1f}" y="{h-12}" font-size="10" fill="{ACCENT}">今日</text>')

    # 里程碑菱形
    for m in ctx["project"]["milestones"]:
        mx = x_of(d(m["due"]))
        parts.append(
            f'<path d="M {mx:.1f} {top-6} l 5 5 l -5 5 l -5 -5 z" fill="{ACCENT}">'
            f'<title>里程碑：{esc(m["name"])}（{m["due"]}）</title></path>'
        )

    for i, t in enumerate(tasks):
        y = top + i * row_h
        s = d(t.get("started") or t.get("created"))
        e = d(t.get("completed") or t.get("due")) or today
        if e < s:
            e = s
        x1, x2 = x_of(s), x_of(e)
        bw = max(4, x2 - x1)
        col = STATUS_COLOR.get(t["status"], "#999")
        # 標籤
        label = f'{t["id"]} {t["title"]}'
        if len(label) > 30:
            label = label[:29] + "…"
        parts.append(f'<text x="8" y="{y+row_h/2+4:.1f}" font-size="11" fill="#c2c5cd">{esc(label)}</text>')
        # 底條 + 進度填充
        parts.append(f'<rect x="{x1:.1f}" y="{y+5:.1f}" width="{bw:.1f}" height="14" rx="4" fill="{col}" opacity="0.28"/>')
        fillw = bw * t["progress"] / 100
        parts.append(
            f'<rect x="{x1:.1f}" y="{y+5:.1f}" width="{fillw:.1f}" height="14" rx="4" fill="{col}">'
            f'<title>{esc(t["title"])}｜{STATUS_LABEL.get(t["status"])}｜{t["progress"]}%｜{s}→{e}</title></rect>'
        )
    parts.append("</svg>")
    return "".join(parts)


# ----------------------------------------------------------------------------
# HTML 區塊
# ----------------------------------------------------------------------------
def kpi_card(value, label, sub=""):
    sub = f'<div class="kpi-sub">{sub}</div>' if sub else ""
    return f'<div class="kpi"><div class="kpi-val">{value}</div><div class="kpi-lbl">{label}</div>{sub}</div>'


def agent_cards(ctx):
    out = []
    for a in ctx["agents"]:
        ct = a.get("current_task")
        ct_title = ""
        if ct:
            tk = next((t for t in ctx["tasks"] if t["id"] == ct), None)
            ct_title = f'{ct} {tk["title"]}' if tk else ct
        sb = {"active": ("●", "#5fd38a", "工作中"), "idle": ("○", "#8b909b", "待命"),
              "blocked": ("▲", "#ff5638", "卡關")}.get(a["status"], ("○", "#8b909b", a["status"]))
        out.append(f"""<div class="agent" style="border-top:3px solid {a.get('color', ACCENT)}">
  <div class="agent-top"><span class="agent-emoji">{a.get('emoji','🤖')}</span>
    <div><div class="agent-name">{esc(a['name'])}</div>
    <div class="agent-role">{esc(a['role'])}</div></div></div>
  <div class="agent-status" style="color:{sb[1]}">{sb[0]} {sb[2]}</div>
  <div class="agent-cur">{esc(ct_title) if ct_title else '—'}</div>
  <div class="agent-meta"><span>今日 {ctx['today_ev_by_agent'].get(a['id'],0)} 事件</span>
    <span>負責 {ctx['tasks_by_agent'].get(a['id'],0)} 任務</span></div>
</div>""")
    return "".join(out)


def board_html(ctx):
    cols = []
    for s in STATUS_ORDER:
        items = ctx["board"][s]
        cards = []
        for t in items:
            a = ctx["agent_by_id"].get(t.get("assignee"))
            emoji = a["emoji"] if a else "·"
            bar = f'<div class="pbar"><span style="width:{t["progress"]}%;background:{STATUS_COLOR[s]}"></span></div>' if s not in ("backlog", "done") else ""
            due = f'<span class="due">⏳{t["due"]}</span>' if t.get("due") and s not in ("done",) else ""
            cards.append(f"""<div class="card" style="border-left:3px solid {STATUS_COLOR[s]}">
  <div class="card-id">{t['id']} <span class="tag tag-{t['type']}">{t['type']}</span></div>
  <div class="card-title">{esc(t['title'])}</div>
  {bar}
  <div class="card-foot"><span>{emoji} {esc(a['name']) if a else '未指派'}</span>{due}</div>
</div>""")
        cols.append(f"""<div class="col">
  <div class="col-head" style="color:{STATUS_COLOR[s]}">{STATUS_LABEL[s]} <span>{len(items)}</span></div>
  {''.join(cards) if cards else '<div class="empty">—</div>'}
</div>""")
    return "".join(cols)


def milestone_html(ctx):
    rows = []
    for m, cnt, mdone, mpct in ctx["ms_stats"]:
        st = m["status"]
        badge = STATUS_LABEL.get(st, st)
        col = STATUS_COLOR["done"] if st == "done" else (STATUS_COLOR["in_progress"] if st == "in_progress" else STATUS_COLOR["planned"])
        rows.append(f"""<div class="ms-row">
  <div class="ms-name">{esc(m['name'])} <span class="ms-due">due {m['due']}</span></div>
  <div class="ms-bar"><span style="width:{mpct}%;background:{col}"></span></div>
  <div class="ms-stat">{mpct}% · {mdone}/{cnt} 完成 · <span style="color:{col}">{badge}</span></div>
</div>""")
    return "".join(rows)


def weekly_table(ctx):
    rows = []
    for monday, c, cm, rate in ctx["weeks"]:
        wlabel = f'{monday.strftime("%m/%d")} 起'
        rows.append(f'<tr><td>{wlabel}</td><td>{c}</td><td>{cm}</td><td>{rate}%</td></tr>')
    return "".join(rows)


def activity_feed(ctx):
    rows = []
    for e in list(reversed(ctx["activity"]))[:16]:
        a = ctx["agent_by_id"].get(e["agent"], {})
        ts = datetime.fromisoformat(e["ts"]).strftime("%m/%d %H:%M")
        task = f'<span class="feed-task">{esc(e.get("task",""))}</span>' if e.get("task") else ""
        rows.append(f"""<div class="feed-row">
  <span class="feed-emoji">{a.get('emoji','🤖')}</span>
  <div><div class="feed-line"><b>{esc(a.get('name', e['agent']))}</b> · {esc(e['action'])} {task}</div>
  <div class="feed-detail">{esc(e.get('detail',''))}</div></div>
  <span class="feed-ts">{ts}</span>
</div>""")
    return "".join(rows)


PRIO_PF = {"高": ("🔴", "#ff5638"), "中": ("🟡", "#f5c451"), "低": ("🟢", "#5fd38a")}
PF_STAGE = {"進行中": "#46a6c8", "未開始": "#6b7280", "完成": "#5fd38a"}
TYPE_COLOR = {"我方承諾": "#ff5638", "對方承諾": "#46a6c8", "主動追蹤": "#f5c451", "風險警示": "#ff8c42"}


def rem_row(r, today):
    due = r.get("due")
    dd = d(due) if due else None
    days = (dd - today).days if dd else None
    if days is not None and days < 0:
        tag = f'<span class="r-late">逾期 {abs(days)} 天</span>'
    elif days == 0:
        tag = '<span class="r-soon">今天</span>'
    elif days is not None and days <= 7:
        tag = f'<span class="r-soon">{days} 天後</span>'
    else:
        tag = f'<span class="r-ok">{due or ""}</span>'
    pcol = PRIO_PF.get(r.get("priority"), ("", "#cbd2d8"))[1]
    typ = r.get("type", "")
    tcol = TYPE_COLOR.get(typ, "#999")
    typ_html = f'<span class="r-type" style="background:{tcol}1a;color:{tcol}">{esc(typ)}</span>' if typ else ""
    return (f'<div class="r-row"><span class="r-dot" style="background:{pcol}"></span>'
            f'<div class="r-body"><div>{esc(r["text"])}</div>'
            f'<div class="r-meta">{esc(r.get("project",""))} · {esc(r.get("client",""))} {typ_html} · 到期 {esc(due or "—")}</div></div>'
            f'{tag}</div>')


def pf_gantt(projects, today):
    rows = [p for p in projects]
    dates = []
    for p in projects:
        for k in ("brief", "next_due", "launch"):
            if p.get(k):
                dates.append(d(p[k]))
    dates.append(today)
    start, end = min(dates), max(dates)
    span = (end - start).days or 1
    left, row_h, w, top = 210, 28, 880, 36
    plot_w = w - left - 20
    h = top + len(rows) * row_h + 20

    def x_of(dt):
        return left + max(0, min(1, (dt - start).days / span)) * plot_w

    parts = [f'<svg viewBox="0 0 {w} {h}" class="gantt" preserveAspectRatio="xMidYMin meet">']
    cur = date(start.year, start.month, 1)
    while cur <= end:
        x = x_of(cur)
        parts.append(f'<line x1="{x:.1f}" y1="{top-8}" x2="{x:.1f}" y2="{h-10}" stroke="#1f232b"/>')
        parts.append(f'<text x="{x+3:.1f}" y="{top-12}" font-size="10" fill="#5b606b" font-family="Oswald,sans-serif">{cur.strftime("%m/%d")}</text>')
        cur = date(cur.year + (cur.month // 12), (cur.month % 12) + 1, 1)
    tx = x_of(today)
    parts.append(f'<line x1="{tx:.1f}" y1="{top-8}" x2="{tx:.1f}" y2="{h-10}" stroke="{ACCENT}" stroke-dasharray="3 3"/>')
    parts.append(f'<text x="{tx+3:.1f}" y="{h-12}" font-size="10" fill="{ACCENT}">今日</text>')

    for i, p in enumerate(rows):
        y = top + i * row_h
        col = PRIO_PF.get(p.get("priority"), ("", "#999"))[1]
        s = d(p.get("brief")) or d(p.get("next_due")) or d(p.get("launch")) or today
        e = d(p.get("launch")) or d(p.get("next_due")) or s
        if e < s:
            e = s
        x1, x2 = x_of(s), x_of(e)
        bw = max(5, x2 - x1)
        label = f'{p["code"]} {p["name"]}'
        if len(label) > 22:
            label = label[:21] + "…"
        parts.append(f'<text x="8" y="{y+row_h/2+4:.1f}" font-size="11" fill="#c2c5cd">{esc(label)}</text>')
        parts.append(f'<rect x="{x1:.1f}" y="{y+6:.1f}" width="{bw:.1f}" height="14" rx="4" fill="{col}" opacity="0.28"/>')
        fillw = bw * p.get("completion", 0) / 100
        parts.append(f'<rect x="{x1:.1f}" y="{y+6:.1f}" width="{fillw:.1f}" height="14" rx="4" fill="{col}"><title>{esc(p["name"])}｜完成度 {p.get("completion",0)}%</title></rect>')
        nd = d(p.get("next_due"))
        if nd:
            nx = x_of(nd)
            mc = "#ff5638" if nd < today else col
            parts.append(f'<path d="M {nx:.1f} {y+3} l 5 5 l -5 5 l -5 -5 z" fill="{mc}"><title>下個關鍵期限 {p["next_due"]}</title></path>')
    parts.append("</svg>")
    return "".join(parts)


def render_portfolio(pf):
    today = d(pf["today"])
    projects = pf.get("projects", [])
    reminders = pf.get("reminders", [])

    n = len(projects)
    active = sum(1 for p in projects if p.get("stage") == "進行中")
    overdue_rem = [r for r in reminders if r.get("due") and d(r["due"]) < today]
    week_due = sum(1 for p in projects if p.get("next_due") and 0 <= (d(p["next_due"]) - today).days <= 7)
    avg = round(sum(p.get("completion", 0) for p in projects) / n) if n else 0

    # KPI
    kpis = (
        kpi_card(n, "專案數")
        + kpi_card(active, "進行中")
        + kpi_card(len(overdue_rem), "逾期提醒", sub="需處理")
        + kpi_card(week_due, "7 天內關鍵期限")
        + kpi_card(f"{avg}%", "平均完成度", sub="估計")
    )

    # 專案卡
    cards = []
    for p in projects:
        pe, pc = PRIO_PF.get(p.get("priority"), ("", "#999"))
        sc = PF_STAGE.get(p.get("stage"), "#999")
        nd = p.get("next_due")
        nd_html = "—"
        if nd:
            late = (d(nd) - today).days
            if late < 0:
                nd_html = f'<b style="color:#ff7a5e">{nd}（逾期 {abs(late)} 天）</b>'
            elif late <= 7:
                nd_html = f'<b style="color:#f5c451">{nd}（{late} 天後）</b>'
            else:
                nd_html = nd
        risk = p.get("risk")
        risk_html = f'<div class="pcard-risk">⚠️ {esc(risk)}</div>' if risk and risk != "—" else ""
        oi = p.get("open_items", 0)
        oi_badge = f'<span class="oi">未結 {oi}</span>' if oi else ""
        cards.append(f"""<div class="pcard" style="border-top:3px solid {pc}">
  <div class="pcard-head"><span class="pcard-client">{p.get('icon','')} {esc(p.get('client',''))}</span>
    <span class="prio" style="color:{pc}">{pe} {esc(p.get('priority',''))}</span></div>
  <div class="pcard-name">{esc(p['code'])} · {esc(p['name'])}</div>
  <div><span class="stage-badge" style="background:{sc}1a;color:{sc}">{esc(p.get('stage',''))}</span>{oi_badge}</div>
  <div class="pbar2"><span style="width:{p.get('completion',0)}%;background:{sc}"></span></div>
  <div class="pcard-pct">完成度 {p.get('completion',0)}%<span class="est">（估）</span></div>
  <div class="pcard-dates"><span>下個關鍵 {nd_html}</span><span>上線 {esc(p.get('launch') or '—')}</span></div>
  <div class="pcard-week">📌 {esc(p.get('this_week') or '—')}</div>
  {risk_html}
  <div class="pcard-foot"><span>{esc(p.get('contact') or '')}</span><a href="{esc(p.get('url',''))}" target="_blank">Notion ↗</a></div>
</div>""")

    # 當前任務提醒（依截止日分組）
    dated = [r for r in reminders if r.get("due")]
    soon = sorted([r for r in dated if 0 <= (d(r["due"]) - today).days <= 7], key=lambda r: r["due"])
    later = sorted([r for r in dated if (d(r["due"]) - today).days > 7], key=lambda r: r["due"])
    overdue_sorted = sorted(overdue_rem, key=lambda r: r["due"])

    def grp(title, items):
        if not items:
            return ""
        return f'<div class="r-grp">{title}（{len(items)}）</div>' + "".join(rem_row(r, today) for r in items)

    rem_html = grp("🔴 已逾期", overdue_sorted) + grp("🟡 7 天內", soon) + grp("⚪ 之後", later)

    # 我的建議（自動產生）
    sug = []
    if overdue_rem:
        worst = min(overdue_rem, key=lambda r: r["due"])
        days = (today - d(worst["due"])).days
        sug.append(f'🔴 最急：「{esc(worst["text"])}」已逾期 {days} 天，建議今天先清。')
    upcoming = []
    for p in projects:
        for k, lbl in (("next_due", "關鍵期限"), ("launch", "上線")):
            if p.get(k) and d(p[k]) >= today:
                upcoming.append((d(p[k]), f'{p["code"]} {lbl}'))
    for r in reminders:
        if r.get("due") and d(r["due"]) >= today:
            upcoming.append((d(r["due"]), r["text"]))
    if upcoming:
        nd, what = min(upcoming, key=lambda x: x[0])
        sug.append(f'⏰ 最近期限：{nd.isoformat()}（{(nd-today).days} 天後）— {esc(what)}。')
    high = [p for p in projects if p.get("priority") == "高"]
    if high:
        sug.append(f'🎯 優先聚焦：{esc(high[0]["code"])}（{esc(high[0]["client"])}）為唯一最高優先，資源先給它。')
    gaps = [p for p in projects if p.get("stage") == "進行中" and not p.get("next_due")]
    if gaps:
        sug.append(f'📝 資料缺口：{"、".join(esc(p["code"]) for p in gaps)} 在 Notion 缺「下個關鍵期限」，補上後總覽才抓得到。')
    if len(overdue_rem) >= 5:
        common = Counter(r.get("due") for r in overdue_rem).most_common(1)
        extra = ""
        if common and common[0][1] >= 3:
            extra = f'（其中 {common[0][1]} 筆同為 {common[0][0]}，可能是已結束活動的籌備）'
        sug.append(f'🧹 資料衛生：{len(overdue_rem)} 筆仍標「待執行」卻已逾期{extra}，建議到 Notion 批次更新狀態。可叫我代為標記。')
    sug.append(f'🐝 {active} 個專案同時進行中，全在 RC／金融／公益三線；建議用上方代理團隊把每個專案的當週交付拆成任務逐一推進。')
    sug_html = "".join(f"<li>{s}</li>" for s in sug)

    return f"""<header class="pf-header">
    {donut(avg, "#46c8c8", label=f"{avg}%")}
    <div class="title"><h1>📊 {esc(pf['title'])}</h1>
      <p>來源：{esc(pf['source'])}　·　同步於 {esc(pf['synced_at'])}　·　基準日 {pf['today']}</p>
      <p class="est-note">完成度為可調整估計值；階段與日期為 Notion 快照，說「更新總覽」可重新同步。</p>
    </div>
  </header>
  <section><div class="kpis pf-kpis">{kpis}</div></section>
  <section><h2>進行中專案</h2><div class="pcards">{''.join(cards)}</div></section>
  <div class="two">
    <section><h2>當前任務提醒</h2><div class="reminders">{rem_html}</div></section>
    <section><h2>我的建議</h2><ul class="suggest">{sug_html}</ul></section>
  </div>
  <section><h2>專案時程規劃</h2>{pf_gantt(projects, today)}
    <div class="legend"><span><i style="background:#ff5638"></i>高優先</span>
      <span><i style="background:#f5c451"></i>中優先</span>
      <span><i style="background:#ff5638;transform:rotate(45deg)"></i>下個關鍵期限</span></div>
  </section>"""


def render(ctx):
    p = ctx["project"]
    overdue = ctx["days_left"] < 0
    days_txt = f'{abs(ctx["days_left"])} 天{"已逾期" if overdue else "後到期"}'
    pf = ctx.get("portfolio")
    tabs = team_open = team_close = portfolio_section = ""
    updatebar = (f'<div class="topbar"><button class="updbtn" onclick="syncNow(this)">⟳ 立即更新</button>'
                 f'<span class="upd-time">最後同步 {datetime.now().strftime("%m/%d %H:%M")}</span></div>'
                 '<div id="sync-banner" class="sync-banner">⚠️ 終端機未連線！無法同步 — 請確認電腦上的同步服務（serve.py）已啟動。</div>')
    js = ['document.body.classList.add("js");',
          ('async function syncNow(b){var bn=document.getElementById("sync-banner");bn.style.display="none";'
           'var o=b.textContent;b.disabled=true;b.textContent="同步中…";'
           'try{var c=new AbortController();var t=setTimeout(function(){c.abort();},4000);'
           'var r=await fetch("api/sync",{method:"POST",signal:c.signal});clearTimeout(t);'
           'if(!r.ok)throw 0;location.reload();}'
           'catch(e){bn.style.display="block";b.disabled=false;b.textContent=o;'
           'window.scrollTo(0,0);}}')]
    if pf:
        tabs = ('<nav class="tabs">'
                '<a class="tab active" href="#page-team" data-page="team">🐝 代理團隊</a>'
                '<a class="tab" href="#page-portfolio" data-page="portfolio">📊 我的專案總覽</a>'
                '</nav>')
        team_open = '<div id="page-team" class="page active">'
        team_close = '</div>'
        portfolio_section = f'<div id="page-portfolio" class="page">{render_portfolio(pf)}</div>'
        js.append('document.querySelectorAll(".tab").forEach(function(b){'
                  'b.addEventListener("click",function(){'
                  'document.querySelectorAll(".tab").forEach(function(x){x.classList.remove("active")});'
                  'document.querySelectorAll(".page").forEach(function(x){x.classList.remove("active")});'
                  'b.classList.add("active");'
                  'document.getElementById("page-"+b.dataset.page).classList.add("active");'
                  'window.scrollTo(0,0);});});')
    script = "<script>" + "".join(js) + "</script>"
    return f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(p['name'])} · 代理團隊 Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root {{
  --bg:#0c0d10; --panel:#14161b; --panel2:#1b1e25; --line:#2a2e37;
  --ink:#e7e5e0; --muted:#8b909b; --track:#262a33;
  --accent:{ACCENT}; --amber:#f5c451; --cyan:#46c8c8; --ok:#5fd38a;
}}
* {{ box-sizing:border-box; }}
body {{ margin:0; color:var(--ink); line-height:1.5;
  font-family:'Rajdhani',-apple-system,"PingFang TC","Microsoft JhengHei",sans-serif;
  background:#0c0d10;
  background-image:
    radial-gradient(1200px 600px at 82% -12%, rgba(255,86,56,.10), transparent 60%),
    radial-gradient(900px 520px at -12% 112%, rgba(70,200,200,.06), transparent 60%),
    repeating-linear-gradient(135deg, rgba(255,255,255,.015) 0 2px, transparent 2px 9px);
  background-attachment:fixed; }}
.wrap {{ max-width:1100px; margin:0 auto; padding:20px 18px 60px; }}
.topbar {{ display:flex; align-items:center; gap:12px; margin-bottom:12px; }}
.updbtn {{ background:var(--accent); color:#10110f; border:none; cursor:pointer;
  font-family:'Rajdhani',inherit; font-weight:700; font-size:14px; letter-spacing:.05em;
  padding:11px 22px; text-transform:uppercase;
  clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%); }}
.updbtn:disabled {{ opacity:.5; }}
.upd-time {{ font-size:11px; color:var(--muted); letter-spacing:.06em; font-family:'Oswald',sans-serif; }}
.sync-banner {{ display:none; background:rgba(255,86,56,.12); color:#ff7a5e;
  border:1px solid rgba(255,86,56,.4); border-left:4px solid var(--accent);
  padding:11px 14px; font-size:13px; font-weight:600; margin-bottom:12px; }}
.tabs {{ display:flex; gap:6px; margin-bottom:16px; position:sticky; top:0; z-index:10;
  background:linear-gradient(#0c0d10,#0c0d10 70%,transparent); padding:10px 0 12px; }}
.tab {{ flex:1; padding:12px 14px; text-align:center; text-decoration:none; cursor:pointer;
  font-family:'Rajdhani',inherit; font-weight:700; font-size:14px; letter-spacing:.07em;
  color:var(--muted); background:var(--panel); border:1px solid var(--line);
  clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%); }}
.tab.active {{ background:var(--accent); color:#10110f; border-color:var(--accent); }}
.page {{ display:block; }}
body.js .page {{ display:none; }}
body.js .page.active {{ display:block; }}
body:not(.js) #page-portfolio {{ border-top:1px dashed var(--line); margin-top:16px; padding-top:16px; }}
header {{ display:flex; align-items:center; gap:24px; flex-wrap:wrap; margin-bottom:20px;
  padding-bottom:16px; border-bottom:1px solid var(--line); position:relative; }}
header::after {{ content:""; position:absolute; left:0; bottom:-1px; width:150px; height:3px;
  background:repeating-linear-gradient(135deg,var(--amber) 0 8px,#0c0d10 8px 15px); }}
header .title h1 {{ margin:0 0 4px; font-size:26px; font-weight:700; letter-spacing:.02em; }}
header .title p {{ margin:0; color:var(--muted); font-size:12.5px; letter-spacing:.03em; }}
.donut text {{ font-family:'Oswald',sans-serif; }}
.timebar {{ flex:1; min-width:200px; }}
.timebar .tb {{ height:6px; background:var(--track); overflow:hidden; margin:6px 0;
  clip-path:polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%); }}
.timebar .tb span {{ display:block; height:100%; background:var(--accent); }}
.timebar small {{ color:var(--muted); font-size:11px; letter-spacing:.06em; font-family:'Oswald',sans-serif; }}
section {{ background:var(--panel); border:1px solid var(--line); padding:18px 20px; margin-bottom:16px;
  position:relative; clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%); }}
section::before {{ content:""; position:absolute; left:0; top:0; width:3px; height:22px; background:var(--accent); }}
h2 {{ font-size:13px; margin:0 0 14px; color:var(--ink); display:flex; align-items:center; gap:10px;
  text-transform:uppercase; letter-spacing:.13em; font-weight:600; }}
h2::before {{ content:""; width:13px; height:13px; background:var(--accent); transform:skewX(-14deg); display:inline-block; }}
.kpis {{ display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }}
.kpi {{ background:var(--panel2); border:1px solid var(--line); padding:14px 10px; text-align:center;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%); }}
.kpi-val {{ font-size:30px; font-weight:600; font-family:'Oswald',sans-serif; color:var(--ink); }}
.kpi-lbl {{ font-size:11px; color:var(--muted); margin-top:2px; letter-spacing:.08em; text-transform:uppercase; }}
.kpi-sub {{ font-size:10px; color:#5b606b; margin-top:2px; }}
.agents {{ display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }}
.agent {{ border:1px solid var(--line); background:var(--panel2); padding:12px;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%); }}
.agent-top {{ display:flex; gap:8px; align-items:center; }}
.agent-emoji {{ font-size:22px; }}
.agent-name {{ font-weight:700; font-size:13px; }}
.agent-role {{ font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; }}
.agent-status {{ font-size:12px; font-weight:700; margin:8px 0 4px; letter-spacing:.05em; }}
.agent-cur {{ font-size:11px; color:#b9bcc4; min-height:30px; background:#0f1116; border:1px solid var(--line); padding:5px 7px; }}
.agent-meta {{ display:flex; justify-content:space-between; font-size:10px; color:var(--muted); margin-top:8px; font-family:'Oswald',sans-serif; }}
.board {{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }}
.col-head {{ font-size:11px; font-weight:700; margin-bottom:8px; display:flex; justify-content:space-between;
  text-transform:uppercase; letter-spacing:.08em; padding-bottom:6px; border-bottom:1px solid var(--line); }}
.col-head span {{ background:var(--track); color:var(--muted); padding:0 7px; font-size:11px; font-family:'Oswald',sans-serif; }}
.card {{ background:var(--panel2); border:1px solid var(--line); padding:9px 10px; margin-bottom:8px; }}
.card-id {{ font-size:10px; color:var(--muted); font-weight:700; margin-bottom:3px; font-family:'Oswald',sans-serif; letter-spacing:.04em; }}
.card-title {{ font-size:12px; margin-bottom:6px; color:var(--ink); }}
.tag {{ font-size:9px; padding:0 5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; }}
.tag-feature {{ background:rgba(95,211,138,.15); color:#5fd38a; }}
.tag-bug {{ background:rgba(255,86,56,.16); color:#ff7a5e; }}
.tag-chore {{ background:#262a33; color:var(--muted); }}
.tag-video {{ background:rgba(70,200,200,.15); color:var(--cyan); }}
.pbar {{ height:4px; background:var(--track); overflow:hidden; margin:5px 0; }}
.pbar span {{ display:block; height:100%; }}
.card-foot {{ display:flex; justify-content:space-between; font-size:10px; color:var(--muted); }}
.due {{ color:var(--amber); font-family:'Oswald',sans-serif; }}
.empty {{ color:#34383f; text-align:center; font-size:12px; padding:10px 0; }}
.ms-row {{ display:grid; grid-template-columns:1.4fr 2fr 1.6fr; gap:14px; align-items:center; margin-bottom:12px; font-size:13px; }}
.ms-name {{ font-weight:600; }}
.ms-due {{ font-size:11px; color:var(--muted); font-weight:400; font-family:'Oswald',sans-serif; }}
.ms-bar {{ height:8px; background:var(--track); overflow:hidden; clip-path:polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%); }}
.ms-bar span {{ display:block; height:100%; }}
.ms-stat {{ font-size:12px; color:var(--muted); }}
.two {{ display:grid; grid-template-columns:1.6fr 1fr; gap:16px; }}
table {{ width:100%; border-collapse:collapse; font-size:13px; }}
th, td {{ text-align:left; padding:7px 8px; border-bottom:1px solid var(--line); }}
th {{ color:var(--muted); font-weight:700; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }}
td {{ font-family:'Oswald',sans-serif; color:var(--ink); }}
.chart, .gantt {{ width:100%; height:auto; }}
.feed-row {{ display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--line); }}
.feed-emoji {{ font-size:18px; }}
.feed-line {{ font-size:12px; color:var(--ink); }}
.feed-task {{ background:var(--track); color:var(--muted); padding:0 5px; font-size:10px; font-weight:700; font-family:'Oswald',sans-serif; }}
.feed-detail {{ font-size:11px; color:var(--muted); }}
.feed-ts {{ margin-left:auto; font-size:10px; color:#5b606b; white-space:nowrap; font-family:'Oswald',sans-serif; }}
.legend {{ display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--muted); margin-top:8px; }}
.legend i {{ display:inline-block; width:10px; height:10px; margin-right:4px; vertical-align:middle; }}
footer {{ text-align:center; color:#4a4f59; font-size:10px; margin-top:24px; letter-spacing:.1em; text-transform:uppercase; font-family:'Oswald',sans-serif; }}
.pf-header {{ align-items:center; }}
.est-note {{ font-size:11px; color:#5b606b; }}
.pf-kpis {{ grid-template-columns:repeat(5,1fr); }}
.pcards {{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }}
.pcard {{ border:1px solid var(--line); background:var(--panel2); padding:13px 14px;
  clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%); }}
.pcard-head {{ display:flex; justify-content:space-between; align-items:center; font-size:12px; }}
.pcard-client {{ font-weight:700; color:var(--ink); letter-spacing:.03em; }}
.prio {{ font-size:11px; font-weight:700; }}
.pcard-name {{ font-size:14px; font-weight:700; margin:6px 0; color:var(--ink); }}
.stage-badge {{ font-size:10px; font-weight:700; padding:1px 8px; text-transform:uppercase; letter-spacing:.05em; }}
.pbar2 {{ height:6px; background:var(--track); overflow:hidden; margin:8px 0 3px; clip-path:polygon(0 0,100% 0,calc(100% - 5px) 100%,0 100%); }}
.pbar2 span {{ display:block; height:100%; }}
.pcard-pct {{ font-size:11px; color:var(--muted); font-family:'Oswald',sans-serif; }}
.est {{ color:#5b606b; }}
.pcard-dates {{ display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin:7px 0; }}
.pcard-week {{ font-size:12px; background:#0f1116; border:1px solid var(--line); padding:6px 8px; color:#b9bcc4; }}
.pcard-risk {{ font-size:11px; color:#ff7a5e; margin-top:6px; }}
.pcard-foot {{ display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-top:8px; }}
.pcard-foot a {{ color:var(--accent); text-decoration:none; font-weight:700; }}
.oi {{ font-size:10px; font-weight:700; color:var(--amber); background:rgba(245,196,81,.14); padding:1px 8px; margin-left:6px; }}
.reminders {{ display:flex; flex-direction:column; gap:2px; }}
.r-grp {{ font-size:11px; font-weight:700; color:var(--muted); margin:12px 0 2px; text-transform:uppercase; letter-spacing:.06em; }}
.r-grp:first-child {{ margin-top:0; }}
.r-type {{ font-size:9px; font-weight:700; padding:1px 6px; margin:0 2px; }}
.r-row {{ display:flex; gap:10px; align-items:center; padding:8px 0; border-bottom:1px solid var(--line); }}
.r-dot {{ width:9px; height:9px; flex:none; }}
.r-body {{ flex:1; font-size:12.5px; color:var(--ink); }}
.r-meta {{ font-size:10.5px; color:var(--muted); }}
.r-late {{ font-size:10px; font-weight:700; color:#10110f; background:var(--accent); padding:2px 7px; white-space:nowrap; }}
.r-soon {{ font-size:10px; font-weight:700; color:var(--amber); background:rgba(245,196,81,.14); padding:2px 7px; white-space:nowrap; }}
.r-ok {{ font-size:10px; color:var(--muted); white-space:nowrap; font-family:'Oswald',sans-serif; }}
.suggest {{ margin:0; padding-left:0; list-style:none; }}
.suggest li {{ font-size:12.5px; color:#c2c5cd; padding:7px 0 7px 14px; border-bottom:1px solid var(--line); line-height:1.5; position:relative; }}
.suggest li::before {{ content:""; position:absolute; left:0; top:13px; width:6px; height:6px; background:var(--accent); transform:skewX(-14deg); }}
@media(max-width:820px){{
  .pf-kpis{{grid-template-columns:repeat(3,1fr)}} .pcards{{grid-template-columns:1fr}} .kpis{{grid-template-columns:repeat(3,1fr)}} .agents,.board{{grid-template-columns:repeat(2,1fr)}} .two{{grid-template-columns:1fr}} .ms-row{{grid-template-columns:1fr}} }}
</style>
</head>
<body>
<div class="wrap">
  {updatebar}
  {tabs}
  {team_open}
  <header>
    {donut(ctx['overall'], ACCENT)}
    <div class="title">
      <h1>{esc(p['name'])}</h1>
      <p>{esc(p.get('description',''))}</p>
      <p>基準日 {ctx['today'].isoformat()}　·　目標 {p['target_date']}（{days_txt}）</p>
    </div>
    <div class="timebar">
      <small>時程進度 {ctx['time_pct']}%</small>
      <div class="tb"><span style="width:{ctx['time_pct']}%"></span></div>
      <small>{p['start_date']} → {p['target_date']}</small>
    </div>
  </header>

  <section>
    <div class="kpis">
      {kpi_card(ctx['total'], '總任務')}
      {kpi_card(ctx['done'], '已完成')}
      {kpi_card(ctx['in_prog'], '進行/審查中')}
      {kpi_card(f"{ctx['done_rate']}%", '完成率')}
      {kpi_card(ctx['week_done'], '本週完成')}
      {kpi_card(f"{ctx['spent_total']:g}", '已投入工時', sub=f"估 {ctx['est_total']:g}h")}
    </div>
  </section>

  <section>
    <h2>代理團隊狀態</h2>
    <div class="agents">{agent_cards(ctx)}</div>
  </section>

  <section>
    <h2>流程看板</h2>
    <div class="board">{board_html(ctx)}</div>
  </section>

  <section>
    <h2>里程碑完成度</h2>
    {milestone_html(ctx)}
  </section>

  <div class="two">
    <section>
      <h2>每日活動（近 14 天）</h2>
      {daily_chart(ctx['daily'])}
      <div class="legend"><span><i style="background:{ACCENT}"></i>當日事件數</span>
        <span><i style="background:{STATUS_COLOR['done']};border-radius:50%"></i>任務完成</span></div>
    </section>
    <section>
      <h2>每週彙總（近 5 週）</h2>
      <table><thead><tr><th>週</th><th>新增</th><th>完成</th><th>完成率</th></tr></thead>
      <tbody>{weekly_table(ctx)}</tbody></table>
    </section>
  </div>

  <section>
    <h2>計畫時程 Gantt</h2>
    {gantt(ctx)}
    <div class="legend">
      {''.join(f'<span><i style="background:{STATUS_COLOR[s]}"></i>{STATUS_LABEL[s]}</span>' for s in STATUS_ORDER)}
      <span><i style="background:{ACCENT};transform:rotate(45deg)"></i>里程碑</span>
    </div>
  </section>

  <section>
    <h2>最近活動軌跡</h2>
    {activity_feed(ctx)}
  </section>
  {team_close}
  {portfolio_section}

  <footer>由 agent-team/dashboard/generate.py 產生 · {datetime.now().strftime('%Y-%m-%d %H:%M')}</footer>
</div>
{script}
</body>
</html>"""


def main():
    ctx = build()
    OUT.write_text(render(ctx), encoding="utf-8")
    print(f"✅ Dashboard 已產生：{OUT}")
    print(f"   基準日：{ctx['today']}　總任務 {ctx['total']}　完成 {ctx['done']}　整體完成度 {ctx['overall']}%")


if __name__ == "__main__":
    main()
