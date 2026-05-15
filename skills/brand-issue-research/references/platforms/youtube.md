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
