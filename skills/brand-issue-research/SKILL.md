---
name: brand-issue-research
description: Research brand issues, controversies, or campaigns across YouTube, PTT, Dcard, Mobile01, news sites, Threads, FB, and AI engines (ChatGPT/Perplexity/Gemini). Use when user says "research X brand discussion", "find what people say about Y", "track [brand] [topic] across platforms", "AI 怎麼回答我品牌", "盤點 X 品牌話題", "研究 X 在 PTT/YouTube 怎麼被討論", "X 議題輿情", "競品聲量比較", "AEO 監測", or wants a structured cross-platform brand sentiment / topic landscape. Dispatches parallel agents per platform, returns structured tables + observation summary.
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
| AI 引擎 | ⚠️ 部分 | 使用者手動跑 + 貼回（ChatGPT / Perplexity / Gemini） | references/platforms/ai-engines.md |

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
- AEO / AI 通路聲量 → AI 引擎（使用者手動跑 + 貼回）

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
