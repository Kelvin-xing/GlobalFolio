# 桌面研究報告 v2：Investment Portfolio Dashboard

> 研究日期：2026-04-17  
> 項目：Investment Portfolio Dashboard  
> 整合來源：`desktop_research.md` + `competitive_research.md`  
> 研究範圍：Skills 生態、GitHub 開源專案、競品分析、Onboarding/UX、公司行動、成本基礎、數據同步、隱私安全、MCP 整合

---

## 目錄

1. [執行摘要](#1-執行摘要)
2. [可用 Skills 與本地能力盤點](#2-可用-skills-與本地能力盤點)
3. [GitHub 開源專案調研](#3-github-開源專案調研)
4. [核心競品深度分析](#4-核心競品深度分析)
5. [Onboarding、Empty State 與日常使用模式](#5-onboardingempty-state-與日常使用模式)
6. [公司行動（Corporate Actions）研究](#6-公司行動corporate-actions研究)
7. [成本基礎（Cost Basis）研究](#7-成本基礎cost-basis研究)
8. [數據同步方案研究](#8-數據同步方案研究)
9. [數據庫隱私與安全](#9-數據庫隱私與安全)
10. [MCP（Model Context Protocol）研究](#10-mcpmodel-context-protocol研究)
11. [競品功能與定位對比](#11-競品功能與定位對比)
12. [對本產品的設計啟示與建議](#12-對本產品的設計啟示與建議)

---

## 1. 執行摘要

本輪整合後，研究得到幾個最重要的產品判斷：

1. **產品切入點應該是「投資組合追蹤 + 多幣別 + 公司行動 + 成本基礎」**，而不是泛個人記帳。
2. **Ghostfolio 是最值得參考的開源產品**，但其公司行動支援尤其是 stock split 存在明顯缺口，這是本產品的重要競爭機會。
3. **Sharesight 是公司行動與稅務報表的黃金標準**，尤其適合作為交易模型、報表與 corporate actions 的對標對象。
4. **Kubera 在多資產、另類資產、AI Import、MCP 整合方面最具前瞻性**，適合借鑑資產負債表視角與高淨值資訊架構。
5. **Monarch Money 與 M1 Finance 在前端交互上最值得借鑑**：前者是 widget 化 dashboard 與現金流體驗，後者是 Pie 作為配置與控制器。
6. **MVP 不應依賴即時 broker aggregation**；第一階段最穩妥的是：手動錄入 + CSV 匯入 + 價格/匯率自動更新。
7. **成本基礎至少要支持 Average Cost，最好同時規劃 FIFO tax lots**，以兼容不同稅務區域與未來報表擴展。
8. **MCP 應作為 Phase 4+ 的原生差異化能力**：讓用戶可直接以自然語言查詢配置、收益、股息、風險與稅務估算。

---

## 2. 可用 Skills 與本地能力盤點

### 2.1 金融 / 投資組合相關 Skills

通過 `npx skills find` 搜索 "financial dashboard portfolio" 的結果：

| Skill | 安裝數 | 安裝命令 | 說明 |
|-------|--------|---------|------|
| tracking-crypto-portfolio | 50 | `npx skills add jeremylongshore/claude-code-plugins-plus-skills@tracking-crypto-portfolio -g -y` | 加密貨幣投資組合追蹤 |
| dashboard | 24 | `npx skills add phrazzld/claude-config@dashboard -g -y` | Dashboard 通用技能 |
| blofin-portfolio-analyst | 19 | `npx skills add blofin/blofin-skills-hub@blofin-portfolio-analyst -g -y` | BloFin 投資組合分析 |
| agency-dashboard | 17 | `npx skills add indranilbanerjee/digital-marketing-pro@agency-dashboard -g -y` | 代理商 Dashboard |
| portfolio | 16 | `npx skills add alsk1992/cloddsbot@portfolio -g -y` | 投資組合通用 |
| j-portfolio-monitor | 9 | `npx skills add skills.volces.com@j-portfolio-monitor -g -y` | 投資組合監控 |

**評估**：安裝量均偏低，來源信譽不足，不建議直接依賴。可作為靈感來源，但不應成為核心方案。

> ⚠️ 安全提示：安裝量 < 100 的 Skills 未經廣泛社群驗證，需先審查原始碼。

### 2.2 前端 UI / Dashboard Skills

搜索 "react nextjs dashboard charts"：

| Skill | 安裝數 | 安裝命令 | 說明 |
|-------|--------|---------|------|
| **data-visualizer** | **488** | `npx skills add daffy0208/ai-dev-standards@data-visualizer -g -y` | 數據可視化，適用於圖表開發 |
| tremor-design-system | 72 | `npx skills add dodatech/approved-skills@tremor-design-system -g -y` | Tremor Dashboard UI 設計系統 |
| syncfusion-react-charts | 67 | `npx skills add syncfusion/react-ui-components-skills@syncfusion-react-charts -g -y` | Syncfusion React 圖表組件 |
| dashboard-builder | 54 | `npx skills add qwenlm/qwen-code-examples@dashboard-builder -g -y` | Dashboard 構建技能 |

### 2.3 Tailwind + shadcn/ui Skills

搜索 "tailwind shadcn ui design"：

| Skill | 安裝數 | 安裝命令 | 說明 |
|-------|--------|---------|------|
| **tailwind-v4-shadcn** | **2,700** | `npx skills add jezweb/claude-skills@tailwind-v4-shadcn -g -y` | 推薦，Tailwind v4 + shadcn/ui 最佳實踐 |
| shadcn-tailwind | 62 | `npx skills add tenequm/claude-plugins@shadcn-tailwind -g -y` | shadcn + Tailwind 整合 |
| tailwind-theme-builder | 11 | `npx skills add xingyu4j/skills@tailwind-theme-builder -g -y` | Tailwind 主題構建器 |

### 2.4 推薦安裝的 Skills

```bash
npx skills add jezweb/claude-skills@tailwind-v4-shadcn -g -y
npx skills add daffy0208/ai-dev-standards@data-visualizer -g -y
npx skills add dodatech/approved-skills@tremor-design-system -g -y
```

### 2.6 已安裝的本地 Skills

| Skill | 路徑 | 適用場景 |
|-------|------|---------|
| frontend-design | `~/.agents/skills/frontend-design/` | 生產級前端 UI 設計 |
| shadcn | `~/.agents/skills/shadcn/` | shadcn 組件管理、搜索、調試 |
| vercel-react-best-practices | `~/.agents/skills/vercel-react-best-practices/` | React/Next.js 性能優化 |
| web-design-guidelines | `~/.agents/skills/web-design-guidelines/` | UI 審查、可用性、無障礙檢查 |
| gstack | `~/.copilot/skills/gstack/` | QA 測試、設計審查、代碼審查 |

---

## 3. GitHub 開源專案調研

### 3.1 Tier 1：主要專案（> 5,000 Stars）

#### 3.1.1 ghostfolio/ghostfolio — ⭐ 8,144

- **GitHub**: https://github.com/ghostfolio/ghostfolio
- **技術棧**: Angular、NestJS、Prisma、Nx monorepo、TypeScript、PostgreSQL
- **定位**: 開源財富管理軟體，與本專案高度相關
- **關鍵功能**:
  - 多資產追蹤：股票、ETF、加密貨幣、債券、wealth items、liabilities
  - 投資績效分析
  - 股息追蹤
  - 資產配置視圖
  - 基準比較
  - 多幣別支援
  - Self-hosted（Docker）
- **參考價值**:
  - 架構設計
  - Activity-centric 數據模型
  - UX 上的極簡 empty state
  - 但 corporate actions 存在重大缺口

#### 3.1.2 maybe-finance/maybe — ⭐ 54,079

- **GitHub**: https://github.com/maybe-finance/maybe
- **技術棧**: Ruby on Rails、Hotwire/Turbo、Stimulus、PostgreSQL
- **定位**: 全功能個人財務產品
- **關鍵功能**:
  - 多帳戶追蹤（銀行、投資、房產）
  - 淨值 Dashboard
  - 交易分類
  - 投資視圖
  - 預算功能
  - AI chat（早期版本）
  - Sankey cash flow 視覺化
- **狀態說明**:
  - `desktop_research.md` 記錄其在 2024 年中重新啟動並積極維護
  - `competitive_research.md` 記錄其於 2025 年 7 月 archived
  - **結論**：最終採納前需再次核驗 repo 當前狀態，但其產品與架構思路仍具高參考價值

#### 3.1.3 firefly-iii/firefly-iii — ⭐ 22,987

- **GitHub**: https://github.com/firefly-iii/firefly-iii
- **技術棧**: PHP、Laravel、Docker、MySQL/PostgreSQL
- **關鍵功能**:
  - 多幣別
  - 預算
  - 週期性交易
  - 報表 / 圖表
  - REST API
  - 自託管
- **參考價值**: 自託管架構、多幣別模型與 API 設計

#### 3.1.4 Wallos — ⭐ 7,698

- **定位**: 訂閱追蹤與支出視覺化
- **參考價值**: self-hosted UX、subscription management

### 3.2 Tier 2 / 3：實用參考

| 專案 | Stars | 技術棧 | 亮點 | 參考價值 |
|------|-------|--------|------|---------|
| hisabi | 444 | PHP, Laravel, GraphQL | SMS 交易解析、GPT 分類 | AI 分類 |
| Cryptofolio | 368 | React, RN, Electron, PHP | 跨平台、多資產 | 跨平台架構 |
| hodlwatch | 126 | React, Redux, CCXT | 多交易所自動追蹤 | CCXT 整合 |
| plaid-to-gsheets | 103 | JS, Plaid, Google Sheets | 銀行 API → Sheets | MVP 數據管道 |
| finalynx | 73 | Python | CLI + Web、模擬 | Python 分析邏輯 |
| Finance_Analysis_PowerBI | 60 | Python, Power BI | 互動式 Dashboard | 視覺設計 |
| smart-fund-tracker | 54 | Python, FastAPI, ECharts | 即時淨值估算、快取 | FastAPI + ECharts |
| anychart investment dashboard | 51 | HTML, JS, AnyChart | 純前端投資圖表 | Dashboard 參考 |
| shadcn-openai-plaid-dashboard | 50 | Next.js, TS, Prisma, shadcn/ui, Plaid, OpenAI | 現代技術棧最接近 | **高參考價值** |

### 3.3 按用途分類的最佳參考

| 用途 | 最佳參考 |
|------|---------|
| 完整投資組合追蹤 | Ghostfolio |
| 公司行動與稅務報表 | Sharesight |
| 多資產 / 另類資產 / 資產負債表 | Kubera |
| 現代 React/Next 技術棧 | shadcn-openai-plaid-dashboard |
| 全功能個人財務 | Maybe、Firefly III |
| 銀行 / 券商 API 整合 | Plaid-to-gsheets、shadcn-openai-plaid-dashboard |
| Python 分析引擎 | finalynx、smart-fund-tracker |

---

## 4. 核心競品深度分析

### 4.1 M1 Finance

- **定位**: 自動化投資平台，核心概念是 Pie
- **UI 創新**:
  - 投資組合以 Pie 呈現
  - 每個 slice 對應一個持倉或子 Pie
  - Pie 同時是展示工具與配置控制器
  - 支援 nested Pie
- **投資機制**:
  - Auto-invest
  - 目標配置百分比
  - 新資金優先流向配置不足的資產
  - 排程交易窗口，弱化情緒化操作
- **借鑑意義**:
  - 配置圖不應只是圖表，而應是 interaction model
  - 適合用於本產品的 allocation / rebalance 體驗設計

### 4.2 Monarch Money

- **定位**: 全方位個人財務管理，重在 money clarity
- **關鍵特徵**:
  - 可拖放的 widget dashboard
  - 聚合 13,000+ 金融機構
  - 淨值時間軸
  - 投資表現 widget
  - Sankey cash flow
  - AI 自動分類
  - review workflow
  - bill / subscription detection
  - family collaboration
- **借鑑意義**:
  - Dashboard 要可定制
  - 統一交易流和 review 流程非常重要
  - 信息密度可低，但可讀性必須高

### 4.3 Ghostfolio

#### 定位與核心能力

- **定位**: privacy-first 的開源投資/財富追蹤器
- **優勢**:
  - 匿名 token 式註冊
  - activity-centric 數據模型
  - 無 broker integration，隱私友好
  - 多資產支持
  - Zen Mode、Emergency Fund 等體驗細節

#### Onboarding

- 使用者註冊後立即被引導新增第一筆 activity
- Activities 為系統核心單位：
  - Buy
  - Sell
  - Dividend
  - Interest
  - Fee
  - Liability
  - Wealth Item
- 支援 CSV / JSON 匯入
- 一開始就支援 multi-account

#### Empty State 與日常使用

- 空狀態極簡，只提示新增第一筆 activity
- Dashboard 為 widget layout，資料增加後逐步充實
- 常見使用模式：
  - Portfolio summary
  - Performance charts（Today / WTD / MTD / YTD / 1Y / 5Y / Max）
  - Allocation 分析（account / asset class / currency / region / sector）
  - X-ray
  - Watchlist
  - Market Mood

#### 明顯缺口

- **沒有完善支援 stock split / reverse split**
- M&A、spin-off、DRIP、ticker change 等 corporate actions 支援薄弱
- 這是本產品可直接攻擊的競爭弱點

### 4.4 Maybe Finance

- **定位**: 全功能 personal finance app
- **Onboarding**:
  - Email / password
  - Dashboard-first
  - 支援 demo data
  - 後期版本曾加入 trial / Stripe 流程
- **體驗特徵**:
  - Empty state 以 dashboard cards + CTA 呈現
  - account-centric model
  - Plaid integration
  - manual transaction + categories
  - Sankey cash flow
  - AI chat（v1）
- **架構價值**:
  - Rails + Hotwire 的產品節奏快
  - 很適合作為「不是純投資，而是 broader finance dashboard」參考

### 4.5 Sharesight

#### 定位

- **定位**: 最成熟的投資績效與稅務追蹤器之一
- **核心賣點**:
  - 200+ brokers
  - 700K+ securities
  - 真實 total return
  - 股息、公司行動、CGT 報表

#### Onboarding

1. Email 註冊
2. 選擇 tax residency country
3. 自動建立首個 portfolio
4. 引導新增 holdings：
   - Add trades individually
   - Import from broker
   - Import from CSV
   - Manually add holdings

#### Data Entry UX

交易表單涵蓋：

- Type：Buy / Sell / Split / Bonus / Consolidation / Cancellation / Return of Capital / Adjust Cost Base / Opening Balance
- Date of Trade
- Quantity
- Share Price（可自動建議歷史收盤價）
- Exchange Rate（外幣自動建議）
- Brokerage
- Comments
- File Attachments

#### 支援的資產類型

- 股票
- ETF
- mutual / managed funds
- custom investments
- cash accounts
- bonds
- cryptocurrencies
- foreign currency holdings
- warrants / stock options

不支持：CFDs、futures、options 等衍生品，以及實體藝術品 / 收藏品 / liabilities。

#### 日常使用模式

- Portfolio dashboard
- Automatic dividend tracking
- Future income report
- Multi-period comparison
- Diversification / exposure report
- Contribution analysis
- Tax reports
- Drawdown risk report
- PDF / Excel / Google Sheets export
- Accountant / advisor sharing

#### 研究結論

Sharesight 是本產品在以下方面最重要的 benchmark：

1. 交易模型
2. 公司行動支持
3. 稅務與成本基礎報表
4. onboarding 的「從 tax residency 開始」策略

### 4.6 Kubera

- **定位**: 高淨值人士的資產負債表系統
- **關鍵特徵**:
  - 多聚合器連接銀行與券商
  - AI Import：PDF / 文件 / 截圖
  - Carta integration
  - 另類資產與私募持倉
  - Real estate / vehicles / jewelry / watches
  - Net worth 可用 Bitcoin 顯示
  - Nested portfolios
  - Club Benchmarks
  - Proof of Wealth
  - Dead Man's Switch
  - Multiplayer family/advisor access
  - MCP / AI assistant integration
- **借鑑意義**:
  - 本產品若希望突破「普通股票 tracker」，Kubera 是最佳遠期對標
  - 尤其值得學習其 balance-sheet-first IA 與 AI Import / MCP 定位

### 4.7 Empower / Wealthfront / Betterment / Portfolio Visualizer / Stock Events / Delta / Simplifi / Copilot Money

這些產品在不同方向提供差異化參考：

| 產品 | 最值得借鑑的點 |
|------|---------------|
| Empower | 免費 dashboard + retirement planner + fee analyzer |
| Wealthfront | 稅損收割、Path 規劃、set-it-and-forget-it 自動化 |
| Betterment | 目標導向投資框架 |
| Portfolio Visualizer | 回測、蒙地卡羅、因子分析 |
| Stock Events | 事件優先設計、股息日曆 |
| Delta | 多資產追蹤、加密整合、決策分析 |
| Simplifi | 日常現金流 / 帳單 / 預算整合 |
| Copilot Money | 高品質 Apple 生態設計、AI 分類、精緻交互 |

---

## 5. Onboarding、Empty State 與日常使用模式

### 5.1 主要產品 Onboarding 對比

| 產品 | 認證方式 | 首次進入策略 | 輸入模型 | Broker / Aggregation |
|------|---------|-------------|---------|----------------------|
| Ghostfolio | 匿名 token | 立即新增第一筆 activity | Activity-centric | 無 |
| Maybe | Email/password | 先看 dashboard，再連帳戶或手動輸入 | Account-centric | Plaid |
| Sharesight | Email | 先選 tax residency，再建 portfolio | Trade-centric | 200+ brokers |
| Kubera | Email + trial | 直接進入 balance sheet | Balance-sheet-centric | 多聚合器 |

### 5.2 Empty State 設計總結

- **Ghostfolio**：最簡潔，突出「立刻新增第一筆資料」
- **Maybe**：dashboard cards + CTA，強調連接帳戶
- **Sharesight**：用 tile 與 step-by-step 引導降低初次建倉門檻
- **Kubera**：以 balance sheet 結構承接各種資產類型

### 5.3 對本產品的啟示

1. 首次 onboarding 應該讓使用者在 **2–5 分鐘內看到第一個有價值的 dashboard**。
2. **MVP 最佳路徑是手動輸入 + CSV 匯入**，而不是先做 broker integration。
3. Empty state 應該引導到最小閉環：
   - 新增帳戶
   - 新增持倉 / 交易
   - 自動抓取當前價格
   - 立刻看到總資產與配置圖
4. 稅務導向產品可學 Sharesight 先問 tax residency；多資產導向產品可學 Kubera 先讓用戶按資產類別落位。

---

## 6. 公司行動（Corporate Actions）研究

### 6.1 Sharesight：黃金標準

Sharesight 是目前研究中公司行動處理最成熟的產品。

#### 內建交易類型

| 類型 | 說明 |
|------|------|
| Buy | 標準買入 |
| Sell | 標準賣出 |
| Split | 正向拆股 |
| Bonus | Bonus share issue |
| Consolidation | Reverse split / consolidation |
| Cancellation | Share cancellation |
| Return of Capital | 資本返還 |
| Adjust Cost Base | 手動成本基礎調整 |
| Opening Balance | 期初持倉 |

#### 已覆蓋的公司行動

- Stock splits：可自動偵測，也可手動輸入
- Reverse splits / consolidations：有獨立交易類型
- Mergers & Acquisitions：通常按官方指引手動記錄
- Spin-offs：有針對個別事件的步驟指南
- DRP / DRIP：自動追蹤
- Delistings：可按最終價格賣出或 write-off
- Name / ticker changes：多數上市證券可自動處理
- ESS / ESPP、繼承股份、離婚轉倉等亦有記錄指引

#### Auto vs Manual

- 自動公司行動與股息以 ⚡ 顯示
- 一旦手動修改，系統不再自動覆寫
- M&A、spin-off 等複雜事件通常仍需要人工確認

### 6.2 Ghostfolio：主要缺口

截至 2026-04，Ghostfolio **沒有正式完成 dedicated stock split 支持**。

#### 已知現狀

- 多個 issue / discussion 長期存在
- PR #3211 曾嘗試加入 split order type，但未合併
- 用戶 workaround 包括：
  1. 賣出再買回
  2. 回改歷史交易
  3. 以 $0 新增持股
  4. 重抓歷史 market data 後手工調整

#### 問題

- 破壞績效時間序列
- 扭曲 cost basis
- 對長期 DCA 持倉非常痛苦

#### 結論

**Stock split 是競爭空檔**。如果本產品從 Day 1 就把 split / reverse split / return of capital / DRIP 做穩，會對 Ghostfolio 用戶有直接吸引力。

### 6.3 建議的公司行動枚舉

```text
BUY, SELL, DIVIDEND, INTEREST, FEE,
SPLIT, CONSOLIDATION,
BONUS, CANCELLATION,
RETURN_OF_CAPITAL, ADJUST_COST_BASE,
OPENING_BALANCE, TRANSFER_IN, TRANSFER_OUT,
DRIP, SPINOFF, MERGER
```

### 6.4 建議的資料模型

#### Split / Consolidation

```json
{
  "type": "SPLIT",
  "date": "2026-01-01",
  "holding_id": "fk",
  "ratio_from": 1,
  "ratio_to": 10
}
```

#### M&A

```json
{
  "type": "MERGER",
  "date": "2026-01-01",
  "source_holding_id": "fk",
  "target_holding_id": "fk",
  "cash_component": 12.5,
  "share_ratio_from": 1,
  "share_ratio_to": 0.5
}
```

#### Spin-off

```json
{
  "type": "SPINOFF",
  "date": "2026-01-01",
  "parent_holding_id": "fk",
  "child_holding_id": "fk",
  "cost_allocation_pct": 0.18,
  "share_ratio": 0.25
}
```

---

## 7. 成本基礎（Cost Basis）研究

### 7.1 常見方法

| 方法 | 說明 | 常見地區 / 用途 |
|------|------|----------------|
| FIFO | 先進先出 | 美國默認、很多司法區 |
| LIFO | 後進先出 | 某些可選稅務方法 |
| Average Cost | 加權平均成本 | 澳洲 / 紐西蘭 / 英國常見 |
| Specific Identification | 指定 lot | 高級稅務優化 |
| HIFO | 最高成本先出 | 稅務優化策略 |

### 7.2 Sharesight 的做法

- **默認 Average Cost Base**
- 核心報表：
  - Sold Securities Report
  - Capital Gains Tax Report
  - Historical Cost Report
  - Unrealised CGT Report
  - All Trades Report

#### Average Cost 邏輯

1. 每筆買入累加成本池：`total_cost += quantity * price + brokerage`
2. 平均成本：`total_cost / total_quantity`
3. 賣出時按當前加權平均成本計算
4. 公司行動對成本基礎的影響：
   - Return of Capital：降低總成本
   - Adjust Cost Base：手動覆蓋
   - Split / Consolidation：總成本不變，只調整每股成本
   - Bonus shares：按 0 成本加入，稀釋平均成本

### 7.3 Ghostfolio 的做法

- 使用 **ROAI (Return on Average Investment)** 進行表現衡量
- 更偏向績效視角，不是稅務成本基礎系統
- 特性：
  - 適合 DCA 視角
  - 股息不納入 performance calculation
  - 沒有 tax lots
  - 沒有 FIFO / LIFO / Spec ID 選擇

### 7.4 Kubera 的做法

- 重點在 net worth tracking，不是 tax-lot accounting
- 支援 alt investments IRR
- 不強調詳細 cost basis method selection

### 7.5 建議的資料模型

```text
Tax Lot
- id
- holding_id
- buy_date
- quantity
- remaining_quantity
- cost_per_share
- total_cost
- brokerage
- currency
- exchange_rate

Sale Allocation
- id
- sell_transaction_id
- tax_lot_id
- quantity_sold
- proceeds_per_share
- cost_basis_per_share
- realized_gain
- holding_period_days
- is_long_term
```

### 7.6 建議的演算法

#### FIFO

```python
def allocate_fifo(sell_qty, sell_price, tax_lots, sell_date):
    allocations = []
    remaining = sell_qty
    for lot in sorted(tax_lots, key=lambda l: l.buy_date):
        if remaining <= 0:
            break
        alloc_qty = min(remaining, lot.remaining_quantity)
        allocations.append({
            "lot": lot,
            "quantity": alloc_qty,
            "cost_basis": alloc_qty * lot.cost_per_share,
            "proceeds": alloc_qty * sell_price,
            "gain": alloc_qty * (sell_price - lot.cost_per_share),
            "holding_days": (sell_date - lot.buy_date).days
        })
        lot.remaining_quantity -= alloc_qty
        remaining -= alloc_qty
    return allocations
```

#### Average Cost

```python
def calc_average_cost(tax_lots):
    total_cost = sum(l.remaining_quantity * l.cost_per_share for l in tax_lots)
    total_qty = sum(l.remaining_quantity for l in tax_lots)
    return total_cost / total_qty if total_qty > 0 else 0
```

### 7.7 公司行動對成本基礎的影響

| 公司行動 | 對成本基礎的影響 |
|----------|----------------|
| Stock Split | 總成本不變；每股成本下降 |
| Reverse Split | 總成本不變；每股成本上升 |
| Return of Capital | 總成本下降 |
| Bonus Shares | 0 成本新增，攤薄平均成本 |
| Spin-off | 母公司成本按比例拆出到子公司 |
| DRIP | 形成新的 tax lot |
| M&A（share swap） | 生成新 lot 並分配成本 |
| M&A（cash only） | 視為賣出 |

### 7.8 對本產品的建議

1. **MVP 必做**：Average Cost
2. **強烈建議同步規劃**：FIFO + tax lot
3. **後續可選**：LIFO / Specific ID / HIFO
4. **報表優先級**：
   - Holdings 成本與未實現損益
   - Sold positions / realized gain
   - Dividend / income
   - Capital gains / tax summary

---

## 8. 數據同步方案研究

### 8.1 Plaid API

| 維度 | 詳情 |
|------|------|
| 工作原理 | 用戶透過 Plaid Link 授權；Plaid 聚合金融機構數據 |
| 支援數據 | 餘額、交易、投資持倉、負債、身份 |
| 覆蓋範圍 | 美國為主，另含加拿大、英國、歐洲部分市場 |
| 定價 | 約 `$0.30–$1.50/連接/月`，依方案而異 |
| 適用階段 | Phase 2 |
| 限制 | 亞洲覆蓋弱，中國大陸不支持 |

### 8.2 Yodlee

- 全球覆蓋更廣
- 偏企業級定價
- 可作為 Plaid 替代

### 8.3 Open Banking APIs

| 地區 | 標準 | 典型聚合器 |
|------|------|-----------|
| 歐盟 | PSD2 | TrueLayer、Nordigen/GoCardless |
| 英國 | Open Banking Standard | TrueLayer、Yapily |
| 澳洲 | CDR | Basiq |
| 巴西 | Open Finance Brasil | Belvo |
| 香港 | HKMA Open API | 採用仍有限 |
| 日本 | 修訂版 Banking Act | 以合作模式為主 |
| 中國大陸 | 無統一標準 | 主要依賴手動或 CSV |

### 8.4 券商 API

| 券商 | API 類型 | 覆蓋 | 評估 |
|------|---------|------|------|
| Interactive Brokers | REST / WebSocket | 全球 | 最佳全局選項 |
| Futu / Moomoo | OpenD API | 美 / 港 / A 股 | 適合亞洲 |
| Tiger | Open API | 美 / 港 / A 股 / 新加坡 | 適合亞洲 |
| Alpaca | REST | 美股 | 適合自動化交易 |
| TD Ameritrade / Schwab | REST | 美股 | 遷移中 |

### 8.5 加密數據

| 方案 | 說明 |
|------|------|
| CCXT | 統一連接 100+ 交易所 |
| 交易所 API | Binance / Coinbase / Kraken 等 |
| 鏈上地址 | 通過區塊鏈瀏覽器 API 追蹤 |
| CoinGecko API | 免費幣價 / 市值 / 歷史數據 |

### 8.6 MVP 核心：手動 / CSV / Excel / PDF 匯入

| 功能 | 實現方式 |
|------|---------|
| 手動輸入 | 表單錄入持倉與交易 |
| CSV 匯入 | 解析券商導出文件，使用適配器模式 |
| Excel 匯入 | xlsx 解析 |
| PDF 匯入 | AI / OCR 解析對帳單 |

### 8.7 市場報價與匯率

| 類型 | API | 特點 |
|------|-----|------|
| 美股 / ETF | Yahoo Finance | 免費，非官方 |
| 全球股票 | Alpha Vantage | 免費額度有限 |
| 即時數據 | Polygon.io | 專業級 |
| 全球股票 / ETF | Financial Modeling Prep | 免費 / 付費 |
| 匯率 | ExchangeRate API | 免費額度 |
| 匯率 | Open Exchange Rates | 歷史匯率 |
| 加密 | CoinGecko | 免費 |
| 美國國債 | FRED | 免費 |
| 全球債券 / 宏觀 | Nasdaq Data Link | 免費 / 付費 |

### 8.8 多幣別最佳實踐

1. 以原始交易幣別存儲
2. 展示幣別轉換值單獨存儲或快取
3. 保存匯率快照
4. 每日更新匯率即可
5. 使用 Decimal 保持精度
6. 支持用戶自選 base currency

---

## 9. 數據庫隱私與安全

### 9.1 加密策略

| 層級 | 措施 | 工具 |
|------|------|------|
| 傳輸 | TLS 1.3 / HTTPS / HSTS | Nginx / Caddy |
| 靜態 | AES-256 | pgcrypto / LUKS |
| 欄位 | 敏感欄位加密 | pgcrypto / 應用層加密 |
| 備份 | 備份文件加密 | GPG / age |

### 9.2 敏感數據分類

| 數據類型 | 級別 | 策略 |
|---------|------|------|
| 銀行帳號 | 高 | 欄位級加密，不寫入日誌 |
| API keys / tokens | 高 | env / Vault |
| 持倉數量 / 金額 | 中 | 數據庫加密 + RBAC |
| 交易記錄 | 中 | 數據庫加密 |
| Ticker / 資產名稱 | 低 | 普通存儲 |

### 9.3 Self-hosted vs Cloud

| 方面 | Self-hosted | Cloud |
|------|-----------|-------|
| 安全控制 | 最佳 | 依賴供應商 |
| 便利性 | 較低 | 較高 |
| 成本 | 硬體 / 運維 | 訂閱制 |
| 合規 | 本地可控 | 需確認數據駐留地 |
| 推薦場景 | 金融數據正式使用 | MVP / 演示 / 快速部署 |

**推薦**：

- MVP：Docker Compose self-hosted（PostgreSQL + Next.js）
- 外部訪問：Cloudflare Tunnel / Tailscale
- 雲端替代：Vercel + Supabase / Neon

### 9.4 Zero-Knowledge 架構（遠期）

- 優點：服務端即使被攻破也無法讀取明文
- 缺點：服務端搜索、報表、計算能力受限
- 建議：MVP 不採用，先用標準加密 + self-hosted

### 9.5 認證最佳實踐

| 功能 | 建議 |
|------|------|
| 登入 | OAuth 2.0 + Email/Password |
| 2FA | TOTP |
| Session | HttpOnly / Secure / SameSite cookies |
| Token | 短期 JWT + refresh token rotation |
| 密碼 | bcrypt / argon2 |
| 風控 | Rate limiting |

### 9.6 Ghostfolio 可借鑑安全做法

- self-hosted
- 本地 PostgreSQL
- `.env` 管理密鑰
- 無遙測
- 開源可審計

---

## 10. MCP（Model Context Protocol）研究

### 10.1 MCP 是什麼

- Anthropic 發起的開源標準
- 類似「AI 的 USB-C」
- 讓 AI 可以以標準化方式訪問數據、工具與 prompts
- 已被 Claude、ChatGPT、VS Code Copilot、Cursor 等採用

### 10.2 MCP 架構

```text
AI Client <-> MCP Server <-> Data Source
```

MCP Server 可提供：

- **Resources**：結構化資料
- **Tools**：可執行動作
- **Prompts**：專用工作流模板

### 10.3 在本產品中的應用場景

| 場景 | 描述 |
|------|------|
| 自然語言查詢 | 「我的美股佔比是多少？」 |
| 配置建議 | 「基於風險偏好，我該如何再平衡？」 |
| 交易分類 | 識別買入 / 賣出 / 股息 / 利息 |
| 月度審查 | 自動生成 portfolio review |
| 稅務估算 | 估算資本利得稅 |
| 異常檢測 | 持倉異常波動提醒 |

### 10.4 Kubera 的先例

- Kubera 是少數將 MCP / AI assistant 視為產品能力的金融產品
- 用戶可直接問淨值、跌幅、配置變動
- 關鍵做法是把 MCP server 盡量放在本地或受控環境

### 10.5 建議的 Portfolio MCP Server

#### Resources

```json
{
  "portfolio://summary": {},
  "portfolio://holdings": {},
  "portfolio://performance": {},
  "portfolio://allocation": {},
  "portfolio://dividends": {}
}
```

#### Tools

```json
{
  "add_transaction": {},
  "query_portfolio": {},
  "calculate_returns": {},
  "rebalance_suggest": {},
  "export_report": {}
}
```

#### Prompts

```json
{
  "portfolio-review": {},
  "tax-estimation": {},
  "risk-assessment": {}
}
```

---

## 11. 競品功能與定位對比

### 11.1 核心能力對比

| 平台 | 類型 | 帳戶聚合 | 投資追蹤 | 公司行動 | 稅務 / 成本基礎 | 另類資產 | MCP / AI |
|------|------|---------|---------|---------|----------------|---------|---------|
| Ghostfolio | 開源投資追蹤 | 無 | 強 | 弱 | 弱 | 中 | 無 |
| Maybe | 個人財務 | Plaid | 中 | 弱 | 弱 | 中 | 早期 AI |
| Sharesight | 投資績效 / 稅務 | 200+ broker | 強 | **最強** | **最強** | 中 | 無 |
| Kubera | 資產負債表 | 多聚合器 | 中 | 中 | 中 | **最強** | **強** |
| Monarch | 個人財務 | 13K+ 機構 | 中 | 弱 | 弱 | 中 | 中 |
| M1 Finance | 投資平台 | 自有體系 | 強 | 中 | 中 | 低 | 無 |
| Portfolio Visualizer | 分析工具 | 無 | 分析強 | 無 | 模型強 | 低 | AI 洞察 |
| Delta | 多資產 tracker | 有 | 強 | 中 | 中 | 強 | 強 |

### 11.2 Onboarding 與數據輸入對比

| 產品 | Time to first value | 手動輸入 | CSV 匯入 | Broker / Aggregator | 特色 |
|------|--------------------|---------|---------|---------------------|------|
| Ghostfolio | ~2 分鐘 | 強 | CSV / JSON | 無 | 極簡隱私 |
| Maybe | ~5 分鐘 | 中 | 有限 | Plaid | dashboard-first |
| Sharesight | ~3 分鐘 | 強 | 強 | 200+ brokers | tax residency 起步 |
| Kubera | ~5 分鐘 | 強 | AI Import | 多聚合器 | all-assets balance sheet |

### 11.3 本產品的差異化定位

| 差異化要素 | 說明 |
|-----------|------|
| 開源 + Self-hosted | 承接 Ghostfolio 優勢 |
| 全球多市場、多幣別 | 超越多數美國中心產品 |
| 公司行動從 Day 1 做對 | 直接打 Ghostfolio 弱點 |
| 成本基礎與稅務能力 | 向 Sharesight 靠攏 |
| 另類資產與資產負債表視角 | 借鑑 Kubera |
| MCP / AI 原生整合 | 中遠期高差異化能力 |
| 免費 / 自主掌控數據 | 明顯優於商業 SaaS 定價 |

---

## 12. 對本產品的設計啟示與建議

### 12.1 產品優先級建議

#### MVP（必做）

1. 手動交易錄入
2. CSV 匯入
3. 多幣別資產展示
4. 即時 / 延遲價格更新
5. Dashboard 總覽
6. 配置圖（資產類別 / 地區 / 幣別）
7. Average Cost
8. 公司行動：Split、Consolidation、Dividend

#### v1.1（應做）

1. DRIP
2. Return of Capital
3. Bonus Shares
4. Adjust Cost Base
5. FIFO + tax lot
6. Dividend / income report
7. Realized / unrealized gain report

#### v2（進階）

1. M&A / Spin-off 模型化支持
2. Broker CSV templates
3. PDF / OCR / AI Import
4. Exposure / contribution / drawdown reports
5. Family / advisor sharing

#### Phase 4+

1. MCP server
2. AI portfolio review
3. Tax estimation assistant
4. Rebalance suggestion
5. 異常檢測與自然語言查詢

### 12.2 建議的數據模型方向

- **整體模型**：Activity-centric
- **原因**：
  - 比單純 trade-centric 更彈性
  - 可自然容納股息、利息、費用、公司行動、轉倉
  - 可向下兼容 tax lots
  - 同時覆蓋績效與稅務需求

### 12.3 UI / UX 設計原則

1. **首屏必須顯示總淨值 / 漲跌幅 / 核心配置**
2. **Pie chart 不只是展示，而是 drill-down 入口**
3. **持倉表與圖表要形成上下聯動**
4. **允許 widget 化，但預設佈局要足夠好**
5. **多幣別必須明示 base currency 與原始幣別**
6. **所有關鍵數據要標註 last updated**
7. **避免信息過載，採用漸進式揭露**

### 12.4 建議的技術組合

```text
前端: Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui
圖表: Recharts（主）+ Nivo（Sunburst / Treemap）
後端: Next.js API Routes，後續可演進到 tRPC
ORM: Drizzle
DB: PostgreSQL
認證: Auth.js
部署: Docker Compose（self-hosted）或 Vercel + Supabase
AI: Python MCP Server / TypeScript MCP Server
```

### 12.5 最終結論

從兩份研究整合後看，**最佳產品方向不是再做一個「泛財務記帳工具」**，而是做一個：

> **開源、可自託管、支援多幣別與公司行動、兼顧成本基礎與未來 MCP 能力的投資組合 Dashboard。**

如果要選擇具體 benchmark：

- **前端體驗**：Monarch + M1
- **開源架構與隱私**：Ghostfolio
- **公司行動 / 稅務 / 成本基礎**：Sharesight
- **多資產與長期差異化**：Kubera

---

*本版本為整合稿，已去重並保留兩份來源中的關鍵細節與設計判斷。*
