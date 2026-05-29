# Platform: X (Twitter)

## AI 可達性
⚠️ **牆**。X 自 2023 起關閉免登入瀏覽、鎖死公開 API、封鎖搜尋引擎索引，動態載入內容 WebFetch 抓不到。Nitter 等第三方鏡像大多已停擺。

## 為什麼走不通
- **登入牆**：未登入開 x.com / twitter.com 會被導去登入頁，WebFetch 只拿到 page shell
- **API 高牆**：免費層幾乎不可用，付費 API（Basic 起跳）對一般行銷研究不划算
- **SPA 動態載入**：推文、互動數、回覆都是 JS render，HTML 抓不到
- **Nitter 鏡像凋零**：多數實例已被 X 封鎖或關站，可用性不穩
- **Chrome MCP** 在 x.com 多半被導登入牆，navigate 拿不到 timeline

## 走得通的有限做法
1. **WebSearch** `site:twitter.com "品牌名"` 或 `site:x.com "品牌名"` — Google 偶爾索引到單篇熱門推文（命中率低、不完整）
2. **新聞轉引**：熱門推文常被新聞媒體截圖報導，改從新聞端（見 news.md）撈「X 上瘋傳…」類報導，反而抓得到
3. **直接用 X App / 網頁登入** 手動搜「品牌名」，看「熱門 / 最新」分頁
4. **第三方社群監聽**：KEYPO、Brandwatch、Sprout Social 有 X 模組

## 搜尋語法（WebSearch，命中率有限）
```
site:twitter.com "品牌名"
site:x.com "品牌名"
"品牌名" twitter 瘋傳 OR 熱議      # 從新聞轉引切入
"品牌名" X 推文 截圖              # 找媒體報導裡的推文
```

## 聲量 / 情緒
- 互動數（讚 / 轉推 / 回覆）**抓不到精確值**，一律用級距推估
- 情緒判讀請以「能讀到的少數內容 + 新聞轉引語氣」為準，明確標註樣本不完整

## 替代工具推薦
| 工具 | 涵蓋 | 特性 |
|---|---|---|
| KEYPO 大數據關鍵引擎 | X、FB、IG、Threads、PTT、Dcard、新聞 | 台灣常用，付費 |
| Brandwatch | 全球社群含 X | 國際品牌用較多 |
| Sprout Social | FB、IG、X、LinkedIn | 偏管理面 |

## 該怎麼回報
當研究主題一定要含 X 時，誠實寫：

> 「X（Twitter）因登入牆與 API 封鎖，AI 工具無法系統性抓取。建議：
> 1. 短期手動：登入 X App 搜「品牌名」看『熱門』分頁前 20 筆
> 2. 替代撈法：我可以從新聞端找『X 上瘋傳…』類轉引報導（部分可得）
> 3. 中期工具：訂閱 KEYPO / Brandwatch 抓真實互動數」

讓使用者選擇要不要走替代路徑，**不要假裝抓得到 timeline**。
