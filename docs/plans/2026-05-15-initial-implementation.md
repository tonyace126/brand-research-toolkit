# brand-research-toolkit Initial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a downloadable Claude Code plugin packaging two reusable skills — `brand-issue-research` (cross-platform brand topic research) and `publish-research-html` (newsletter publishing with auto git push) — plus a worked bank example as the canonical demo.

**Architecture:** Two loosely-coupled skills under one plugin. `brand-issue-research` uses progressive disclosure (short SKILL.md + per-platform references/) and parallel agent dispatch. `publish-research-html` reads `~/.config/research-publisher.json`, applies a single CSS-variable-based HTML template, and optionally commits + pushes to a user-configured GitHub Pages repo.

**Tech Stack:** Markdown skills, single-file responsive HTML template (no JS deps), CSS variables for theming, `git` CLI for publishing. No build step, no runtime deps.

**Repo:** `~/work/brand-research-toolkit/` (git initialized, spec already committed at `docs/specs/2026-05-15-design.md`).

---

## File Structure

```
brand-research-toolkit/
├── README.md                                    # T2, T19
├── plugin.json                                  # T1
├── LICENSE                                      # T1
├── .gitignore                                   # T1
├── examples/
│   └── 2026-05-tw-bank-viral-videos.html       # T18
└── skills/
    ├── brand-issue-research/
    │   ├── SKILL.md                             # T3
    │   ├── references/
    │   │   ├── prompts/parallel-agents.md       # T5
    │   │   ├── platforms/youtube.md             # T6
    │   │   ├── platforms/ptt.md                 # T7
    │   │   ├── platforms/dcard.md               # T8
    │   │   ├── platforms/mobile01.md            # T9
    │   │   ├── platforms/news.md                # T10
    │   │   ├── platforms/threads-fb.md          # T11
    │   │   └── examples/bank-research-2026-05.md # T12
    │   └── assets/
    │       └── output-schema.json               # T4
    └── publish-research-html/
        ├── SKILL.md                             # T13
        ├── references/
        │   ├── customization-guide.md           # T16
        │   └── github-pages-setup.md            # T17
        └── assets/
            ├── newsletter-template.html         # T14
            └── theme-vars.css                   # T15
```

**Note:** No automated tests in v1 (skills are markdown + static HTML). Verification is manual end-to-end runs (T20).

---

## Phase 1: Repo skeleton

### Task 1: plugin metadata + license + gitignore

**Files:**
- Create: `plugin.json`
- Create: `LICENSE`
- Create: `.gitignore`

- [ ] **Step 1: Write `plugin.json`**

```json
{
  "name": "brand-research-toolkit",
  "version": "0.1.0",
  "description": "Lazy package for brand issue research across YouTube, forums, news — outputs to HTML newsletter.",
  "author": "Sugarfun / Tony Wang",
  "license": "MIT",
  "repository": "https://github.com/tonyace126/brand-research-toolkit"
}
```

- [ ] **Step 2: Write `LICENSE` (MIT, 2026)**

Standard MIT text with `Copyright (c) 2026 Tony Wang / Sugarfun`. Use the canonical MIT template — do not modify the legal body.

- [ ] **Step 3: Write `.gitignore`**

```
.DS_Store
*.swp
*.bak
node_modules/
.env
.env.local
_setup-test.html
```

- [ ] **Step 4: Commit**

```bash
git add plugin.json LICENSE .gitignore
git commit -m "chore: add plugin metadata, license, gitignore"
```

---

### Task 2: README.md (initial scaffold)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write initial README**

```markdown
# brand-research-toolkit

> 品牌議題研究懶人包 — 給喜歡當伸手牌的你

跨平台品牌議題研究的 Claude Code plugin。一句話啟動、並行查 7 個平台、整理表格、發布電子報。

## 包含的 Skills

| Skill | 做什麼 |
|---|---|
| `brand-issue-research` | 跨平台研究品牌話題（YouTube、PTT、Dcard、Mobile01、新聞、Threads、FB） |
| `publish-research-html` | 把研究結果做成乾淨 HTML 電子報，可一鍵推到 GitHub Pages |

## 安裝

```bash
# 方式 1：拷貝到 Claude Code plugin 目錄
cp -R brand-research-toolkit ~/.claude/plugins/

# 方式 2：用 Claude Code plugin install 指令
claude plugin install path/to/brand-research-toolkit
```

## 使用範例

對 Claude 說：
- 「幫我研究國泰世華近 30 天的話題在哪些平台延燒」
- 「盤點台灣前 10 大民營銀行的 YouTube 聲量」
- 「研究 X 品牌在 PTT/Dcard 怎麼被討論」

研究完成後：
- 「做成 HTML 電子報」→ 自動套範本、推到你的 GitHub Pages

## 範例輸出

`examples/2026-05-tw-bank-viral-videos.html` — 9 家官股 + 10 家民營銀行 30 天 YouTube 話題影片清單

## 第一次使用 publish-research-html

會問你 5 題（GitHub Pages repo 路徑、對外網址、作者、要不要自訂主題、主題 CSS 檔名），寫入 `~/.config/research-publisher.json`。下次直接用。

## 客製化

HTML 範本用 CSS 變數設計，要改色/字型只需要在你的 GitHub Pages repo 放一個 override CSS。詳見 `skills/publish-research-html/references/customization-guide.md`。

## License

MIT © 2026 Tony Wang / Sugarfun
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add initial README"
```

---

## Phase 2: brand-issue-research skill

### Task 3: SKILL.md (brand-issue-research)

**Files:**
- Create: `skills/brand-issue-research/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

```markdown
---
name: brand-issue-research
description: Research brand issues, controversies, or campaigns across YouTube, PTT, Dcard, Mobile01, news sites, Threads, and FB. Use when user says "research X brand discussion", "find what people say about Y", "track [brand] [topic] across platforms", "盤點 X 品牌話題", "研究 X 在 PTT/YouTube 怎麼被討論", "X 議題輿情", "競品聲量比較", or wants a structured cross-platform brand sentiment / topic landscape. Dispatches parallel agents per platform, returns structured tables + observation summary.
---

# Brand Issue Research（品牌議題研究）

跨平台研究品牌話題、輿情、廣告活動。並行查多平台 → 整合表格 → 觀察小結。

## 何時使用
- 盤點品牌在台灣社群的聲量
- 追蹤特定議題在哪些平台延燒
- 競品比較 / 危機事件梳理 / 正向 campaign 效益觀察

## 適用平台與 AI 真實可達性

