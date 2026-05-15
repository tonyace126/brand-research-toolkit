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
