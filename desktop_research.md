# 桌面研究報告：個人金融投資組合管理 Dashboard

> 研究日期：2026-04-17
> 項目：Investment Portfolio Dashboard
> 研究範圍：Skills 生態、GitHub 開源專案、競品分析、數據同步與隱私、MCP 整合

---

## 目錄

1. [可用 Skills 搜索結果](#1-可用-skills-搜索結果)
2. [GitHub 開源專案調研](#2-github-開源專案調研)
3. [M1 Finance 深度分析](#3-m1-finance-深度分析)
4. [Monarch Money 深度分析](#4-monarch-money-深度分析)
5. [其他競品詳細分析](#5-其他競品詳細分析)
6. [競品功能對比矩陣](#6-競品功能對比矩陣)
7. [數據同步方案研究](#7-數據同步方案研究)
8. [數據庫隱私與安全](#8-數據庫隱私與安全)
9. [MCP (Model Context Protocol) 研究](#9-mcp-model-context-protocol-研究)
10. [Notion MVP 可行性分析（歷史參考 — 已跳過）](#10-notion-mvp-可行性分析歷史參考--已決定跳過)
11. [設計啟示與建議](#11-設計啟示與建議)

---

## 1. 可用 Skills 搜索結果

### 1.1 金融/投資組合相關 Skills

通過 `npx skills find` 搜索 "financial dashboard portfolio" 得到以下結果：

| Skill | 安裝數 | 安裝命令 | 說明 |
|-------|--------|---------|------|
| tracking-crypto-portfolio | 50 | `npx skills add jeremylongshore/claude-code-plugins-plus-skills@tracking-crypto-portfolio -g -y` | 加密貨幣投資組合追蹤 |
| dashboard | 24 | `npx skills add phrazzld/claude-config@dashboard -g -y` | Dashboard 通用技能 |
| blofin-portfolio-analyst | 19 | `npx skills add blofin/blofin-skills-hub@blofin-portfolio-analyst -g -y` | BloFin 投資組合分析 |
| agency-dashboard | 17 | `npx skills add indranilbanerjee/digital-marketing-pro@agency-dashboard -g -y` | 代理商 Dashboard |
| portfolio | 16 | `npx skills add alsk1992/cloddsbot@portfolio -g -y` | 投資組合通用 |
| j-portfolio-monitor | 9 | `npx skills add skills.volces.com@j-portfolio-monitor -g -y` | 投資組合監控 |

**評估**：安裝量均較低 (<100)，來源信譽不高，不建議直接使用。可參考其思路但不依賴。

> ⚠️ **安全警告**：安裝量 < 100 的 Skills 尚未經過廣泛社區審查，可能存在代碼品質或安全問題。如需使用，請先審查其源代碼。

### 1.2 前端 UI/Dashboard Skills

搜索 "react nextjs dashboard charts"：

| Skill | 安裝數 | 安裝命令 | 說明 |
|-------|--------|---------|------|
| **data-visualizer** | **488** | `npx skills add daffy0208/ai-dev-standards@data-visualizer -g -y` | 數據可視化，適用於圖表開發 |
| tremor-design-system | 72 | `npx skills add dodatech/approved-skills@tremor-design-system -g -y` | Tremor Dashboard UI 設計系統 |
| syncfusion-react-charts | 67 | `npx skills add syncfusion/react-ui-components-skills@syncfusion-react-charts -g -y` | Syncfusion React 圖表組件 |
| dashboard-builder | 54 | `npx skills add qwenlm/qwen-code-examples@dashboard-builder -g -y` | Dashboard 構建技能 |

### 1.3 Tailwind + shadcn/ui Skills

搜索 "tailwind shadcn ui design"：

| Skill | 安裝數 | 安裝命令 | 說明 |
|-------|--------|---------|------|
| **tailwind-v4-shadcn** | **2,700** | `npx skills add jezweb/claude-skills@tailwind-v4-shadcn -g -y` | ⭐ **推薦** — Tailwind v4 + shadcn/ui 最佳實踐 |
| shadcn-tailwind | 62 | `npx skills add tenequm/claude-plugins@shadcn-tailwind -g -y` | shadcn + Tailwind 整合 |
| tailwind-theme-builder | 11 | `npx skills add xingyu4j/skills@tailwind-theme-builder -g -y` | Tailwind 主題構建器 |

### 1.4 Notion 相關 Skills

搜索 "notion api integration"：

| Skill | 安裝數 | 安裝命令 | 說明 |
|-------|--------|---------|------|
| notion-api | 28 | `npx skills add vamseeachanta/workspace-hub@notion-api -g -y` | Notion API 整合 |

### 1.5 推薦安裝的 Skills

基於安裝量、來源信譽和項目需求，**推薦以下 4 個 Skills**：

```bash
# 1. UI 開發首選 (2.7K installs, 來源可靠)
npx skills add jezweb/claude-skills@tailwind-v4-shadcn -g -y

# 2. 數據可視化 (488 installs)
npx skills add daffy0208/ai-dev-standards@data-visualizer -g -y

# 3. Tremor Dashboard UI (72 installs)
npx skills add dodatech/approved-skills@tremor-design-system -g -y

# 4. Notion MVP 整合 (28 installs)
npx skills add vamseeachanta/workspace-hub@notion-api -g -y
```

### 1.6 已安裝的本地 Skills

在 `~/.agents/skills/` 和 `~/.copilot/skills/` 目錄下已有以下相關 Skills：

| Skill | 路徑 | 適用場景 |
|-------|------|---------|
| frontend-design | `~/.agents/skills/frontend-design/` | 前端界面設計，生產級 UI |
| shadcn | `~/.agents/skills/shadcn/` | shadcn 組件管理、搜索、調試 |
| vercel-react-best-practices | `~/.agents/skills/vercel-react-best-practices/` | React/Next.js 性能優化 |
| web-design-guidelines | `~/.agents/skills/web-design-guidelines/` | Web UI 審查和無障礙檢查 |
| gstack | `~/.copilot/skills/gstack/` | QA 測試、設計審查、代碼審查 |

---

## 2. GitHub 開源專案調研

### 2.1 Tier 1：主要專案 (>5,000 Stars)

#### 2.1.1 ghostfolio/ghostfolio — ⭐ 8,144 Stars
- **GitHub**: https://github.com/ghostfolio/ghostfolio
- **描述**: 開源財富管理軟體，**與本專案最相關**
- **技術棧**: Angular, NestJS, Prisma, Nx monorepo, TypeScript, PostgreSQL
- **關鍵功能**:
  - 多資產投資組合追蹤（股票、ETF、加密貨幣）
  - 投資績效分析（TWR、MWR）
  - 股息追蹤
  - 資產配置視圖
  - 基準對比
  - 市場數據整合
  - 多幣別支援
  - Self-hosted (Docker)
- **活躍度**: 240 open issues, 1,080 forks，非常活躍
- **參考價值**: ⭐⭐⭐⭐⭐ — 架構設計、數據模型、績效計算引擎均值得參考

#### 2.1.2 maybe-finance/maybe — ⭐ 54,079 Stars
- **GitHub**: https://github.com/maybe-finance/maybe
- **描述**: "The personal finance app for everyone"，全功能個人財務應用
- **技術棧**: Ruby on Rails, Hotwire/Turbo, Stimulus.js, PostgreSQL
- **關鍵功能**:
  - 多帳戶追蹤（銀行、投資、房產）
  - 投資組合視圖
  - 淨值 Dashboard
  - 交易管理
  - 預算功能
- **狀態**: 曾於 2024 年初歸檔，但已於 **2024 年中重新啟動並積極維護**（確認於 GitHub 倉庫狀態），代碼仍是極佳參考
- **參考價值**: ⭐⭐⭐⭐⭐ — 產品設計思路、UI/UX、數據模型

#### 2.1.3 firefly-iii/firefly-iii — ⭐ 22,987 Stars
- **GitHub**: https://github.com/firefly-iii/firefly-iii
- **描述**: 全功能個人財務管理器
- **技術棧**: PHP, Laravel, Docker, MySQL/PostgreSQL
- **關鍵功能**:
  - 多幣別支援
  - 預算管理
  - 週期性交易
  - 報表/圖表
  - Docker 自託管
  - REST API
- **狀態**: 積極維護
- **參考價值**: ⭐⭐⭐⭐ — 自託管架構、多幣別設計、API 設計

#### 2.1.4 ellite/Wallos — ⭐ 7,698 Stars
- **GitHub**: https://github.com/ellite/Wallos
- **描述**: 自託管訂閱追蹤器
- **技術棧**: PHP, Docker
- **關鍵功能**: 訂閱追蹤、預算可視化、經常性支出管理
- **參考價值**: ⭐⭐⭐ — 自託管 UX、訂閱管理概念

### 2.2 Tier 2：實用參考 (100–500 Stars)

#### 2.2.1 hisabi-app/hisabi — ⭐ 444 Stars
- **GitHub**: https://github.com/hisabi-app/hisabi
- **技術棧**: PHP, Laravel, GraphQL, MySQL
- **亮點**: SMS 交易解析、GPT 分類、Dashboard 分析
- **參考價值**: ⭐⭐⭐ — AI 分類功能

#### 2.2.2 Xtrendence/Cryptofolio — ⭐ 368 Stars
- **GitHub**: https://github.com/Xtrendence/Cryptofolio
- **技術棧**: React, React Native, Electron, PHP, Docker
- **亮點**: 跨平台（Web/Mobile/Desktop）、即時價格、REST API
- **參考價值**: ⭐⭐⭐ — 跨平台架構、加密貨幣追蹤

#### 2.2.3 belaczek/hodlwatch — ⭐ 126 Stars
- **GitHub**: https://github.com/belaczek/hodlwatch
- **技術棧**: React, Redux, CCXT library
- **亮點**: 多交易所支援 (CCXT)、自動追蹤
- **參考價值**: ⭐⭐⭐ — CCXT 整合模式

#### 2.2.4 williamlmao/plaid-to-gsheets — ⭐ 103 Stars
- **GitHub**: https://github.com/williamlmao/plaid-to-gsheets
- **技術棧**: JavaScript, Plaid API, Google Sheets, Data Studio
- **亮點**: 銀行 API → Google Sheets 自動化管道
- **參考價值**: ⭐⭐⭐ — Plaid 整合示例、MVP 思路（用 Sheets 做 Dashboard）

### 2.3 Tier 3：特定領域 (50–100 Stars)

#### 2.3.1 MadeInPierre/finalynx — ⭐ 73 Stars
- **GitHub**: https://github.com/MadeInPierre/finalynx
- **技術棧**: Python
- **亮點**: CLI + Web、投資組合組織、未來模擬、目標追蹤
- **參考價值**: ⭐⭐ — Python 分析邏輯

#### 2.3.2 aj112358/Finance_Analysis_PowerBI — ⭐ 60 Stars
- **GitHub**: https://github.com/aj112358/Finance_Analysis_PowerBI
- **技術棧**: Python, Power BI
- **亮點**: 互動式 Dashboard 設計模式
- **參考價值**: ⭐⭐ — 可視化設計參考

#### 2.3.3 Poyu123/smart-fund-tracker — ⭐ 54 Stars
- **GitHub**: https://github.com/Poyu123/smart-fund-tracker
- **技術棧**: Python, FastAPI, ECharts, Tailwind CSS
- **亮點**: 即時淨值估算、股票穿透分析、3 級快取
- **參考價值**: ⭐⭐ — FastAPI 後端、ECharts 使用

#### 2.3.4 anychart-solutions/investment-portfolio-dashboard — ⭐ 51 Stars
- **GitHub**: https://github.com/anychart-solutions/investment-portfolio-dashboard
- **技術棧**: HTML, JavaScript, AnyChart
- **亮點**: 專門的投資組合 Dashboard，圖表豐富
- **參考價值**: ⭐⭐⭐ — 純前端 Dashboard 參考

#### 2.3.5 cameronking4/shadcn-openai-plaid-dashboard — ⭐ 50 Stars
- **GitHub**: https://github.com/cameronking4/shadcn-openai-plaid-dashboard
- **技術棧**: **Next.js, TypeScript, Prisma, shadcn/ui, Redux, Plaid API, OpenAI**
- **亮點**: 銀行/投資帳戶 Plaid 連接、AI 交易分析、CSV 導出、GPT 整合
- **參考價值**: ⭐⭐⭐⭐⭐ — **技術棧最接近本專案**，現代前端 + Plaid + AI 整合

### 2.4 按用途分類的最佳參考

| 用途 | 最佳參考專案 |
|------|-------------|
| 完整投資組合追蹤 | **ghostfolio** (Angular/NestJS) |
| 全功能個人財務 | **maybe** (Rails), **firefly-iii** (PHP) |
| 現代 React/Next.js 技術棧 | **shadcn-openai-plaid-dashboard** |
| 加密貨幣投資組合 | **Cryptofolio**, **hodlwatch** |
| Python 分析引擎 | **finalynx**, **smart-fund-tracker** |
| 銀行 API (Plaid) 整合 | **plaid-to-gsheets**, **shadcn-openai-plaid-dashboard** |
| 數據模型設計 | **ghostfolio**, **maybe** |
| Self-hosted 架構 | **ghostfolio**, **firefly-iii** |

---

## 3. M1 Finance 深度分析

**官網**: https://m1.com/

### 3.1 產品定位
- **自動化投資平台**，面向長期財富建設
- 核心概念是 **"Pie"（派）**— 用圓餅圖隱喻投資組合配置
- Tagline: "Sophisticated wealth building, simplified."

### 3.2 核心 UI 創新：Pie 概念

- 投資組合被視覺化為 **圓形派圖**，每個持倉是一個 "Slice"（切片）
- 用戶設定每個切片的 **目標配置百分比**
- Pie 可以包含個股、ETF，甚至 **嵌套子 Pie**（Pie 中有 Pie）
- **Pie 既是展示工具，也是控制機制** — 在同一個 UI 中查看和編輯配置
- 投資頁面有 7 步引導流程解釋 Pie 模型

### 3.3 自動化投資
- **Auto-invest**：設定金額和頻率，M1 自動執行交易以匹配目標 Pie 配置
- **動態再平衡**：新資金自動流向配置不足的切片
- 排程交易窗口（非即時）— 刻意減少情緒化/擇時壓力
- "Set-and-forget" 理念在 UI 文案和流程中體現

### 3.4 投資組合與績效
- **績效基準對比**：將投資組合歷史回報與股票、ETF 或自定義 Pie 對比
- 股息追蹤，3 種再投資選項：
  - 再投資到產生股息的證券 (DRIP)
  - 再投資到整個 Pie
  - 轉入高收益現金帳戶
- 投資組合價值和配置作為首頁核心 UI 元素

### 3.5 帳戶類型
- 標籤/卡片佈局展示帳戶類型：
  - Individual, Joint, Custodial
  - Traditional IRA, Roth IRA, SEP IRA
  - Crypto, Trust
- 經紀 vs 退休 vs 其他帳戶清晰分段

### 3.6 產品生態（Hub 佈局）
- 首頁三大支柱卡片佈局：
  - **Invest** — Pie 投資組合管理
  - **Earn** — 高收益現金帳戶 (3.10% APY)
  - **Borrow** — 保證金貸款 (5.65%)
- 每個支柱有獨立卡片，含插圖、簡介、CTA

### 3.7 設計決策
- **深藍/海軍色調**，搭配強調色 — 高端金融科技美學
- 每個功能有自定義 SVG 插圖
- 大型英雄區域，設備模型展示（筆電截圖展示 Pie UI）
- 社會認證條：媒體 Logo（Investopedia, Forbes, NerdWallet）
- 數據條：1M+ 用戶、$12B+ 客戶資產、4.7 App Store 評分
- FAQ 手風琴模式
- 移動優先設計，響應式 Web

### 3.8 可借鑑要素
1. **Pie 概念** — 用圓餅圖作為資產配置的同時展示和控制工具
2. **嵌套 Pie** — 支持多層級資產組織
3. **目標配置 + 自動再平衡** — 視覺化當前 vs 目標偏差
4. **深色金融美學** — 傳達專業感和信任感
5. **三支柱產品架構** — 投資/儲蓄/借貸分區清晰

---

## 4. Monarch Money 深度分析

**官網**: https://www.monarchmoney.com/

### 4.1 產品定位
- **全方位個人財務管理** App（Mint 的繼任者）
- 專注於預算、淨值追蹤和財務清晰度 — 非主動交易
- 定位為 "your home base for money clarity"

### 4.2 Dashboard
- **可定制 Widget 化 Dashboard** — 用戶拖放 Widget（淨值、最近交易、投資表現等）
- "Monthly review" 滑動卡片，快速瀏覽現金流和支出
- 簡潔、極簡設計，重視可讀性而非數據密度

### 4.3 淨值與帳戶聚合
- 連接 **13,000+ 金融機構**，通過多個數據提供商（Plaid 等）
- 聚合：銀行帳戶、信用卡、貸款、房地產（Zillow Zestimates）、投資
- **淨值隨時間變化的圖表**，可按資產、負債或合併視圖篩選

### 4.4 投資追蹤
- 顯示多元投資組合：個股、共同基金、401(k)、ETF、加密貨幣
- **Top movers** — 突出最大漲跌幅
- **資產配置視圖** — 評估和調整風險概況
- 投資表現作為 Dashboard Widget

### 4.5 報表與可視化
- 可定制圖表：支出分類、收入趨勢、淨值走勢
- **Sankey 圖**（用戶最愛）— 顯示資金流向
- 時間範圍篩選 — 任意報表可放大/縮小時間窗口
- 分類級別下鑽

### 4.6 交易管理
- 跨所有帳戶的統一交易列表，支持搜索
- **AI 自動分類**
- 滑動快速審查模式
- "Mark as reviewed" 工作流

### 4.7 帳單與訂閱
- 自動檢測週期性費用
- **日曆視圖或列表視圖**顯示
- 即將到期的付款提醒

### 4.8 目標與規劃
- 目標創建：目標金額、每月貢獻、自定義圖片
- 將特定帳戶分配給目標
- 視覺化儲蓄進度追蹤

### 4.9 設計決策
- 跨平台：Web、iOS、Android — 始終同步
- **協作優先**：配偶/顧問共享，無額外費用
- 簡潔排版，慷慨留白
- 柔和色調，內容優先設計
- 定價：$8.33/月（年付）

### 4.10 可借鑑要素
1. **Widget 化可定制 Dashboard** — 讓用戶安排最重要的內容
2. **Sankey 資金流圖** — 可視化資金流動
3. **AI 自動分類** — 減少手動工作
4. **淨值時間軸** — 追蹤增長歷程
5. **清爽白底設計** — 高可讀性
6. **滑動審查交易** — 高效的交互模式

---

## 5. 其他競品詳細分析

### 5.1 Empower（前 Personal Capital）
**官網**: https://www.empower.com/

| 維度 | 詳情 |
|------|------|
| **核心價值** | 免費金融 Dashboard + 付費財富管理顧問。免費工具引流，付費管理資產 |
| **Dashboard 功能** | 淨值追蹤、退休規劃器（模擬）、投資檢查工具（分析配置 vs 目標）、**費用分析器**（揭示隱藏基金費用）、現金流追蹤、儲蓄規劃 |
| **帳戶聚合** | 通過 Plaid/Yodlee 聚合銀行、券商、401(k)、IRA、房貸、貸款、信用卡。**最廣泛的免費聚合工具之一** |
| **獨特差異化** | 免費 Dashboard 功能強大 — 退休規劃器可媲美付費工具。費用分析器揭示所有帳戶的費用比率。雙模式：免費工具吸引用戶 → 付費財富管理（0.89% AUM，最低 $100K） |
| **目標用戶** | 中高淨值個人（$100K–$5M+），需要整體財務圖景 |
| **定價** | **免費** Dashboard 與工具。財富管理：**0.49%–0.89% AUM**（階梯式，最低 $100K） |

### 5.2 Wealthfront
**官網**: https://www.wealthfront.com/

| 維度 | 詳情 |
|------|------|
| **核心價值** | "Sophisticated investing made simple." 一站式自動化投資 + 高收益現金帳戶（最高 4.20% APY）。1.4M+ 客戶，$95B+ 資產。已在 NASDAQ 上市 (WLTH) |
| **Dashboard 功能** | "Path" 財務規劃工具（免費，場景式）、投資組合績效圖表（1Y: 32.26%, 5Y: 9.25%, 10Y: 10.75% 風險分數 9）、配置視圖、稅損收割 Dashboard、風險問卷 |
| **帳戶聚合** | 通過 Path 連結外部帳戶進行財務規劃。在 Wealthfront 內部帳戶投資（應稅、IRA、529、聯合）。現金帳戶 3.30% APY + 加碼 |
| **獨特差異化** | 業界領先的**稅損收割**（Forbes：擊敗 Fidelity、Schwab、Vanguard）。**S&P 500 直接指數化** 0.09% 費率。**股票投資帳戶**（零佣金，反賭博設計）。自動化債券階梯。房屋貸款 |
| **目標用戶** | 科技導向的千禧一代和 X 世代，偏好 set-it-and-forget-it 自動化 |
| **定價** | **0.25% 年管理費**。現金帳戶免費。股票投資零佣金。S&P 500 Direct: 0.09%。最低 $1 起 |

### 5.3 Betterment
**官網**: https://www.betterment.com/

| 維度 | 詳情 |
|------|------|
| **核心價值** | 先驅機器人投顧，結合自動化投資組合管理與目標導向投資 |
| **Dashboard 功能** | 目標進度追蹤（退休、買房、緊急基金）、預期結果圖表、配置圓餅圖、稅務協調 Dashboard、績效 vs 基準對比、社會責任投資選項 |
| **帳戶聚合** | 主要管理 Betterment 內部帳戶。可連結外部帳戶作整體檢視。現金管理（支票/儲蓄） |
| **獨特差異化** | **目標導向投資框架**（每個目標有獨立配置）。稅損收割 + **稅務協調投資組合**（跨帳戶類型優化）。加密貨幣投資組合。企業 401(k)。Premium 可接觸 CFP 人工顧問 |
| **目標用戶** | 初級到中級投資者，偏好目標導向自動化 |
| **定價** | **Digital: 0.25% AUM/年**（無最低額）。**Premium: 0.40% AUM/年**（$100K 最低，含人工顧問）。加密: 1% + 交易成本 |

### 5.4 Kubera
**官網**: https://www.kubera.com/

| 維度 | 詳情 |
|------|------|
| **核心價值** | "The Balance Sheet HNIs live by." 高淨值人士的全面個人資產負債表，追蹤所有資產類別。**隱私優先，無顧問推銷** |
| **Dashboard 功能** | 即時資產負債表（淨值走勢，可用任何貨幣或比特幣查看）、資產配置分析、**Fast Forward**（動態場景規劃）、**Club Benchmarks**（與同淨值同儕比較配置）、現金預測 |
| **帳戶聚合** | 多聚合器方案（每個機構選最佳連接器）。支援銀行、券商、加密錢包/交易所/DeFi、**Carta 整合**（LP 倉位、資本認繳、IRR）、房地產（AI 估價）、車輛、珠寶、手錶。**AI Import**（PDF/截圖匯入） |
| **獨特差異化** | **最深的另類資產支援**（LP 倉位、資本認繳、DeFi、NFT、質押）。**嵌套投資組合**（信託/LLC/控股公司）。**Dead Man's Switch**（自動將投資組合交付受益人）。**Proof of Wealth** 驗證。**MCP 整合**（ChatGPT/Claude/Gemini）。多幣別原生。永不出售數據 |
| **目標用戶** | 高淨值個人、科技創辦人、VC、海外僑民、家族辦公室 |
| **定價** | **Essentials: $249/年**。**Black: $2,499/年**（嵌套投資組合、精細權限控制、VIP 支援）。14 天免費試用。White Label $299/月起 |

### 5.5 Sharesight
**官網**: https://www.sharesight.com/

| 維度 | 詳情 |
|------|------|
| **核心價值** | "Be the smarter investor." 屢獲殊榮的投資組合追蹤，**績效與稅務報表最佳**。500K+ 投資者信任 |
| **Dashboard 功能** | 真實績效追蹤（資金加權/時間加權回報，含股息）、股息收入報表、稅務報表（CGT、未實現損益）、多元化報表、貢獻分析、自定義分組。支援 700K+ 股票/ETF/基金，200+ 券商 |
| **帳戶聚合** | 與數百家券商整合（Robinhood、Schwab、Interactive Brokers、Moomoo、Zerodha）。自動匯入交易。支援 30+ 全球股票交易所 |
| **獨特差異化** | **稅務報表卓越** — 專為報稅設計（澳洲 CGT 計算器、美/英/紐/加稅務支援）。**股息追蹤**含再投資處理。包含公司行動、拆股、貨幣轉換的真實績效計算。**全球市場聚焦**（非美國中心） |
| **目標用戶** | 自主投資者（特別是澳紐英加）、會計師、財務顧問 |
| **定價** | **免費**: 1 投資組合, 10 持倉。**Starter: $7/月** (30 持倉)。**Standard: $18/月** (無限持倉, 4 投資組合)。**Premium: $23.25/月** (10 投資組合, 優先支援) |

### 5.6 Portfolio Visualizer
**官網**: https://www.portfoliovisualizer.com/

| 維度 | 詳情 |
|------|------|
| **核心價值** | "Tools for Better Investors." 機構級分析工具（回測、優化、蒙特卡洛模擬）面向個人投資者。5.1M 年訪問量 |
| **Dashboard 功能** | 投資組合回測（歷史績效）、蒙特卡洛模擬（結果概率）、投資組合優化（均值-方差、Black-Litterman）、因子回歸分析、戰術配置模型（動量、移動平均、波動率目標）、即時市場監控（追蹤 Ray Dalio All Seasons、Harry Browne Permanent 等懶人投資組合）。AI 洞察生成 |
| **帳戶聚合** | **無**。純分析/模擬工具。手動輸入或通過 Ticker。覆蓋 187,650+ 證券，30 個全球市場 |
| **獨特差異化** | **消費者工具中最深的量化分析**。因子回歸、自定義稅務假設、管理費建模、自定義數據系列。AI 用簡單語言解釋複雜分析。無帳戶連接 — 純分析沙箱 |
| **目標用戶** | 量化導向 DIY 投資者、財務顧問、學生、學者 |
| **定價** | **免費**: 有限（15 資產）。**Basic: $30/月**。**Pro: $55/月**（商業用途、團隊同步） |

### 5.7 Stock Events
**官網**: https://stockevents.app/

| 維度 | 詳情 |
|------|------|
| **核心價值** | "Just one look is enough." 以事件為驅動的投資追蹤器 — 聚焦投資的**即將發生事件**。500K+ 用戶，4.8★ 雙平台 |
| **Dashboard 功能** | 事件日曆（財報、股息、經濟事件）、即時市場動態（漲跌幅排行）、投資組合分析（按資產/行業/國家）、盈虧分析、股息追蹤/日曆、"Why is it moving?" 解釋、競爭對手分析 |
| **帳戶聚合** | **Connect 附加功能**（$0.99/週）自動同步券商和加密交易所。免費手動輸入。支援 100K+ 全球資產 |
| **獨特差異化** | **事件優先設計** — 圍繞發生的事件（財報、股息、經濟事件）組織，而非僅持倉。"Key Drivers" 解釋股價變動。日曆整合。Excel/Google Sheets 導出。精美移動端設計 |
| **目標用戶** | 散戶投資者（特別是股息導向），移動端優先 |
| **定價** | **免費**: 15 股票。**Pro: $49.99/年**（無限觀察名單、分析）。**Connect: $0.99/週**（自動同步） |

### 5.8 Delta（eToro 旗下）
**官網**: https://delta.app/

| 維度 | 詳情 |
|------|------|
| **核心價值** | "All your investments in one app." 多資產投資組合追蹤器。5M+ 用戶，$20B+ 追蹤資產。被 eToro 收購 |
| **Dashboard 功能** | 個人化首頁、投資組合績效（損益/回報走勢）、多元化分析（行業/市值/地理）、市盈率追蹤、風險分析（加權 Beta vs 基準）、"Good & Bad Decisions" 交易分析、成本基礎追蹤、盤前盤後活動、資產位置視圖 |
| **帳戶聚合** | 自動同步加密交易所/錢包和股票券商。CSV 匯入。手動輸入。唯讀連接。PRO 無限連接 |
| **獨特差異化** | **AI Daily Recap**（個性化市場動態播客）。**"What's going on?"** AI 解釋投資組合變動。**加密信號**（鏈上分析）。**Beyond the Bell**（盤前盤後追蹤）。eToro 支撐長期穩定。單色模式夜間使用 |
| **目標用戶** | 多資產投資者，特別是加密活躍用戶。全球用戶需要股票+加密+基金統一視圖 |
| **定價** | **免費**: 基本追蹤。**PRO**: ~$9.99/月（無限連接、進階分析） |

### 5.9 Quicken Simplifi
**官網**: https://www.quicken.com/simplifi/

| 維度 | 詳情 |
|------|------|
| **核心價值** | Quicken 品牌的現代化個人財務 App。結合預算、支出追蹤、帳單管理和投資監控 |
| **Dashboard 功能** | 支出計劃（非僅預算 — 追蹤收入 vs 帳單 vs 訂閱 vs 支出）、現金流預測、淨值追蹤、投資績效、觀察名單、支出分類分析、帳單提醒、訂閱檢測 |
| **獨特差異化** | **支出計劃方法**（帳單+訂閱+儲蓄目標從收入扣除=剩餘可花金額）。Quicken 數十年財務軟體經驗。Mint 替代者定位 |
| **目標用戶** | 日常消費者，Mint 難民，需要一個 App 管理所有個人財務 |
| **定價** | ~**$3.99/月**（年付 ~$47.88/年）。30 天免費試用。無免費層 |

### 5.10 Copilot Money
**官網**: https://copilot.money/

| 維度 | 詳情 |
|------|------|
| **核心價值** | "Your money, beautifully organized." 以精美設計著稱的高端個人財務 App。Apple Design Award 入圍 + Editor's Choice |
| **Dashboard 功能** | AI 自動分類、支出線（每日預算進度）、預算遞延、現金流趨勢、訂閱檢測、投資追蹤（盤中即時績效估算）、配置分析（股票/加密/ETF/現金）、淨值追蹤、房地產追蹤（via Zillow） |
| **帳戶聚合** | 連接銀行、券商（Schwab、Coinbase、Wealthfront、Vanguard）、加密交易所、信用卡。即時餘額變動含時間戳 |
| **獨特差異化** | **Apple 生態最佳設計**（iPhone, iPad, Mac, Web）。AI 自動分類學習模式。預算遞延。房地產追蹤（Zillow URL）。無廣告、不賣數據。MKBHD 背書。Apple 多次推薦 |
| **目標用戶** | Apple 生態用戶，重視精美設計，Mint/Quicken 升級者 |
| **定價** | **$7.92/月**（年付 $95）。月付選項。無免費層（有免費試用）。無廣告 |

---

## 6. 競品功能對比矩陣

### 6.1 核心功能對比

| 平台 | 類型 | 帳戶聚合 | 投資聚焦 | 另類資產 | 免費層 | 付費價格 | 目標用戶 |
|------|------|---------|---------|---------|--------|---------|---------|
| **M1 Finance** | 投資平台 | 自有帳戶 | 卓越(Pie) | 加密 | 有(基本) | 免費/$125/yr(Plus) | 長期投資者 |
| **Monarch** | 個人財務 | 優秀(13K+) | 中等 | 有限 | 無 | $8.33/mo | 全面財務管理 |
| **Empower** | Dashboard+顧問 | 優秀(全類型) | 強(分析器) | 有限 | 有(Dashboard) | 0.49-0.89% AUM | 中高淨值 |
| **Wealthfront** | 機器人投顧 | 自有+外部連結 | 卓越(自動化) | 無 | 無 | 0.25% AUM | 科技千禧代 |
| **Betterment** | 機器人投顧 | 自有+外部 | 卓越(目標式) | 加密 | 無 | 0.25-0.40% AUM | 初學者 |
| **Kubera** | 資產負債表 | 優秀(多聚合器) | 良(僅追蹤) | **最佳** | 無(14天試用) | $249-$2,499/yr | HNW/創辦人 |
| **Sharesight** | 績效追蹤 | 良(200+券商) | 卓越(稅/績效) | 有限 | 有(10持倉) | $7-$23.25/mo | 自主/稅務導向 |
| **Portfolio Visualizer** | 分析工具 | 無(手動) | 卓越(回測) | 無 | 有(有限) | $30-$55/mo | 量化/顧問 |
| **Stock Events** | 事件追蹤 | 可選($0.99/wk) | 良(事件式) | 加密/商品 | 有(15股) | $49.99/yr | 股息投資者 |
| **Delta** | 多資產追蹤 | 良(加密+股票) | 良(分析) | 加密/DeFi | 有(基本) | ~$9.99/mo | 加密活躍 |
| **Simplifi** | 個人財務 | 良(美國) | 輕度 | 無 | 無(30天試用) | ~$3.99/mo | 預算者/Mint難民 |
| **Copilot Money** | 個人財務 | 良 | 中等 | 房地產(Zillow) | 無(試用) | $7.92/mo | Apple用戶 |

### 6.2 技術與安全對比

> 圖例：✅ 已實現/可用 | 🔲 計劃中 | ❌ 不支持

| 平台 | 開源 | Self-hosted | 全球多國 | 多幣別 | MCP/AI | 衍生品 |
|------|------|-----------|---------|--------|--------|--------|
| **本專案** | ✅ | 🔲 Phase 1 | 🔲 Phase 3 | 🔲 Phase 1 | 🔲 Phase 4 | 🔲 P3+ |
| Ghostfolio | ✅ | ✅ | ✅ | ✅ | ❌ | 有限（近期版本新增了基本的期權支援） |
| Maybe | ✅ | ✅ | 有限 | ✅ | ❌ | ❌ |
| Firefly III | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Kubera | ❌ | ❌ | ✅ | ✅ | ✅ | 有限 |
| 其他商業產品 | ❌ | ❌ | 多為美國 | 部分 | ❌ | ❌ |

### 6.3 本專案差異化定位

| 差異化要素 | 說明 |
|-----------|------|
| **開源 + Self-hosted** | 類似 Ghostfolio，但涵蓋更多資產類別 |
| **全球多國帳戶** | 美/港/中/日/歐/英/巴西 — 超越大多數競品 |
| **衍生品支援** | 期貨、期權、大宗商品 — P3+ 單獨 PRD，幾乎無競品支援 |
| **MCP/AI 原生整合** | Claude/ChatGPT 直接查詢投資組合 — Phase 4，僅 Kubera 有類似功能 |
| **完全免費** | 不像 Kubera ($249/yr) 或 Sharesight ($7-23/mo) |
| **公司行動支援** | Stock Split/DRIP/Spin-off — Ghostfolio 不支援，具競爭優勢 |

---

## 7. 數據同步方案研究

### 7.1 Plaid API

| 維度 | 詳情 |
|------|------|
| **工作原理** | 用戶通過 Plaid Link UI 授權連接銀行帳戶。Plaid 與銀行 API/Screen scraping 通訊，返回標準化數據 |
| **支援數據** | 帳戶餘額、交易記錄、投資持倉、負債資訊、身份驗證 |
| **覆蓋範圍** | **美國 12,000+ 機構**、加拿大、英國（有限）、歐洲（有限） |
| **定價** | 按連接帳戶數計費，Development 環境免費（100 個連接），Production 需聯繫銷售。**參考價格：~$0.30–$1.50/連接/月**，另有 Launch 計畫可單次購買信用額度 |
| **適用場景** | Phase 2 — 自動同步美國銀行和券商帳戶 |
| **限制** | 非全球覆蓋，亞洲市場支援有限，中國大陸不支援 |

### 7.2 Yodlee (Envestnet)

| 維度 | 詳情 |
|------|------|
| **工作原理** | 類似 Plaid 的金融數據聚合器，歷史更長 |
| **覆蓋範圍** | 全球覆蓋更廣（21,000+ 金融機構），包含更多非美國市場 |
| **定價** | 企業級定價，適合規模化產品 |
| **適用場景** | 如需更廣泛的全球覆蓋，可作為 Plaid 替代 |

### 7.3 Open Banking APIs

| 地區 | 標準 | 說明 |
|------|------|------|
| 歐盟 | PSD2 (Payment Services Directive 2) | 銀行必須通過 API 開放帳戶數據。通過 **TrueLayer** 或 **Nordigen/GoCardless** 等聚合器接入 |
| 英國 | Open Banking Standard | 9 大銀行必須開放 API。通過 **TrueLayer** 或 **Yapily** 接入 |
| 澳洲 | CDR (Consumer Data Right) | 銀行需開放數據。通過 **Basiq** 等接入 |
| 巴西 | Open Finance Brasil | 漸進式開放，覆蓋銀行/保險/投資。通過 **Belvo** 接入 |
| 香港 | HKMA Open API Framework | 4 階段開放，Phase 3-4 涉及交易數據，採用有限 |
| 日本 | 修訂版 Banking Act | 鼓勵 API 開放，非強制。合作模式為主 |
| 中國大陸 | 無統一標準 | 受監管限制，無 Open Banking。僅能手動輸入或 CSV |

### 7.4 券商 API

| 券商 | API 類型 | 覆蓋市場 | 適用性 |
|------|---------|---------|--------|
| **Interactive Brokers** | REST/WebSocket | 全球多市場 | ⭐ 最佳 — 一個 API 覆蓋美/港/歐/日/巴西等 |
| **富途 (Futu/Moomoo)** | OpenD API | 美/港/A股 | 適合亞洲市場 |
| **老虎證券 (Tiger)** | Open API | 美/港/A股/新加坡 | 適合亞洲市場 |
| **Alpaca** | REST API | 美股 | 適合美股自動化 |
| **TD Ameritrade** | REST API | 美股 | 被 Schwab 收購，API 遷移中 |

### 7.5 加密貨幣數據

| 方案 | 說明 |
|------|------|
| **CCXT (library)** | 統一接口存取 100+ 加密交易所。Python/JS。用於讀取餘額和交易歷史 |
| **交易所 API** | Binance, Coinbase, Kraken 等各有 REST API |
| **鏈上地址** | 通過 Etherscan/Blockchain.com API 追蹤錢包餘額 |
| **CoinGecko API** | 免費獲取加密貨幣報價、市值、歷史數據 |

### 7.6 手動/CSV 匯入（MVP 核心）

| 功能 | 實現方式 |
|------|---------|
| **手動輸入** | 表單輸入持倉名稱、數量、買入價、日期 |
| **CSV 匯入** | 解析券商導出的 CSV（各券商格式不同，需適配器模式） |
| **Excel 匯入** | 使用 xlsx 庫解析 .xlsx 文件 |
| **PDF 匯入** | 使用 AI/OCR 解析對帳單 PDF（參考 Kubera 的 AI Import） |

### 7.7 市場報價數據源

| 數據類型 | API | 費用 | 特性 |
|---------|-----|------|------|
| 美股報價 | Yahoo Finance (unofficial) | 免費 | 非官方但穩定，不保證 SLA |
| 全球股票 | Alpha Vantage | 免費(25次/天) | 有限額度，適合 MVP |
| 即時報價 | Polygon.io | $29/mo+ | 專業級，WebSocket 即時數據 |
| 延遲報價 | Financial Modeling Prep | 免費/付費 | 全球股票、ETF |
| 匯率 | ExchangeRate API | 免費(1500次/月) | 160+ 貨幣 |
| 匯率 | Open Exchange Rates | 免費(1000次/月) | 170+ 貨幣，歷史匯率 |
| 加密貨幣 | CoinGecko API | 免費 | 全面的加密數據 |
| 美國國債 | FRED API | 免費 | 美聯儲經濟數據 |
| 全球債券 | Quandl/Nasdaq Data Link | 免費/付費 | 債券收益率、宏觀數據 |

### 7.8 多幣別處理最佳實踐

1. **存儲原始幣別**：所有金額以原始交易幣別存儲
2. **轉換幣別分開存儲**：用戶選擇的展示幣別轉換值另存
3. **匯率快照**：記錄每日匯率快照用於歷史回算
4. **匯率更新頻率**：每日更新即可（非即時），用 cron job
5. **精度**：使用 Decimal 類型，避免浮點數誤差
6. **基準幣別**：用戶可選擇 base currency（USD/HKD/CNY 等）

---

## 8. 數據庫隱私與安全

### 8.1 加密策略

| 層級 | 措施 | 工具/技術 |
|------|------|----------|
| **傳輸加密** | TLS 1.3，HTTPS only，HSTS | Nginx/Caddy 自動 TLS |
| **靜態加密** | AES-256 數據庫級加密 | PostgreSQL pgcrypto / LUKS 磁碟加密 |
| **欄位加密** | 敏感欄位（帳號、API Key）單獨加密 | pgcrypto、應用層加密 |
| **備份加密** | 所有備份文件加密 | GPG / age 加密 |

### 8.2 敏感數據分類

| 數據類型 | 敏感級別 | 處理方式 |
|---------|---------|---------|
| 銀行帳號 | 🔴 高 | 欄位級加密，不在日誌中顯示 |
| API Keys/Tokens | 🔴 高 | 環境變數，Vault 管理 |
| 持倉數量/金額 | 🟡 中 | 數據庫加密，RBAC 控制 |
| 交易記錄 | 🟡 中 | 數據庫加密 |
| 資產名稱/Ticker | 🟢 低 | 標準存儲 |

### 8.3 Self-hosted vs Cloud

| 方面 | Self-hosted | Cloud |
|------|-----------|-------|
| **安全性** | ⭐⭐⭐⭐⭐ 完全控制 | ⭐⭐⭐⭐ 依賴服務商 |
| **便利性** | ⭐⭐ 需維護 | ⭐⭐⭐⭐⭐ 免維護 |
| **成本** | 電費 + 硬體折舊 | $0-50/月 |
| **合規** | 數據在本地 | 需確認數據駐留地 |
| **可用性** | 取決於個人網路/硬體 | 99.9%+ SLA |
| **推薦** | ⭐ 金融數據首選 | MVP/測試用 |

**推薦方案**：
- **MVP 階段**：Docker Compose self-hosted (PostgreSQL + Next.js)
- **外部訪問**：Cloudflare Tunnel 或 Tailscale（無需開放端口）
- **雲端替代**：Vercel + Supabase/Neon（見 [tech_stack.md](tech_stack.md) §5）

### 8.4 Zero-Knowledge 架構概念 (ℹ️ Phase 4+ 考慮)

```
客戶端 (瀏覽器)
├── 用戶輸入數據
├── 本地加密 (AES-256, 密鑰派生自用戶密碼)
├── 加密後數據 → 發送到伺服器
│
伺服器
├── 接收加密後的 blob
├── 存儲加密數據 (無法解密)
├── 無法讀取用戶的原始金融數據
│
客戶端
├── 從伺服器獲取加密 blob
├── 本地解密
└── 渲染 Dashboard
```

- **優點**：即使伺服器被攻破，數據仍安全
- **缺點**：伺服器端無法做搜索/計算，所有邏輯在客戶端
- **參考**：Kubera 的方式是不走 zero-knowledge，而是通過嚴格的存取控制和加密
- **建議**：MVP 不需要 zero-knowledge，先用標準加密 + self-hosted

### 8.5 認證最佳實踐

| 功能 | 實現 |
|------|------|
| 登入 | OAuth 2.0 (Google/GitHub) + Email/Password |
| 2FA | TOTP (Google Authenticator / Authy) |
| Session | HttpOnly + Secure + SameSite cookies |
| Token | JWT with short expiry + Refresh token rotation |
| 密碼 | bcrypt/argon2 哈希，≥12 字符要求 |
| Rate limiting | 登入嘗試限制（5 次/分鐘） |

### 8.6 Ghostfolio 的安全做法（參考）

- **Self-hosted**：用戶在自己的機器上運行 Docker 容器
- **無雲端依賴**：數據完全在本地 PostgreSQL
- **環境變數**：所有密鑰/API Key 通過 `.env` 管理
- **無遙測**：不收集使用數據
- **開源審計**：代碼公開可審計

---

## 9. MCP (Model Context Protocol) 研究

### 9.1 MCP 是什麼

- **MCP（Model Context Protocol）** 是 Anthropic 發起的開源標準，用於連接 AI 應用與外部系統
- 類比 **"AI 的 USB-C 接口"** — 標準化的連接方式
- 支持：數據源（文件、數據庫）、工具（搜索引擎、計算器）、工作流（專門的 prompts）
- 已被 Claude、ChatGPT、VS Code Copilot、Cursor 等廣泛支持

### 9.2 MCP 架構

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  AI Client   │     │  MCP Server  │     │  Data Source  │
│  (Claude/    │ ←→  │  (本地運行)    │ ←→  │  (PostgreSQL/ │
│   ChatGPT)   │     │              │     │   API/Files)  │
└──────────────┘     └──────────────┘     └──────────────┘

MCP Server 提供:
├── Resources: 結構化數據（投資組合摘要、持倉列表）
├── Tools: 可調用功能（新增交易、計算報酬率）
└── Prompts: 預設提示模板（投資組合審查、稅務估算）
```

### 9.3 MCP 在本專案中的應用

| 應用場景 | 描述 | 實現方式 |
|---------|------|---------|
| **自然語言查詢** | "我的美股倉位佔比是多少？" | MCP Resource 暴露投資組合數據 |
| **AI 資產配置建議** | "基於我的風險偏好，建議如何再平衡？" | MCP Tool 結合用戶偏好和市場數據 |
| **交易記錄分類** | 自動識別交易類型（買入/賣出/股息/利息） | MCP Tool 調用 LLM 分類 |
| **定期審查** | "幫我做月度投資組合審查報告" | MCP Prompt 模板 |
| **稅務估算** | "估算今年的資本利得稅" | MCP Tool 調用計算引擎 |
| **異常檢測** | "有任何持倉出現異常波動嗎？" | MCP Resource + Tool 結合 |

### 9.4 Kubera 的 MCP 整合先例

- Kubera 是**首批支持 MCP 的金融產品之一**
- 允許 ChatGPT、Claude、Gemini 通過 MCP 查詢 Kubera 數據
- 用戶可以用自然語言問："我的淨值是多少？"、"哪些資產下跌了？"
- **安全模式**：MCP Server 在用戶本地運行，不暴露數據到外部

### 9.5 可用的金融相關 MCP Servers

目前 MCP 生態中與金融相關的 Server 有限，但可自建：

| MCP Server | 用途 |
|-----------|------|
| 自建 Portfolio MCP Server | 連接本地 PostgreSQL，暴露投資組合數據 |
| PostgreSQL MCP Server | 直接查詢數據庫 |
| Yahoo Finance MCP Server (社區) | 獲取即時報價 |

### 9.6 MCP Server 設計方案

```typescript
// 概念設計 — Portfolio MCP Server

// Resources
{
  "portfolio://summary": {
    // 總資產、總負債、淨值、日/月/年漲跌幅
  },
  "portfolio://holdings": {
    // 所有持倉列表，含名稱、數量、市值、配置比例
  },
  "portfolio://performance": {
    // TWR、MWR、CAGR、最大回撤
  },
  "portfolio://allocation": {
    // 按資產類別、地區、幣別、風險級別的配置分析
  },
  "portfolio://dividends": {
    // 股息/利息記錄和預測
  }
}

// Tools
{
  "add_transaction": {
    // 新增買入/賣出/股息/利息交易
  },
  "query_portfolio": {
    // 自然語言查詢，返回結構化數據
  },
  "calculate_returns": {
    // 計算指定時間段的報酬率
  },
  "rebalance_suggest": {
    // 基於目標配置，建議再平衡操作
  },
  "export_report": {
    // 導出投資組合報告（PDF/CSV）
  }
}

// Prompts
{
  "portfolio-review": {
    // 系統性審查投資組合的提示模板
  },
  "tax-estimation": {
    // 估算資本利得稅的提示模板
  },
  "risk-assessment": {
    // 評估投資組合風險的提示模板
  }
}
```

---

## 10. Notion MVP 可行性分析（歷史參考 — 已決定跳過）

> ⚠️ **決策變更**：經 CEO 審閱後決定跳過 Notion MVP 階段，直接構建最小 Web App（見 [prd.md](prd.md) §4, §7）。以下內容保留作為歷史研究參考。

### 10.1 Notion 數據庫能力

| 能力 | 支援程度 | 說明 |
|------|---------|------|
| 關聯式數據庫 | ✅ 良好 | 表間 Relation + Rollup |
| 公式計算 | ⚠️ 有限 | Formulas 2.0 改進但仍不支持跨表計算 |
| 視圖 | ✅ 良好 | Table, Board, Gallery, Calendar, Timeline, Chart |
| Chart 視圖 | ⚠️ 有限 | 僅支持 Bar, Line, Donut — 無互動式 Pie chart |
| API | ✅ 良好 | REST API 支持 CRUD 操作 |
| 自動化 | ⚠️ 有限 | Notion Automations 觸發器有限 |
| 多用戶 | ✅ 良好 | 共享頁面、權限控制 |

### 10.2 Notion MVP 數據庫設計

> 詳細的 Notion DB 設計和對應的 PostgreSQL Schema 已移至 [tech_stack.md](tech_stack.md) §3.5–3.6。此處僅保留概述。

核心數據庫表：
- **Accounts**：帳戶名稱、機構、類型、幣別、地區
- **Holdings**：資產名稱、Ticker、數量、買入均價、當前價格、市值 (Formula)
- **Exchange Rates**：幣對、匯率、更新時間
- **Transactions**：日期、類型、數量、價格、金額
- **Goals**：目標名稱、目標金額、當前進度

### 10.3 Notion 的限制

| 限制 | 影響 | 解決方案 |
|------|------|---------|
| Chart 功能有限 | 無法做互動式 Pie chart，無法做時間序列走勢圖 | 使用 Notion Chart 的 Donut 作為替代；複雜圖表嵌入 Google Sheets |
| 無即時報價 | 股價/匯率需手動更新 | Python 腳本 + Notion API 定時更新 |
| 公式能力不足 | 無法做 TWR/MWR 等複雜計算 | 導出到 Google Sheets/Python 計算後回寫 |
| 跨表計算有限 | Rollup 無法做複雜聚合 | 使用 Rollup + Formula 組合，或外部腳本 |
| 性能 | 大量數據 (1000+ 行) 可能變慢 | 歸檔歷史數據，僅顯示活躍持倉 |
| 隱私 | 數據存在 Notion 雲端 | 敏感數據可模糊處理（如帳號只存後 4 位） |

### 10.4 Notion → Web App 遷移策略

```
Phase 1: Notion MVP
├── 手動錄入持倉數據到 Notion Database
├── Python 腳本自動更新報價和匯率
├── Notion Donut Chart 做基本配置展示
└── 驗證數據模型和用戶需求

Phase 2: 遷移到 Web App
├── Step 1: 用 Notion API 導出所有數據為 JSON
├── Step 2: 設計 PostgreSQL Schema（基於 Notion 數據模型改進）
├── Step 3: 匯入數據到 PostgreSQL
├── Step 4: 構建 Next.js 前端 (Dashboard + 圖表)
├── Step 5: 構建 API 層（CRUD + 報價更新）
└── Step 6: 逐步添加自動化同步（Plaid/券商 API）

過渡期: 可以同時運行 Notion + Web App
├── Notion 作為數據輸入界面（移動端方便）
├── Web App 作為分析和展示界面
└── 通過 Notion API 雙向同步
```

### 10.5 Notion 自動化腳本 (Python) — 待開發

> ℹ️ 以下為概念代碼，實際工作腳本將在 Phase 1 開發時實現於 `scripts/notion-sync/` 目錄。

```python
# 概念代碼 — 用 Notion API + yfinance 自動更新股價
# 實際實現見後續開發階段

import yfinance as yf
from notion_client import Client

notion = Client(auth="your-notion-api-key")
DATABASE_ID = "your-holdings-database-id"

# 1. 讀取所有持倉的 Ticker
# 2. 用 yfinance 批量獲取當前價格
# 3. 通過 Notion API 更新每個持倉的「當前價格」欄位
# 4. 設定 cron job 每日執行
```

---

## 11. 設計啟示與建議

### 11.1 UI/UX 核心設計原則

基於對所有競品的分析，總結以下設計原則：

1. **一目了然的總覽** — 首屏必須包含：總淨值 + 漲跌幅 + 主要配置圖（參考圖片中的 $114,863.72 展示方式）
2. **Pie Chart 即控制器** — 借鑑 M1 的 Pie 概念，圖表不僅展示，還可交互（點擊切片進入細節）
3. **多維度 Pie Charts** — 按資產類別、地區、幣別、風險級別分別展示（4 個 Pie）
4. **持倉列表即細節** — 圖表下方是排序/篩選的持倉列表，每行顯示名稱、市值、漲跌、佔比
5. **深色/淺色雙主題** — 深色（M1 風格）傳達專業感，淺色（Monarch 風格）傳達清爽感
6. **漸進式信息揭露** — 首頁顯示總覽，下鑽到各資產類別，再下鑽到單個持倉
7. **卡片化佈局** — 每個功能區域用卡片包裹，清晰分區

### 11.2 必須避免的設計陷阱

| 陷阱 | 說明 | 解決方案 |
|------|------|---------|
| 數據過載 | 一次展示太多數據 | 漸進式揭露，預設顯示最重要的指標 |
| 缺乏情境 | 數字沒有對比基準 | 總是提供 vs 上期/vs 基準的對比 |
| 更新頻率不透明 | 用戶不知道數據是否最新 | 明確顯示 "Last updated: XX分鐘前" |
| 幣別混淆 | 多幣別混合顯示 | 清楚標示原始幣別和轉換幣別 |
| 移動端忽視 | 僅考慮桌面端 | 使用響應式設計，即使 MVP 也預留移動端空間 |

### 11.3 推薦的技術選型組合

**最佳組合（基於研究結論）**：

```
前端: Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui
圖表: Recharts (主) + Nivo (Sunburst/Treemap)
後端: Next.js API Routes → 後期 tRPC
ORM:  Drizzle (金融 Decimal 精度優勢)
DB:   PostgreSQL
認證: Auth.js (NextAuth v5)
部署: Docker Compose (self-hosted) 或 Vercel + Supabase (cloud)
AI:   MCP Server — Python SDK (本地) 連接 Claude/ChatGPT
```

> 詳見 [tech_stack.md](tech_stack.md) 和 [decisions.md](decisions.md) 的完整技術決策記錄。

---

*本研究報告將隨專案進展持續更新。*
