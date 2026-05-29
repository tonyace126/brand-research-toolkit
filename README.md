# brand-research-toolkit

> 品牌議題研究懶人包 — 給喜歡當伸手牌的你

[![version](https://img.shields.io/badge/version-0.1.0-c8553d)](./plugin.json)
[![license](https://img.shields.io/badge/license-MIT-555)](./LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-1f6feb)](https://docs.claude.com/claude-code)

## What it is

跨平台品牌議題研究的 Claude Code plugin。一句話啟動、並行查 7 個平台、整理表格、發布 HTML 電子報。

實際使用情境：你是行銷／企劃／PM／創意人員，想知道某個品牌或議題在 PTT、Dcard、YouTube、新聞、Mobile01 上的最新討論長什麼樣，又懶得自己一個一個搜，就丟一句話給 Claude，等它端上桌。

設計上有三個堅持：
- **誠實**：拿不到的平台（Threads / FB）就標 ⚠️，不假裝拿得到
- **可驗證**：每筆都附原始 URL，聲量無法精確驗證時用級距而非假數字
- **能沉澱**：研究結果可以一鍵變 HTML，丟到自己的 GitHub Pages 累積成個人知識庫

## Skills 包含

| Skill | 做什麼 |
|---|---|
| `brand-issue-research` | 跨平台研究品牌話題（YouTube、PTT、Dcard、Mobile01、新聞、Threads、FB） |
| `publish-research-html` | 把研究結果做成乾淨 HTML 電子報，可一鍵推到 GitHub Pages |

兩個 skill 是搭配的：先 research、再 publish。當然 publish 也可獨立使用，把任何對話內容沉澱成可分享網址。

## Plugin structure

```
brand-research-toolkit/
├── plugin.json                 # plugin manifest
├── LICENSE                     # MIT
├── README.md                   # 你正在讀的這份
├── examples/                   # 真實跑過的輸出範例
│   └── 2026-05-tw-bank-viral-videos.html
└── skills/
    ├── brand-issue-research/
    │   ├── SKILL.md
    │   ├── assets/
    │   │   └── output-schema.json
    │   └── references/
    │       ├── examples/
    │       │   └── bank-research-2026-05.md
    │       ├── platforms/
    │       │   ├── youtube.md
    │       │   ├── ptt.md
    │       │   ├── dcard.md
    │       │   ├── mobile01.md
    │       │   ├── news.md
    │       │   └── threads-fb.md
    │       └── prompts/
    │           └── parallel-agents.md
    └── publish-research-html/
        ├── SKILL.md
        ├── assets/
        │   ├── newsletter-template.html
        │   └── theme-vars.css
        └── references/
            ├── customization-guide.md
            └── github-pages-setup.md
```

## 安裝

需求：
- Claude Code（或任何讀 `~/.claude/plugins/` 的 Claude harness）
- Git CLI（要用 publish-research-html 推到 GitHub Pages 才需要）
- 可選：自己的 GitHub Pages repo（只用 research、不要 publish 的話可跳過）

```bash
# 方式 1：拷貝到 Claude Code plugin 目錄
cp -R brand-research-toolkit ~/.claude/plugins/

# 方式 2：用 Claude Code plugin install 指令
claude plugin install path/to/brand-research-toolkit
```

裝完打開 Claude Code，新對話直接用就行，不需 reload。確認安裝成功的方法：對 Claude 說「幫我盤點 OOO 品牌」，看它有沒有自動觸發 `brand-issue-research`。

## 使用範例

對 Claude 說：

- 「幫我研究國泰世華近 30 天的話題在哪些平台延燒」
- 「盤點台灣前 10 大民營銀行的 YouTube 聲量」
- 「研究 X 品牌在 PTT/Dcard 怎麼被討論」
- 「OOO 品牌最近的危機事件，幫我跨平台梳理時間軸」

研究完成後（會自動跑表格 + 觀察小結）：

- 「做成 HTML 電子報」 → 自動套範本、推到你的 GitHub Pages
- 「再加一段競品比較」 → 補資料、重產 HTML

skill 觸發後會：
1. 先問你 3-4 題澄清研究範圍（品牌、時間、是否含競品、產出形式）
2. 並行 dispatch 多個 agent 查不同平台（同訊息送出，不會慢慢一個一個跑）
3. 整合成統一表格 + 3-5 條跨平台 insight
4. 主動問你「要不要做成 HTML 電子報？」

## 第一次設定 publish-research-html

第一次觸發 `publish-research-html` 時會問你 5 題，答完寫進 `~/.config/research-publisher.json`，下次直接用。

```
1. GitHub Pages repo 本機絕對路徑？
   例：/Users/yourname/my-shares
2. 對外網址（不含尾斜線）？
   例：https://yourname.github.io/my-shares
3. 作者署名？
   例：Tony Wang
4. 要用自訂主題嗎？(y/n，n = 通用範本)
5. （若 4 選 y）自訂主題 CSS 檔名（放在 repo 根目錄）？
   例：my-theme.css
```

還沒有 GitHub Pages repo 的話，先看 [`./skills/publish-research-html/references/github-pages-setup.md`](./skills/publish-research-html/references/github-pages-setup.md)。

## 客製化

HTML 範本用 CSS 變數設計（顏色、字型、圓角、間距全部抽出來），要改成自己品牌的視覺只需要在你的 GitHub Pages repo 放一個 override CSS，不用動 plugin 本體。

完整變數列表 + 5 個示範主題（暖色、極簡黑、雜誌風、暗色、學術藍）：

→ [`./skills/publish-research-html/references/customization-guide.md`](./skills/publish-research-html/references/customization-guide.md)

## 範例輸出

[`./examples/2026-05-tw-bank-viral-videos.html`](./examples/2026-05-tw-bank-viral-videos.html)

實際跑過一次的銀行研究 — 9 家官股 + 10 家民營銀行近 30 天 YouTube 話題影片清單，含表格、聲量級距、跨平台觀察小結。可以在瀏覽器直接打開看最終樣式。

對應的研究過程紀錄：[`./skills/brand-issue-research/references/examples/bank-research-2026-05.md`](./skills/brand-issue-research/references/examples/bank-research-2026-05.md)（含真實 prompt、4 個並行 agent 分派文字、整合表格）。

## Troubleshooting

**1. 第一次跑 `publish-research-html` 沒被問 5 題就直接跳錯**
通常是 `~/.config/research-publisher.json` 已存在但內容不完整。把它刪掉重跑：
```bash
rm ~/.config/research-publisher.json
```

**2. push 完了但對外網址打開是 404**
GitHub Pages 部署有 1-2 分鐘延遲，先等等。超過 5 分鐘還 404 就去 repo Settings → Pages 確認 source branch 設正確（通常是 `main` / root）。

**3. 改了 override CSS 但網頁顏色沒變**
（a）確認 CSS 檔有 commit + push（GitHub Pages 不會 serve 沒推上去的檔）。
（b）瀏覽器 hard reload（Cmd+Shift+R），預設 cache 約 10 分鐘。
（c）打開 DevTools 看 `<link>` 是否載到，404 的話檢查 `research-publisher.json` 裡 `theme_overrides` 檔名拼字。

**4. Threads / FB 的資料怎麼都查不到**
這兩個平台被反爬牆住，AI 真的拿不到。skill 已誠實標 ⚠️，建議改用 Threads App 手動翻、或接 KEYPO / OpView 等社群監聽工具。詳見 [`./skills/brand-issue-research/references/platforms/threads-fb.md`](./skills/brand-issue-research/references/platforms/threads-fb.md)。

**5. 研究結果有可疑的 URL（404 / 對不上內容）**
回報給 Claude「URL X 對不上內容請重查」。skill 規則明訂禁止編造 URL，但偶爾還是會漏，遇到直接 challenge，不用客氣。

**6. 想換到別人的 GitHub Pages repo**
直接編輯 `~/.config/research-publisher.json`，改 `shares_repo_path` / `shares_base_url` 即可，不用重跑 setup。

## Contributing

想加新平台（例如 Reddit、X、小紅書、抖音）？流程：

1. 在 `skills/brand-issue-research/references/platforms/` 新增 `<平台>.md`，內容結構參考既有檔（YouTube / PTT / Dcard 都是好範本）：
   - 該平台的 AI 友善度（✅ 高 / ⚠️ 牆 / ❌ 不可達）
   - 主要工具（WebSearch / WebFetch / Chrome MCP / 第三方）
   - 推薦的搜尋語法 / site: 限定
   - 已知限制（rate limit、JS render、登入牆）
2. 更新 `skills/brand-issue-research/SKILL.md` 的「適用平台」表格新增一列。
3. 更新 `skills/brand-issue-research/references/prompts/parallel-agents.md`，補一段該平台的 agent prompt 範本。
4. 跑一次實戰 → 確認真的能拿到資料 → 把跑過的範例丟到 `references/examples/`。
5. PR 描述附上至少 1 次實際輸出截圖或檔案。

不要為了「看起來覆蓋面廣」加平台，加了拿不到資料反而讓 skill 變不可信。

## Changelog

### v0.1.0 — 2026-05-15（first release）

- `brand-issue-research` skill：跨 7 平台（YouTube、PTT、Dcard、Mobile01、新聞、Threads、FB）並行 dispatch agent，整合表格 + 觀察小結
- `publish-research-html` skill：HTML 電子報範本（CSS 變數客製化），5 題 setup 寫入 `~/.config/research-publisher.json`，自動 push 到 GitHub Pages
- 範例輸出：`examples/2026-05-tw-bank-viral-videos.html`（19 家銀行 YouTube 話題盤點）
- 5 個示範主題（暖色 / 極簡黑 / 雜誌 / 暗色 / 學術藍）
- 完整 platform reference docs（每個平台的工具、語法、已知限制）
- 嚴格規則：禁止編造 URL、禁止編造數字、找不到就誠實標註
- 統一輸出 schema：`output-schema.json` 定義表格欄位（平台 / 標題 / 來源 / 日期 / 聲量 / 情緒 / 分類 / URL）

### Roadmap（未定）

- Reddit / X 平台 reference（待測 AI 真實可達性）
- 多語系研究範本（英、日、東南亞）
- 研究結果直出 PDF（給不愛點連結的客戶）
- 增量更新模式（同主題每週重跑、自動 diff 新增話題）

## License

MIT © 2026 Tony Wang — 詳見 [LICENSE](./LICENSE)。

可商用、可改、可分發，附上 LICENSE 即可。歡迎 fork 改成自己版本（例：`brand-research-toolkit-jp` 換成日本平台 reference）。

---

_Repo: <https://github.com/tonyace126/brand-research-toolkit>_
