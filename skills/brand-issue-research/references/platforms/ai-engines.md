# Platform: AI Engines（ChatGPT / Gemini / Perplexity / Claude）

## AI 可達性
⚠️ **部分可達**。這不是「搜尋公開語料」的平台，而是觀察「AI 怎麼回答關於品牌的問題」。一次性研究可走得通，但有結構性限制。

## 為什麼要查 AI 引擎

愈來愈多使用者用 ChatGPT、Perplexity、Gemini 取代 Google 搜尋。品牌在 AI 回答中**是否被提及、排第幾、附帶什麼情緒**，正變成新的 SEO（AEO，Answer Engine Optimization）戰場。

- 「最推薦的台灣數位帳戶？」→ AI 答案有沒有你？
- 「中信銀 vs 國泰世華 哪個適合年輕人？」→ AI 怎麼比較？
- 「品牌名 評價」→ AI 整合的口碑來源是什麼？

這個平台處理的是「AI 通路聲量」，與 PTT/Dcard/YouTube 的「人類社群聲量」互補。

## 主要工具

| 工具 | 用途 | 限制 |
|---|---|---|
| ChatGPT 網頁版 | 模擬一般使用者體驗 | 自動化違反 ToS（見下方警告） |
| Perplexity | answer engine，會列來源 | 較易結構化解析 |
| Gemini | Google 生態的 AI 答案 | 與 Google 搜尋結果有重疊 |
| OpenAI / Anthropic / Google API | 程式化查詢 | **與 consumer UI 不完全等價**，UI 常多一層 RAG/搜尋 |

## 走得通的做法（一次性研究）

### 做法 A：使用者手動 query + 貼回對話（推薦）
最誠實也最準的方式。流程：

1. Claude 產出一組標準化 prompt（見下方範本）
2. 使用者打開 ChatGPT/Perplexity，逐一問
3. 把回答貼回 Claude，由 Claude 抽取：品牌提及、排名位置、情緒、引用來源
4. 整合進跨平台表格

### 做法 B：Claude 用自身知識模擬
Claude 自己回答「最推薦的 OOO」類問題，**僅供參考**。要明確告訴使用者：「這是 Claude 的觀點，不代表 ChatGPT/Perplexity 的回答。」

### 做法 C：Perplexity 結果 WebFetch
Perplexity 分享連結（如 `perplexity.ai/search/xxx`）有時可 WebFetch 拿到答案文字 + 引用來源。命中率中等。

## 標準化 Prompt 範本

要讓「AI 引擎聲量」可比較、可追蹤，prompt 必須固定。建議使用者跑這 4 類：

### 1. 無品牌推薦類（看誰被自然提及）
- 「推薦台灣 [類別]，列前 5 名並簡述優缺」
- 「我想找 [使用情境]，有什麼選擇？」
- 「[類別] 哪個適合 [TA]？」

### 2. 指名比較類（看 AI 怎麼描述你 vs 競品）
- 「[品牌 A] vs [品牌 B]，差在哪？」
- 「[品牌 A]、[品牌 B]、[品牌 C] 各自的優勢？」

### 3. 指名口碑類（看 AI 整合的情緒）
- 「[品牌名] 評價如何？」
- 「[品牌名] 有什麼負評？」
- 「[品牌名] 值不值得用？」

### 4. 議題關聯類（看品牌在熱門議題中的曝光）
- 「[時事議題] 哪些品牌參與？」
- 「[趨勢關鍵字] 的代表性品牌？」

## 回報結構

抽取每個回答時，建議統一欄位：

| 欄位 | 說明 |
|---|---|
| AI 引擎 | ChatGPT / Perplexity / Gemini / Claude |
| 模型版本 | GPT-4o、Sonnet 4.5 等（若已知） |
| Prompt 類型 | 無品牌推薦 / 指名比較 / 指名口碑 / 議題關聯 |
| Prompt 原文 | 完整貼回，方便日後複跑 |
| 品牌是否提及 | ✅ / ❌ |
| 排名位置 | 1 / 2 / 3 / 未排名 |
| 情緒 | 正 / 中 / 負 |
| 引用來源 | Perplexity 有列；ChatGPT browse 模式有列 |
| 查詢日期 | YYYY-MM-DD（AI 回答會變，要記） |

## 限制與陷阱

- **AI 回答有隨機性**：同一 prompt 兩次跑可能答案不同。聲稱「ChatGPT 把我排第 3」要附上對話截圖或連結。
- **Consumer UI ≠ API**：ChatGPT 網頁版多走一層搜尋（特別是 GPT-4o with browsing），API 純模型答案會不同。報告要標清楚。
- **AI 回答會隨時間漂移**：模型更新、訓練資料更新、搜尋結果更新都會改變答案。一次性研究只是「某日切片」。
- **語言差異**：「best Taiwanese bank」與「最推薦的台灣銀行」答案不同。中文問題請用中文 prompt。
- **個人化干擾**：登入帳號的 ChatGPT 會記住偏好，影響答案。建議用無痕視窗或乾淨帳號跑。

## 自動化警告

直接用 Playwright / Chrome MCP 跑 ChatGPT 網頁可能違反 OpenAI ToS。要做就：
- 用 OpenAI API（合法，但回答與 UI 不同）
- 或讓使用者手動跑（最安全）
- 不要用主力帳號做自動化

## 想做持續監測？

這份 skill 走「一次性研究」路線，適合單次盤點。如果需要**每日自動化追蹤** AI 引擎中的品牌提及趨勢，請考慮另一個開源專案：

→ **[AEO Radar](https://github.com/hellowalt/aeo-radar)**（MIT 授權）

它提供每日爬蟲、SQLite 累積歷史、Next.js 儀表板。注意它對 ChatGPT 用網頁自動化，使用前請讀清楚其 README 的 ToS 警告。

兩者定位互補：
- **本 skill** = 對話觸發、一次性、產報告 / 電子報
- **AEO Radar** = 排程跑、長期追蹤、看趨勢圖

## 軟化策略

AI 引擎對「幫我做 SEO 操作」「怎麼讓我品牌排第一」類請求容易拒答或給通則。改寫成中性提問：

- 「分析 [品牌] 在 [類別] 中的定位」（中性）
- 「[品牌] 跟競品的差異化」（中性）
- 不要：「幫我把 [品牌] 推到第一名」（操作意圖明顯）

研究目的是**觀察 AI 現況**，不是**操作 AI**。前者誠實，後者違規。
