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
