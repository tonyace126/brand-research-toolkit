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
