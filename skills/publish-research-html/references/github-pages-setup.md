# GitHub Pages 第一次設定

如果你還沒有 GitHub Pages repo 可以推研究結果，這份是 step-by-step。

## 為什麼用 GitHub Pages
- 免費、永久、自訂網域可選
- 你 push 完 1-2 分鐘自動部署
- 每篇研究都有獨立 URL，可分享、可索引
- 自己的內容版權歸自己，不被平台綁架

## 步驟

### 1. 在 GitHub 建 repo
1. 登入 github.com
2. New repository
3. Repo 名稱：建議 `my-shares` 或 `notes`（會變成你網址的一部分）
4. 設成 Public
5. 勾「Add a README file」
6. Create

### 2. 啟用 GitHub Pages
1. 進 repo 的 Settings
2. 左側選單 Pages
3. Source: `Deploy from a branch`
4. Branch: `main` / Folder: `/ (root)`
5. Save

幾秒後上方會顯示你的網址，例如：
`https://tonyace126.github.io/my-shares/`

### 3. Clone 到本機
```bash
cd ~
git clone https://github.com/<你的帳號>/my-shares.git
```

### 4. 設定 git 認證（如果 push 會被擋）

#### Option A：用 Personal Access Token（推薦）
1. github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token，勾選 `repo` 權限
3. 複製 token
4. 在本機：
```bash
git config --global credential.helper store
# 第一次 push 會被問帳號密碼，密碼貼 token，之後會記住
```

#### Option B：用 SSH key
（略，標準 SSH 流程）

### 5. 跑 publish-research-html setup
回到 Claude Code，觸發 `publish-research-html`：
- repo 路徑填 `/Users/<你>/my-shares`（剛 clone 的路徑）
- 對外網址填 `https://<你的帳號>.github.io/my-shares`（不含尾斜線）

### 6. 驗證
產出第一篇 HTML 後：
1. 看本機 `~/my-shares/<slug>.html` 是否存在
2. push 後等 1-2 分鐘
3. 開 `https://<你的帳號>.github.io/my-shares/<slug>.html` 應該能看到

## 常見問題

### Q: 不想用個人帳號，想用組織帳號？
建一個組織專屬 repo，網址會變成 `<org>.github.io/<repo>`，流程一樣。

### Q: 想用自訂網域？
1. 在 repo 根加一個 `CNAME` 檔，內容寫你的網域
2. 在 DNS 設 CNAME 指向 `<帳號>.github.io`

### Q: 我只想內部分享，不要公開？
GitHub Pages 預設公開。要私人請用：
- GitHub Pages Pro（付費）
- 或改用 Netlify / Vercel 的 password protect 功能
- 或直接寄 HTML 檔給對方

### Q: index.html 要怎麼處理？
這個 plugin **不會自動更新 index.html**。建議：
- 手動維護一個 index.html 列出所有文章連結
- 或用 GitHub Pages 自動產生的目錄頁
- 或裝 Jekyll 讓 GH Pages 自動列檔