| 平台 | AI 友善度 | 主要工具 | 細節 |
|---|---|---|---|
| YouTube | ✅ 高 | WebSearch + Gemini 餵連結 | references/platforms/youtube.md |
| PTT | ✅ 高（純 HTML） | WebFetch + WebSearch site: | references/platforms/ptt.md |
| Dcard | ✅ 中 | WebSearch site: + Chrome MCP | references/platforms/dcard.md |
| Mobile01 | ✅ 高 | WebFetch + WebSearch site: | references/platforms/mobile01.md |
| 新聞媒體 | ✅ 高 | WebSearch + WebFetch | references/platforms/news.md |
| Threads | ⚠️ 牆 | 改用 Threads App / KEYPO | references/platforms/threads-fb.md |
| FB | ⚠️ 牆 | 改用第三方社群監聽 | references/platforms/threads-fb.md |

## 執行流程（5 步）

### 1. 釐清研究主題（一題一題問）
- 品牌名 / 議題範圍
- 時間範圍（預設近 30 天）
- 是否含競品對照
- 期待產出形式（表格 / 報告 / 兩者）

### 2. 平台分派
不是每次全查。根據主題挑：
- 影片導向 → YouTube 為主
- 社群口碑 → PTT + Dcard + Mobile01
- 新聞事件 → 新聞 + PTT
- 品牌行銷活動 → YouTube + Threads（誠實標牆）

### 3. 並行 dispatch agents
每平台一個 agent，使用 `references/prompts/parallel-agents.md` 範本。
**關鍵**：所有 agent 在同一個訊息內並發送出。

### 4. 整合結果
合併成統一表格，schema 見 `assets/output-schema.json`：
`平台 | 標題/主題 | 來源 | 日期 | 聲量級距 | 情緒 | 主題分類 | URL`

### 5. 觀察小結
3-5 條跨平台 insight。**不是**平台累加，而是模式辨識：
- 哪個平台最熱？
- 哪個議題在跨平台延燒？
- 正向 vs 負向比例？
- 競品 head-to-head 差距？

## 嚴格規則

- **找不到就說找不到**，禁止編造影片、貼文、URL
- 每個平台至少嘗試 3 種搜尋組合
- 聲量無法精確驗證時用「級距」（高 / 中高 / 中 / 低）取代假數字
- 必須保留可點開的原始 URL
- 每個 agent 回傳長度上限約 800-1000 字（防 context bloat）

## 完成後

詢問使用者：「要不要做成 HTML 電子報？」
- 同意 → 觸發 `publish-research-html` skill
- 否 → 結束

## 範例

完整跑過一次的銀行研究範例見 `references/examples/bank-research-2026-05.md`，內含：
- 真實 prompt
- 4 個並行 agent 的分派文字
- 整合後表格
- 觀察小結
```

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/SKILL.md
git commit -m "feat(skill): add brand-issue-research SKILL.md"
```

---

### Task 4: output-schema.json

**Files:**
- Create: `skills/brand-issue-research/assets/output-schema.json`

