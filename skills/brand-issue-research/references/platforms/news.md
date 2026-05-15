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
