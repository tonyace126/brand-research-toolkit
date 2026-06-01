# Remotion 試玩 / 評估 POC

用 [Remotion](https://www.remotion.dev/)（React 寫程式產生影片）+ 官方 [Agent Skills](https://github.com/remotion-dev/skills) 做的概念驗證。
**獨立於 `web/` 總控主體，互不影響。**

## 這裡有什麼

| 項目 | 說明 |
|---|---|
| `src/RhodesIntro/` | 自訂 demo：羅德島總控風格開場動畫（暗色 HUD、完成度環、專案進度條、凱爾希打字機簡報），8 秒 1080p，**只用示範資料** |
| `src/HelloWorld/` | 官方 hello-world 範例（保留當參考） |
| `.claude/skills/remotion-best-practices/` | Remotion 官方 Agent Skill（29 個規則檔），讓 Claude Code 在此資料夾工作時自動遵守 Remotion 最佳實踐 |
| `.agents/skills/` | skills CLI 的正規安裝位置（`.claude/` 內是給 Claude Code 讀的副本） |

## 怎麼跑

```bash
cd remotion-poc
npm install

# 互動式預覽（Remotion Studio）
npm run dev

# 渲染影片
npx remotion render RhodesIntro out/rhodes-intro.mp4
```

### ⚠️ 在受限環境（雲端容器）渲染

Remotion 預設會自動下載 Chrome Headless Shell（`remotion.media`），若網路 allowlist 擋掉，
改用本機已有的 Chromium（例如 Playwright 的）：

```bash
npx remotion render RhodesIntro out/rhodes-intro.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

中文渲染需要系統有 CJK 字型（容器內有文泉驛正黑；本機 mac 會用 PingFang TC）。

## 評估結論（2026-06-01）

✅ **能跑**：scaffold → 裝 skills → 寫 composition → 渲染 MP4 全程通。
React 19 + TypeScript 相容（Remotion 4.0.470）。

✅ **Agent Skills 有用**：規則檔涵蓋動畫/音訊/字幕/轉場/字型等 29 主題，
最重要的防呆是「禁用 CSS animation/transition、一律用 `useCurrentFrame()` + `interpolate()`」。

⚠️ **注意**：
- 授權：個人/3 人以下公司免費（含商用）；4 人以上公司需 Company License（$100/月起）。
- `<Sequence layout="none">` 與 `premountFor` 不能同時用（型別會擋）。
- 渲染吃資源（headless Chrome + FFmpeg），量產建議用 Remotion Lambda 或專用機器。

**適合的下一步（如果要繼續）**：把總控的 Notion 資料（完成度/里程碑）餵進
parametrized composition，自動產生每週專案進度影片。

---

## 官方參考

- [Fundamentals](https://www.remotion.dev/docs/the-fundamentals)
- [License 條款](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)（部分公司需要付費授權）