- [ ] **Step 1: Write schema**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Brand Issue Research Output",
  "type": "object",
  "required": ["topic", "time_range", "rows", "summary"],
  "properties": {
    "topic": { "type": "string", "description": "研究主題" },
    "brand": { "type": "string", "description": "品牌名（單一品牌時填）" },
    "brands": { "type": "array", "items": { "type": "string" }, "description": "多品牌比較時填" },
    "time_range": {
      "type": "object",
      "required": ["from", "to"],
      "properties": {
        "from": { "type": "string", "format": "date" },
        "to": { "type": "string", "format": "date" }
      }
    },
    "rows": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["platform", "title", "url"],
        "properties": {
          "platform": { "type": "string", "enum": ["YouTube", "PTT", "Dcard", "Mobile01", "News", "Threads", "FB"] },
          "title": { "type": "string" },
          "source": { "type": "string", "description": "頻道 / 版 / 作者 / 媒體" },
          "date": { "type": "string", "format": "date" },
          "volume": { "type": "string", "enum": ["高", "中高", "中", "低", "未知"] },
          "sentiment": { "type": "string", "enum": ["正向", "中性", "負向", "爭議"] },
          "category": { "type": "string", "description": "主題分類，自由填" },
          "url": { "type": "string", "format": "uri" },
          "notes": { "type": "string" }
        }
      }
    },
    "summary": {
      "type": "object",
      "required": ["tldr", "insights"],
      "properties": {
        "tldr": { "type": "string", "description": "100 字內" },
        "insights": { "type": "array", "items": { "type": "string" }, "description": "3-5 條跨平台觀察" }
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/assets/output-schema.json
git commit -m "feat(skill): add output schema for brand-issue-research"
```

---

### Task 5: prompts/parallel-agents.md

**Files:**
- Create: `skills/brand-issue-research/references/prompts/parallel-agents.md`

- [ ] **Step 1: Write parallel-agents reference**

````markdown
# 並行 Agent 分派範本

跨平台研究的核心：在**同一個訊息**內 dispatch 多個 Agent tool 呼叫。

## 通用 Agent prompt 範本

```
幫我在【平台名】上找「【品牌】」近【時間範圍】的「【主題】」相關內容。

## 工作方式
- 主要工具：WebSearch + WebFetch
- 平台限制：見 references/platforms/【平台】.md
- 搜尋策略至少嘗試 3 種組合

## 回傳格式（Markdown 表格）
| 標題 | 來源 | 日期 | 聲量級距 | 情緒 | 主題分類 | URL |

## 嚴格規則
- 找不到就老實寫「該品牌近 X 天無顯著內容」，**不要編造**
- URL 必須真實可點開
- 聲量無法驗證時用級距（高/中高/中/低）
- 回傳長度上限【字數】字

## 觀察小結
最後給 100 字內小結（哪個主題最熱、情緒走向）。
```

## 並行 dispatch 範例（4 平台）

收到「研究 X 品牌近 30 天輿情」→ 在**同一個訊息**內：

```
Agent("研究 X 品牌 YouTube", platform=youtube, ...)
Agent("研究 X 品牌 PTT", platform=ptt, ...)
Agent("研究 X 品牌 Dcard", platform=dcard, ...)
Agent("研究 X 品牌 News", platform=news, ...)
```

四個 agent 同時跑，比序列快 3-4 倍。

## 各平台字數上限建議

| 平台 | 上限 | 原因 |
|---|---|---|
| YouTube | 1000 字 | 影片較多，需空間放表格 |
| PTT | 800 字 | 推文數可加註 |
| Dcard | 600 字 | 通常聲量較分散 |
| Mobile01 | 600 字 | 開箱長文需摘要 |
| News | 800 字 | 多篇報導需整合 |
| Threads | 300 字 | 走不通就直接回報 |
| FB | 300 字 | 同上 |

## 軟化語氣（避免 AI 拒絕）

如果 agent 回報拒絕（"我只是語言模型..."），重試時：
- 加身份說明：「我在做行銷研究」
- 移除負面詞：「抱怨吐槽」→「用戶反饋」
- 移除操縱詞：「為何爆紅」→「敘事手法分析」
- 拆批：一次查 3 家，不要 19 家
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/prompts/parallel-agents.md
git commit -m "feat(skill): add parallel-agents prompt reference"
```

---

### Task 6: platforms/youtube.md

**Files:**
- Create: `skills/brand-issue-research/references/platforms/youtube.md`

- [ ] **Step 1: Write YouTube platform reference**

````markdown
# Platform: YouTube

## AI 可達性
✅ **高**。WebSearch 可索引、WebFetch 可抓 HTML metadata（但 SPA 動態載入的觀看數抓不到精確值）。

## 主要工具
1. **Claude WebSearch + WebFetch** — 適合找候選清單與標題、上架日
2. **Gemini 餵 YouTube URL** — 餵連結直接讓 Gemini 看影片內容/字幕（這是 Gemini 比 Claude 強的地方）

## 搜尋語法

### WebSearch 組合
- `site:youtube.com "品牌名"`
- `site:youtube.com "品牌名" 2026`
- `品牌名 廣告 youtube`
- `品牌名 KOL OR 業配 youtube`
- `品牌名 開箱 評測`
- `品牌名 -shorts`（排除短片）
- `品牌名 shorts`（只看短片）

### YouTube 原生搜尋（最準）
不要靠 AI，直接去 youtube.com：
1. 搜「品牌名」
2. 篩選 → 上傳日期：本月 / 今年
3. 排序 → 觀看次數
4. 拿前 10 名連結回 Claude/Gemini 做內容分析

## 限制與陷阱

- **觀看數無法精確抓**：YouTube 是 SPA，WebFetch 只拿到 page shell。聲量請用級距估計（高 = 5 萬+、中高 = 1-5 萬、中 = 1 萬上下、低 = 1 萬下）
- **頻道 /videos 頁也抓不到列表**：同樣 SPA 限制。改用 site: 搜尋
- **Chrome MCP 在 youtube.com 被 block**（見 Tony 全域 CLAUDE.md）— 不要用 navigate
- **時間範圍只能用「最近搜尋結果」近似**：搜尋結果不會永遠按時間排，要看單支影片標題/摘要中的時間線索

## Gemini 接力策略

Claude 找到候選 URL 清單後，建議使用者把 URL 丟給 Gemini 做：
- 影片內容摘要
- 留言情緒
- 特定主張/數字驗證

Gemini 接力 prompt 範本見 `parallel-agents.md` 末段。

## 軟化策略

Gemini 對「找最熱影片 / 排名」類請求容易拒絕。改寫：
- 「高聲量話題影片」→「較多人觀看或討論的影片」
- 「為何爆紅」→「內容敘事分析」
- 「抱怨吐槽」→「用戶反饋」
- 「找 19 家銀行」→「先看這 3 家：A、B、C」（拆批）
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/platforms/youtube.md
git commit -m "feat(skill): add youtube platform reference"
```

---

### Task 7: platforms/ptt.md

**Files:**
- Create: `skills/brand-issue-research/references/platforms/ptt.md`

- [ ] **Step 1: Write PTT platform reference**

````markdown
# Platform: PTT

## AI 可達性
✅ **高**。PTT (ptt.cc) 是純 HTML，WebFetch 完全可抓推文、標題、ID、IP、時間戳。

## 主要工具
- **WebSearch** + `site:ptt.cc` 找文章
- **WebFetch** 直接抓單篇文章 HTML（含推文）

## 看板挑選

| 議題類型 | 推薦看板 |
|---|---|
| 信用卡 / 銀行 | CreditCard、Bank_Service、Lifeismoney |
| 3C / 手機 | MobileComm、iOS、Android、PC_Shopping |
| 汽車 | car、Audi、Toyota、BMW（廠牌板） |
| 餐飲 | Food、KoreanFood、AllTW |
| 美妝 / 女性 | MakeUp、BeautySalon、WomenTalk |
| 飯店旅遊 | Hotel、Japan_Travel、Aviation |
| 八卦 / 時事 | Gossiping（聲量大但雜訊高） |
| 投資 / 股票 | Stock、Foreign_Inv |

## 搜尋語法

```
site:ptt.cc "品牌名" 推
site:ptt.cc "品牌名" 心得
site:ptt.cc inurl:CreditCard 品牌名
"品牌名" 板 PTT 評價
```

## 鏡像站（Google 索引較完整）
- `disp.cc/b/...` — PTT 鏡像，搜尋更友善
- `pttweb.tw` — 另一個鏡像

## 聲量指標

PTT 文章可看到：
- 推 / 噓 / 箭頭數量（直接 HTML 抓得到）
- 推文總數
- 是否被 m 標（精華）
- 是否爆文（推 > 100）

聲量級距建議：
- 高：推 100+ 或被多板轉錄
- 中高：推 50-100
- 中：推 10-50
- 低：推 0-10

## 情緒判讀
- 推 > 噓 ≈ 正向
- 噓 > 推 ≈ 負向
- 推噓接近 + 留言激辯 ≈ 爭議
- 推噓都少 ≈ 中性 / 冷門

## 限制
- Gossiping 雜訊高，要過濾
- 部分文章被刪可能找不到原文
- WebFetch 抓 ptt.cc 會跳「年滿 18 歲」確認頁，部分板需特殊處理（可改抓鏡像站）
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/platforms/ptt.md
git commit -m "feat(skill): add ptt platform reference"
```

---

### Task 8: platforms/dcard.md

**Files:**
- Create: `skills/brand-issue-research/references/platforms/dcard.md`

- [ ] **Step 1: Write Dcard platform reference**

````markdown
# Platform: Dcard

## AI 可達性
✅ **中**。文章列表頁是動態載入，但個別文章頁可被 Google 索引、WebFetch 部分可抓。Chrome MCP 可開 dcard.tw（見 Tony 全域 CLAUDE.md）。

## 主要工具
- **WebSearch** + `site:dcard.tw`
- **Chrome MCP navigate** — 可正常開啟 dcard.tw（少數允許的網域之一）
- **WebFetch** — 對單篇文章 URL 部分有效

## 版（看板）挑選

| 議題類型 | 推薦版 |
|---|---|
| 信用卡 / 理財 | 理財、有錢人想的和你不一樣 |
| 3C | 3C、Apple、Android |
| 美妝 / 服飾 | 美妝、穿搭 |
| 餐飲 / 美食 | 美食 |
| 飯店 / 旅遊 | 旅遊、日本旅遊 |
| 感情 / 兩性 | 感情、男女 |
| 校園 / 工作 | 各校版、職場 |

## 搜尋語法

```
site:dcard.tw "品牌名"
site:dcard.tw "品牌名" 心得 OR 評價 OR 推薦 OR 雷
site:dcard.tw 版/品牌名
```

## 聲量指標

Dcard 文章可看到：
- 愛心數（讚）
- 留言數
- 收藏數（部分）

聲量級距建議：
- 高：愛心 500+ 或留言 100+
- 中高：愛心 100-500
- 中：愛心 30-100
- 低：愛心 < 30

## 限制
- API 沒公開、刮爬規則嚴
- 動態載入，列表頁靠 WebFetch 抓不到完整資料
- Dcard 對年輕族群（18-25）代表性高，但中老年議題很冷
- 商業推廣文比例不低，要辨識業配

## 替代方案
若需大量 Dcard 數據監聽：
- KEYPO 大數據關鍵引擎（含 Dcard 模組）
- Dcard 自家「熱門」分類也有參考價值（手動瀏覽）
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/platforms/dcard.md
git commit -m "feat(skill): add dcard platform reference"
```

---

### Task 9: platforms/mobile01.md

**Files:**
- Create: `skills/brand-issue-research/references/platforms/mobile01.md`

- [ ] **Step 1: Write Mobile01 platform reference**

````markdown
# Platform: Mobile01

## AI 可達性
✅ **高**。傳統 phpBB 風格論壇，HTML 結構穩定，WebFetch 完全可抓討論串、回文、樓層。

## 主要工具
- **WebSearch** + `site:mobile01.com`
- **WebFetch** 抓單篇討論串

## 專區挑選（Mobile01 重要分類）

| 議題類型 | 推薦專區 |
|---|---|
| 智慧手機 | Apple iPhone、Android Phone、HTC、Samsung、Sony |
| 相機 | DSLR、Mirrorless、Compact Camera |
| 汽車 | 各廠牌專區（Toyota、Honda、Audi...） |
| 機車 | 機車區（Yamaha、SYM、KYMCO） |
| 居家 / 家電 | 家電綜合、空調冷氣、廚房家電 |
| 電腦 / 筆電 | Notebook、PC 組裝 |
| 影音 | Hi-Fi、家庭劇院 |
| 旅遊 / 飯店 | 旅遊綜合、飯店體驗 |

## 搜尋語法

```
site:mobile01.com "品牌名"
site:mobile01.com "品牌名" 開箱
site:mobile01.com "品牌名" 故障 OR 問題 OR 災情
site:mobile01.com "品牌名" 推薦 OR 必買
```

## 聲量指標
- 點閱數（每篇都有顯示）
- 回文樓層數
- 是否被首頁置頂 / 編輯精選

聲量級距建議：
- 高：點閱 10,000+ 或回文 100+ 樓
- 中高：點閱 3,000-10,000
- 中：點閱 1,000-3,000
- 低：點閱 < 1,000

## 內容特性
- **長文 + 多圖開箱**為主要型態
- 使用者年齡層較高（30-50），消費力強
- 3C / 汽車 / 家電議題的權威平台之一
- 業配文有，但通常會被網友識破

## 限制
- 行動 UI 與桌面 UI 結構略不同，WebFetch 建議直接抓桌面版 URL（無 m. 前綴）
- 部分專區需登入才看完整內容（少數）
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/platforms/mobile01.md
git commit -m "feat(skill): add mobile01 platform reference"
```

---

### Task 10: platforms/news.md

**Files:**
- Create: `skills/brand-issue-research/references/platforms/news.md`

- [ ] **Step 1: Write News platform reference**

````markdown
# Platform: 新聞媒體

## AI 可達性
✅ **高**。多數台灣新聞網站是傳統 server-rendered HTML，WebFetch 可抓全文。

## 主要工具
- **WebSearch** + 媒體 site: filter
- **WebSearch** + Google News（不需 site，全網新聞）
- **WebFetch** 抓單篇

## 可 WebFetch 的台灣新聞媒體（白名單）

### 主流綜合
- udn.com（聯合新聞網）
- chinatimes.com（中時）
- ltn.com.tw（自由時報）
- ettoday.net
- nownews.com
- storm.mg（風傳媒）
- mirrormedia.mg（鏡週刊）

### 財經 / 商業
- ec.ltn.com.tw（自由財經）
- finance.ettoday.net
- money.udn.com
- wealth.com.tw（財訊）
- businesstoday.com.tw（今周刊）
- bnext.com.tw（數位時代）
- tw.stock.yahoo.com（Yahoo 財經）

### 科技 / 媒體
- ithome.com.tw
- techbang.com
- inside.com.tw
- cool3c.com

### 生活 / 美妝 / 旅遊
- vogue.com.tw
- elle.com.tw
- marieclaire.com.tw

## 搜尋語法

```
site:udn.com "品牌名"
site:ettoday.net "品牌名" 2026
"品牌名" 新聞 2026 5月
"品牌名" 危機 OR 爭議 OR 道歉  ← 找負面事件
"品牌名" 創新高 OR 新品 OR 上市  ← 找正面新聞
```

## 聲量指標
- 該事件被多少家媒體報導（cross-source coverage）
- 是否上 Google News 首屏
- Yahoo 新聞瀏覽數（部分顯示）

聲量級距建議：
- 高：5+ 家主流媒體報導 + Yahoo 上首頁
- 中高：3-5 家媒體跟進
- 中：1-2 家獨家
- 低：僅地方版 / 業界小報

## 情緒判讀
看標題用詞：
- 「再創新高 / 突破」→ 正向
- 「爆雷 / 道歉 / 重挫」→ 負向
- 「股價持平 / 公布」→ 中性

## 限制
- 部分付費牆新聞 WebFetch 只抓得到摘要（如商週、天下、財訊深度報導）
- 新聞稿（公關發稿）vs 記者深度採訪要分辨
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/platforms/news.md
git commit -m "feat(skill): add news platform reference"
```

---

### Task 11: platforms/threads-fb.md

**Files:**
- Create: `skills/brand-issue-research/references/platforms/threads-fb.md`

- [ ] **Step 1: Write Threads/FB platform reference**

````markdown
# Platform: Threads & Facebook

## AI 可達性
⚠️ **牆**。兩者都是 Meta 旗下，對搜尋引擎封鎖嚴重，動態載入內容 WebFetch 抓不到。

## 為什麼走不通

### Threads
- 對 Google index 開放度極低（Meta 自家想收回流量）
- WebFetch 抓 threads.net / threads.com 拿不到 metadata（見 Tony 全域 CLAUDE.md）
- Chrome MCP 在 threads.net 被 block
- 唯一可行：WebSearch `site:threads.net 品牌` 偶爾索引到單篇

### Facebook
- 公開貼文 WebSearch **可能**索引到（看設定）
- 個人頁、私人社團、動態載入留言完全抓不到
- Chrome MCP 在 facebook.com 第一次需許可
- API 需 access token + page admin 權限

## 走得通的有限做法

### Threads
1. **WebSearch** `site:threads.net "品牌名"`（命中率低）
2. **直接用 Threads App** 搜「品牌名」、追蹤品牌官方帳號
3. **第三方監聽**：KEYPO 已有 Threads 模組

### Facebook
1. **WebSearch** `site:facebook.com "品牌名"`（部分公開貼文可索引）
2. **品牌粉專直接看**（手動）
3. **CrowdTangle**（Meta 收回，現在不對外）的替代品：BuzzSumo、Brandwatch

## 替代工具推薦

| 工具 | 涵蓋平台 | 特性 |
|---|---|---|
| KEYPO 大數據關鍵引擎 | FB、IG、Threads、PTT、Dcard、新聞 | 台灣 No.1，付費 |
| KOL Radar | IG、FB、YT、TikTok | KOL 為核心 |
| Brandwatch | 全球社群 | 國際品牌用較多 |
| Sprout Social | FB、IG、X、LinkedIn | 偏管理面 |
| Meltwater | 新聞 + 社群 | PR 圈愛用 |

## 該怎麼回報

當研究主題一定要含 Threads / FB 時，誠實寫：

> 「Threads / FB 因 Meta 牆，AI 工具無法系統性抓取。建議走以下路徑：
> 1. 短期手動：直接用 App 搜「品牌名」，看前 20 筆排序
> 2. 中期工具：訂閱 KEYPO（約 NT$XX/月）抓真實互動數
> 3. 我可以幫你：用 WebSearch 找 Google 索引到的少數 FB/Threads 貼文（但不完整）」

讓使用者選擇要不要走替代路徑。
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/platforms/threads-fb.md
git commit -m "feat(skill): add threads-fb platform reference"
```

---

### Task 12: examples/bank-research-2026-05.md

**Files:**
- Create: `skills/brand-issue-research/references/examples/bank-research-2026-05.md`

- [ ] **Step 1: Write canonical bank research example**

````markdown
# 範例：台灣銀行業 30 天話題影片研究（2026-05）

這是 brand-research-toolkit v0.1.0 的 canonical example。完整跑完一輪「YouTube + TikTok × 官股 + 民營」交叉研究。

## 使用者需求（原始輸入）
> 「YouTube + TikTok 近 30 天，所有官股 vs 主要民營，找高聲量話題影片，最後做成清單表格」

## 釐清後的研究參數
- **時間範圍**：2026-04-15 ~ 2026-05-15
- **平台**：YouTube + TikTok
- **品牌**：
  - 官股 9 家：台銀、土銀、合庫、第一銀、華南、彰銀、兆豐、臺企、輸銀
  - 民營 10 家：國泰世華、中信、台新、玉山、永豐、富邦、聯邦、遠東、星展、滙豐
- **產出**：表格 + 觀察小結

## 並行 dispatch（4 agents）

```
Agent 1: YouTube 官股銀行（9 家）
Agent 2: YouTube 民營銀行（10 家）
Agent 3: TikTok 官股銀行
Agent 4: TikTok 民營銀行
```

每個 agent 都用了 `prompts/parallel-agents.md` 的範本，並指定字數上限（YT 1000 字、TikTok 600-800 字）。

## 整合後表格（節選）

### YouTube 民營銀行 — 高聲量影片

| 銀行 | 影片標題 | 頻道/創作者 | 上架日 | 聲量 | 主題 | URL |
|---|---|---|---|---|---|---|
| 國泰世華 | 國泰 CUBE 卡大放送，全用戶零門檻 13% 回饋 | SHIN LI 李勛 | 2026-04 下 | 高 | KOL / 信用卡 | youtube.com/watch?v=ib3SfCZk-VI |
| 台新 | 台新銀行將消失！GOGO 卡不玩了？ | SHIN LI 李勛 | 2026-04 中下 | 高（爭議） | KOL / 信用卡 | youtube.com/watch?v=4bly_B-Bows |
| 永豐 | 永豐大戶大地震，沒存 100 萬大砍回饋 | SHIN LI 李勛 | 2026-04 下 ~ 5 月初 | 高（民怨） | KOL / DAWHO APP | youtube.com/watch?v=MObRIr3zX70 |

### TikTok 全銀行
> 19 家銀行近 30 天 TikTok 無顯著話題影片。唯一聲量是「彰化銀行 4/6 系統故障」的網友自發抱怨潮。

## 觀察小結（範例）

1. **KOL 主場，不是官方**：YouTube 高聲量幾乎全來自 SHIN LI 李勛
2. **三大話題引擎**：
   - 正向：國泰 CUBE 13%
   - 負向：台新 GOGO 改版、永豐 DAWHO 100 萬門檻
   - 季節：5 月綜所稅
3. **TikTok 是金融品牌盲區**
4. **官股 vs 民營**：民營有信用卡權益異動可炒，官股近乎只有官方頻道靜默

## 從這個範例學到什麼

- **拆批策略奏效**：4 個 agent 並行，總時間約 3 分鐘（序列要 12 分鐘）
- **誠實標 N/A 比編造重要**：TikTok 全部回報「無顯著」反而是有用資訊
- **聲量級距 vs 假數字**：YouTube SPA 抓不到精確觀看數，用「高/中/低」級距更誠實
- **KOL 主場觀察**：研究結果意外發現「金融類 YouTube ≈ SHIN LI 李勛一個人撐」這種 meta-insight
````

- [ ] **Step 2: Commit**

```bash
git add skills/brand-issue-research/references/examples/bank-research-2026-05.md
git commit -m "feat(skill): add bank research canonical example"
```

---

## Phase 3: publish-research-html skill

### Task 13: SKILL.md (publish-research-html)

**Files:**
- Create: `skills/publish-research-html/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

````markdown
---
name: publish-research-html
description: Convert any research result (tables, summaries, sources) into a clean, responsive HTML newsletter and optionally auto-push to a GitHub Pages repo. Use when user says "做成 HTML", "推到 my-shares", "publish as newsletter", "把這份報告做成電子報", "發到網頁版", or after completing any research task that should be shareable.
---

# Publish Research HTML

把任何研究結果（表格、摘要、來源）轉成乾淨響應式 HTML 電子報，可選擇自動 push 到 GitHub Pages。

## 何時使用
- 研究剛做完想分享
- 把對話內容沉澱成可長期存取的網址
- 內部 / 客戶 / 公開電子報

## 流程（4 步）

### 1. 讀設定檔
讀 `~/.config/research-publisher.json`：
- 存在 → 直接使用
- 不存在 → 跑 setup（見下方）

### 2. 整理輸入
從研究結果擷取：
- **title**：頁面標題
- **tldr**：100 字內摘要
- **body**：主要內容（含表格、段落、卡片清單）
- **sources**：來源連結清單
- **slug**：英文 kebab-case 檔名（例：`2026-05-tw-bank-viral-videos`）

### 3. 套用範本
讀 `assets/newsletter-template.html`，做變數替換：

| Token | 內容 |
|---|---|
| `{{TITLE}}` | 頁面標題 |
| `{{TLDR}}` | TL;DR 摘要 |
| `{{AUTHOR}}` | 設定檔的 default_author |
| `{{DATE}}` | 今天日期（YYYY-MM-DD） |
| `{{YEAR}}` | 今年（footer 用） |
| `{{READ_TIME}}` | 估計閱讀分鐘（每 500 字 ≈ 1 分鐘） |
| `{{HOME_URL}}` | 設定檔的 shares_base_url |
| `{{BODY}}` | 主要內容 HTML |
| `{{SOURCES}}` | `<li>` 清單 |
| `{{THEME_OVERRIDE_LINK}}` | 若 theme_overrides 設定存在則 `<link rel="stylesheet" href="...">`，否則空字串 |

寫到 `<shares_repo_path>/<slug>.html`。

### 4. 詢問是否 push
顯示產出路徑 + 預覽連結（`file://`），問：「Push 到 GitHub Pages 嗎？」
- y → 執行 git add/commit/push（見下方）
- n → 結束（檔案已在本機）

## Setup 流程（首次使用）

互動式問 5 題：

```
1. GitHub Pages repo 本機絕對路徑？
   例：/Users/wangyigong/my-shares
2. 對外網址（不含尾斜線）？
   例：https://tonyace126.github.io/my-shares
3. 作者署名？
   例：Tony / Sugarfun
4. 要用自訂主題嗎？(y/n，n = 通用範本)
5. （若上題 y）自訂主題 CSS 檔名（放在 repo 根目錄）？
   例：sugarfun-theme.css
```

寫入 `~/.config/research-publisher.json`：
```json
{
  "shares_repo_path": "...",
  "shares_base_url": "...",
  "default_author": "...",
  "theme_overrides": "..." 或 null
}
```

驗證：
- 確認 repo 路徑存在 + 是 git repo
- 模擬產出 `_setup-test.html`（不 commit），確認可寫
- 不真的 push

## Push 流程

```bash
cd <shares_repo_path>
git add <slug>.html
git commit -m "Add: <title>"
git push
```

完成後：
- 顯示對外網址：`<shares_base_url>/<slug>.html`
- 提醒「1-2 分鐘後 GitHub Pages 部署完成」

## 命名規範
- 檔名：英文 kebab-case + 主題明確
- 好：`2026-05-tw-bank-viral-videos.html`
- 爛：`research.html`、`report-final-v2.html`
- **不動 index.html**（首頁邏輯使用者自管）

## CSS 變數客製化
詳見 `references/customization-guide.md`。

## GitHub Pages 第一次設定
詳見 `references/github-pages-setup.md`。

## 錯誤處理
- repo 路徑不存在 → 提示先建 GH Pages repo（連 setup guide）
- git push 失敗 → 顯示錯誤、保留 HTML 檔、不刪除
- theme_overrides 檔不存在 → 警告但繼續產出（用預設主題）
````

- [ ] **Step 2: Commit**

```bash
git add skills/publish-research-html/SKILL.md
git commit -m "feat(skill): add publish-research-html SKILL.md"
```

---

### Task 14: newsletter-template.html

**Files:**
- Create: `skills/publish-research-html/assets/newsletter-template.html`

- [ ] **Step 1: Write template HTML**

```html
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{TITLE}} — {{AUTHOR}}</title>
  <meta name="description" content="{{TLDR}}">
  <style>
    :root {
      --color-bg: #ffffff;
      --color-text: #1a1a1a;
      --color-muted: #6b7280;
      --color-accent: #2563eb;
      --color-border: #e5e7eb;
      --color-card: #f9fafb;
      --font-sans: -apple-system, BlinkMacSystemFont, "Inter", "PingFang TC", "Noto Sans TC", sans-serif;
      --max-width: 760px;
      --radius: 8px;
    }
    * { box-sizing: border-box; }
    body {
      background: var(--color-bg);
      color: var(--color-text);
      font-family: var(--font-sans);
      margin: 0;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 32px 20px 80px;
    }
    .topnav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 32px;
      font-size: 14px;
    }
    .topnav a { color: var(--color-muted); text-decoration: none; }
    .topnav a:hover { color: var(--color-accent); }
    h1 {
      font-size: 32px;
      line-height: 1.3;
      margin: 24px 0 8px;
      font-weight: 700;
    }
    .meta {
      color: var(--color-muted);
      font-size: 14px;
      margin-bottom: 24px;
    }
    .tldr {
      background: var(--color-card);
      border-left: 3px solid var(--color-accent);
      padding: 16px 20px;
      border-radius: var(--radius);
      margin: 24px 0 40px;
    }
    h2 {
      font-size: 22px;
      margin-top: 48px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
    }
    h3 { font-size: 18px; margin-top: 32px; }
    p { margin: 0 0 16px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }
    th, td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--color-border);
      vertical-align: top;
    }
    th { background: var(--color-card); font-weight: 600; }
    tr:hover td { background: var(--color-card); }
    a { color: var(--color-accent); }
    a:hover { text-decoration: underline; }
    blockquote {
      margin: 16px 0;
      padding: 8px 16px;
      border-left: 3px solid var(--color-border);
      color: var(--color-muted);
    }
    code {
      background: var(--color-card);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .sources {
      margin-top: 60px;
      font-size: 13px;
      color: var(--color-muted);
    }
    .sources ul { padding-left: 20px; }
    .sources li { margin-bottom: 6px; }
    .footer {
      margin-top: 60px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border);
      color: var(--color-muted);
      font-size: 13px;
      text-align: center;
    }
    @media (max-width: 600px) {
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      table { font-size: 13px; }
      th, td { padding: 8px; }
      .container { padding: 16px 16px 60px; }
    }
  </style>
  {{THEME_OVERRIDE_LINK}}
</head>
<body>
  <div class="container">
    <nav class="topnav">
      <a href="{{HOME_URL}}">← 首頁</a>
      <span>{{DATE}}</span>
    </nav>
    <h1>{{TITLE}}</h1>
    <p class="meta">{{AUTHOR}} · {{DATE}} · 約 {{READ_TIME}} 分鐘</p>
    <div class="tldr"><strong>TL;DR：</strong>{{TLDR}}</div>

    {{BODY}}

    <section class="sources">
      <h2>來源</h2>
      <ul>{{SOURCES}}</ul>
    </section>

    <footer class="footer">
      © {{YEAR}} {{AUTHOR}} · Generated by <a href="https://github.com/tonyace126/brand-research-toolkit">brand-research-toolkit</a>
    </footer>
  </div>
</body>
</html>
```

- [ ] **Step 2: Open in browser to visually verify**

Run:
```bash
open skills/publish-research-html/assets/newsletter-template.html
```

Expected: 看到頁面結構正常（佔位符 `{{...}}` 會直接顯示為文字，這是正常的）。在手機尺寸 (Chrome DevTools 切到 iPhone) 排版仍可讀。

- [ ] **Step 3: Commit**

```bash
git add skills/publish-research-html/assets/newsletter-template.html
git commit -m "feat(skill): add newsletter HTML template"
```

---

### Task 15: theme-vars.css (sample override)

**Files:**
- Create: `skills/publish-research-html/assets/theme-vars.css`

- [ ] **Step 1: Write sample theme override**

```css
/* Sample theme override
 * Copy this file to your GitHub Pages repo root and rename it
 * (e.g. my-brand-theme.css), then set "theme_overrides" in
 * ~/.config/research-publisher.json to its filename.
 *
 * The :root variables below override the template defaults.
 */

:root {
  /* Sugarfun example (米色暖紅) */
  --color-bg: #faf7f2;
  --color-text: #2a2218;
  --color-accent: #c8553d;
  --color-card: #f3ede2;
  --color-border: #e6dfd0;
  --color-muted: #8a7d6a;
  --font-sans: "PingFang TC", "Noto Serif TC", -apple-system, sans-serif;
}

/* Optional: change body background gradient or add subtle texture */
/* body { background: linear-gradient(...); } */
```

- [ ] **Step 2: Commit**

```bash
git add skills/publish-research-html/assets/theme-vars.css
git commit -m "feat(skill): add sample theme override CSS"
```

---

### Task 16: customization-guide.md

**Files:**
- Create: `skills/publish-research-html/references/customization-guide.md`

- [ ] **Step 1: Write customization guide**

````markdown
# HTML 範本客製化指南

## 為什麼用 CSS 變數
範本只用 8 個 CSS 變數控制視覺。要客製不需要碰範本本身，只要在你的 GitHub Pages repo 根目錄放一個 override CSS 檔。

## 可調的變數

| 變數 | 預設值 | 用途 |
|---|---|---|
| `--color-bg` | `#ffffff` | 頁面背景色 |
| `--color-text` | `#1a1a1a` | 主文字色 |
| `--color-muted` | `#6b7280` | 副資訊（meta、來源）色 |
| `--color-accent` | `#2563eb` | 強調色（連結、邊框） |
| `--color-border` | `#e5e7eb` | 分隔線、表格框線 |
| `--color-card` | `#f9fafb` | 表頭、TL;DR 卡片背景 |
| `--font-sans` | system + Inter + PingFang TC | 主字型 |
| `--max-width` | `760px` | 內容區寬度上限 |
| `--radius` | `8px` | 圓角半徑 |

## 步驟

### 1. 建立 override CSS
在你的 GitHub Pages repo 根目錄新建 `my-theme.css`（檔名隨意）：

```css
:root {
  --color-bg: #faf7f2;
  --color-accent: #c8553d;
  --font-sans: "Noto Serif TC", serif;
}
```

只寫想覆蓋的變數，其他繼承預設。

### 2. 寫入設定檔
編輯 `~/.config/research-publisher.json`：
```json
{
  ...
  "theme_overrides": "my-theme.css"
}
```

### 3. 重新產出
下次跑 publish-research-html，產出的 HTML 會自動 `<link>` 你的 CSS。

## 進階：完全自訂 layout

要改的不只是顏色字型（例如要加 hero 區塊、要改 grid layout）：

1. 把 `assets/newsletter-template.html` 拷貝出來、自己改
2. 把改好的範本路徑寫入設定檔（v1 暫不支援，v2 會加 `template_path` 欄位）
3. 或直接 fork 整個 plugin、改自己的版

## 範例

`assets/theme-vars.css` 是 Sugarfun 風格範例（米色 + 暖紅 + 思源黑體 / 思源宋體）。

## 字型建議

中文字型載入較慢，建議用 system fallback：
```css
--font-sans: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif;
```

要用網路字型（Noto Serif TC、Noto Sans TC）：在 override CSS 開頭加 `@import url(...);`。注意速度。
````

- [ ] **Step 2: Commit**

```bash
git add skills/publish-research-html/references/customization-guide.md
git commit -m "docs(skill): add HTML template customization guide"
```

---

### Task 17: github-pages-setup.md

**Files:**
- Create: `skills/publish-research-html/references/github-pages-setup.md`

- [ ] **Step 1: Write GitHub Pages setup guide**

````markdown
# GitHub Pages 第一次設定

如果你還沒有 GitHub Pages repo 可以推研究結果，這份是 step-by-step。

## 為什麼用 GitHub Pages
- 免費、永久、自訂網域可選
- 你 push 完 1-2 分鐘自動部署
- 每篇研究都有獨立 URL，可分享、可索引
- 自己的內容版權歸自己，不被平台綁架

## 步驟

### 1. 在 GitHub 建 repo
1. 登入 github.com
2. New repository
3. Repo 名稱：建議 `my-shares` 或 `notes`（會變成你網址的一部分）
4. 設成 Public
5. 勾「Add a README file」
6. Create

### 2. 啟用 GitHub Pages
1. 進 repo 的 Settings
2. 左側選單 Pages
3. Source: `Deploy from a branch`
4. Branch: `main` / Folder: `/ (root)`
5. Save

幾秒後上方會顯示你的網址，例如：
`https://tonyace126.github.io/my-shares/`

### 3. Clone 到本機
```bash
cd ~
git clone https://github.com/<你的帳號>/my-shares.git
```

### 4. 設定 git 認證（如果 push 會被擋）

#### Option A：用 Personal Access Token（推薦）
1. github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token，勾選 `repo` 權限
3. 複製 token
4. 在本機：
```bash
git config --global credential.helper store
# 第一次 push 會被問帳號密碼，密碼貼 token，之後會記住
```

#### Option B：用 SSH key
（略，標準 SSH 流程）

### 5. 跑 publish-research-html setup
回到 Claude Code，觸發 `publish-research-html`：
- repo 路徑填 `/Users/<你>/my-shares`（剛 clone 的路徑）
- 對外網址填 `https://<你的帳號>.github.io/my-shares`（不含尾斜線）

### 6. 驗證
產出第一篇 HTML 後：
1. 看本機 `~/my-shares/<slug>.html` 是否存在
2. push 後等 1-2 分鐘
3. 開 `https://<你的帳號>.github.io/my-shares/<slug>.html` 應該能看到

## 常見問題

### Q: 不想用個人帳號，想用組織帳號？
建一個組織專屬 repo，網址會變成 `<org>.github.io/<repo>`，流程一樣。

### Q: 想用自訂網域？
1. 在 repo 根加一個 `CNAME` 檔，內容寫你的網域
2. 在 DNS 設 CNAME 指向 `<帳號>.github.io`

### Q: 我只想內部分享，不要公開？
GitHub Pages 預設公開。要私人請用：
- GitHub Pages Pro（付費）
- 或改用 Netlify / Vercel 的 password protect 功能
- 或直接寄 HTML 檔給對方

### Q: index.html 要怎麼處理？
這個 plugin **不會自動更新 index.html**。建議：
- 手動維護一個 index.html 列出所有文章連結
- 或用 GitHub Pages 自動產生的目錄頁
- 或裝 Jekyll 讓 GH Pages 自動列檔
````

- [ ] **Step 2: Commit**

```bash
git add skills/publish-research-html/references/github-pages-setup.md
git commit -m "docs(skill): add GitHub Pages setup guide"
```

---

## Phase 4: Bank example output

### Task 18: examples/2026-05-tw-bank-viral-videos.html

**Files:**
- Create: `examples/2026-05-tw-bank-viral-videos.html`

This file is the **rendered output** of using `publish-research-html` on the bank research data. It serves both as a demo and a regression sample.

- [ ] **Step 1: Generate the example HTML**

Take `assets/newsletter-template.html` and substitute:
- `{{TITLE}}`: `官股 vs 民營銀行話題影片清單（2026-04-15 ~ 2026-05-15）`
- `{{AUTHOR}}`: `Tony / Sugarfun`
- `{{DATE}}`: `2026-05-15`
- `{{YEAR}}`: `2026`
- `{{READ_TIME}}`: `5`
- `{{HOME_URL}}`: `https://tonyace126.github.io/my-shares`
- `{{TLDR}}`: `KOL 主場、官方頻道靜默。台新 GOGO 改版、永豐 DAWHO 100 萬門檻負面討論最炸；國泰 CUBE 13% 是正向最熱。TikTok 是金融品牌盲區。`
- `{{THEME_OVERRIDE_LINK}}`: 空字串（範例用預設主題）
- `{{BODY}}`: 把以下章節的內容轉成 HTML（h2 + table + 段落）
- `{{SOURCES}}`: 把來源 URL 轉成 `<li><a href="...">標題</a></li>`

Body 章節（要轉成 HTML）：
1. **YouTube 高聲量影片 — 官股銀行（9 家）**：表格（節錄自我們做的研究）
2. **YouTube 高聲量影片 — 民營銀行（10 家）**：表格
3. **TikTok 高聲量影片**：段落（官股彰銀故障 + 民營全 N/A）
4. **觀察小結**：4 條跨平台 insight
5. **資料限制**：YouTube SPA / TikTok 牆兩段提醒

完整原始資料見 `skills/brand-issue-research/references/examples/bank-research-2026-05.md`，但 example HTML 應呈現「最終可分享」的格式。

- [ ] **Step 2: Open in browser to visually verify**

Run:
```bash
open examples/2026-05-tw-bank-viral-videos.html
```

Expected: 完整可讀電子報。表格在桌面寬版正常，手機尺寸縮排合理。所有外部連結可點。

- [ ] **Step 3: Commit**

```bash
git add examples/2026-05-tw-bank-viral-videos.html
git commit -m "docs: add bank research HTML example"
```

---

## Phase 5: Final polish

### Task 19: README.md final pass

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add live example link, screenshots, badges**

更新 README.md：
- 在「範例輸出」section 加 live URL（使用者推 GH Pages 後會有）
- 在頂部加 badges（version、license、Claude Code 相容）
- 加 plugin 結構樹示意（從 spec 抓 file structure）
- 加 troubleshooting section（常見錯誤）
- 加 contributing section（怎麼提 PR、新增平台手冊）
- 加 changelog section（v0.1.0 first release）

完整版 README 應有 8-10 個 section，總長約 200-300 行。

- [ ] **Step 2: Open in browser/markdown preview to verify**

Run:
```bash
open README.md  # 或在 VS Code preview
```

Expected: 排版正常、所有連結可點、表格可讀。

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: polish README with examples, troubleshooting, contributing"
```

---

### Task 20: Manual end-to-end verification

**Files:** none modified

- [ ] **Step 1: Install plugin locally**

```bash
cp -R ~/work/brand-research-toolkit ~/.claude/plugins/
# 或用 plugin install 指令（視 Claude Code 版本）
```

- [ ] **Step 2: Restart Claude Code session**

關閉 + 開新 session，確認 plugin 被載入：
```bash
ls ~/.claude/plugins/brand-research-toolkit/skills/
# 應看到 brand-issue-research、publish-research-html 兩個目錄
```

- [ ] **Step 3: Test brand-issue-research skill**

對 Claude 說：「研究永豐銀行近 7 天的 PTT + Dcard + 新聞輿情」

預期：
- Skill 被觸發（announce「Using brand-issue-research...」）
- 釐清問題（時間範圍、是否含競品）
- 並行 dispatch 至少 3 個 agents
- 回傳統一表格 + 觀察小結
- 詢問「要做成 HTML 嗎？」

- [ ] **Step 4: Test publish-research-html skill**

回答 Step 3 的問題：「好」

預期：
- 若沒有 `~/.config/research-publisher.json` → 跑 setup（5 題）
- 產出 HTML 到 my-shares repo
- 詢問是否 push
- push 完顯示對外網址

- [ ] **Step 5: Open published URL in browser**

等 1-2 分鐘 GH Pages 部署，開 URL 確認頁面正常。

- [ ] **Step 6: Commit verification notes (optional)**

如果在驗證過程發現需要改的小東西，記錄到 issues 或新 commit 修。

```bash
# 若有需要：
git commit --allow-empty -m "verify: e2e test passed for v0.1.0"
```

- [ ] **Step 7: Tag v0.1.0**

```bash
git tag v0.1.0
git log --oneline
```

確認所有 task 都有 commit，README、SKILL.md、references、assets、example 都到位。

---

## Self-review checklist

After completing all tasks:

1. **Spec coverage**：spec 第 4-5 章每個 reference 子文件都有對應 task（T5-T12 對應 brand-issue-research/references；T16-T17 對應 publish-research-html/references）✓
2. **Type consistency**：`{{TITLE}}` 在 T13、T14、T18 都用同一拼寫 ✓；CSS 變數命名在 T14、T15、T16 一致 ✓
3. **Placeholder scan**：plan 內無 TODO/TBD ✓
4. **Naming consistency**：plugin name `brand-research-toolkit` 在 T1、T2、T14 footer、T19 一致 ✓
5. **Granularity check**：每個 task 完成後都產出可獨立 commit 的有意義變更 ✓
