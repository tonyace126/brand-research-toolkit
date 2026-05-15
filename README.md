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
