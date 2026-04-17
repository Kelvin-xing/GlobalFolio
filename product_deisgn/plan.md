# Globalfolio — 實施計畫 (Implementation Plan)

> 本文件將 [prd_v2.md](prd_v2.md)、[tech_stack_v2.md](tech_stack_v2.md)、[decisions_v2.md](decisions_v2.md) 的需求拆解為可執行的開發任務。
> 僅涵蓋 **P0 (MVP)** 的完整實施細節，P1/P2/P3+ 以路線圖形式列出。

---

## 0. 文檔依賴關係

```
plan.md（本文件）
  ├── prd_v2.md          — 產品需求（功能定義、用戶故事、驗收標準）
  ├── tech_stack_v2.md   — 技術選型（框架、Schema、API、部署）
  ├── decisions_v2.md    — 架構決策（ADR-001 ~ ADR-006）
  └── desktop_research_v2.md — 競品研究（設計參考）
```

---

## 1. P0 MVP 範圍定義

根據 [prd_v2.md](prd_v2.md) §1.5 / §4 / §7，P0 MVP 必須交付：

| # | 功能模塊 | PRD 章節 | 驗收標準摘要 |
|---|---------|---------|------------|
| F1 | 專案腳手架 & 基礎設施 | tech_stack §5 | Monorepo 可運行、Docker Compose 一鍵啟動 |
| F2 | 數據庫 Schema & 遷移 | tech_stack §3.5-3.6 | 6 張表 + 8 索引，Drizzle 遷移可重放 |
| F3 | 用戶認證 | prd §3.10 / tech_stack §7 | OAuth 2.0 註冊/登入、Session 管理、CSRF 保護 |
| F4 | Onboarding 導引 | prd §3.13.1 | 3 步歡迎流程（幣別→帳戶→首筆持倉） |
| F5 | 帳戶 CRUD | prd §3.13.1 Step 2 | 新建/編輯/刪除帳戶 |
| F6 | 持倉手動新增/編輯 | prd §3.12.1 / §3.12.2 | Ticker 搜索補全 + 手動估值資產 |
| F7 | Dashboard 主頁 | prd §3.1 | 淨值卡片 + 2 Pie Charts + 持倉列表，< 3 秒載入 |
| F8 | 多幣別匯率 | prd §3.6 | ≥ 8 幣別轉換，匯率每日更新 |
| F9 | 淨值歷史走勢圖 | prd §3.2 | 折線圖 + 時間範圍切換 |
| F10 | 空狀態 & 範例數據 | prd §3.13.2 / §3.13.3 | 各模塊空狀態 + 一鍵載入/清除範例數據 |
| F11 | 深色/淺色主題 | prd §6.1 | 主題切換、持久化偏好 |
| F12 | 成本基礎 (平均法) | prd §3.12.4 | 買入/賣出時自動計算加權平均成本 |

**P0 明確排除**：CSV 匯入、交易記錄 CRUD、公司行動、多用戶功能、收益率計算、股息追蹤、配置分析。

---

## 2. 技術前置決策摘要

| 決策 | 選擇 | ADR |
|------|------|-----|
| ORM | Drizzle | ADR-001 |
| 狀態管理 | TanStack Query + Zustand | ADR-002 |
| 圖表庫 | Recharts | ADR-003 |
| API 層 | Next.js API Routes | ADR-004 |
| 數據模型 | Holding-centric | ADR-006 |

---

## 3. P0 任務分解

### Sprint 0: 專案初始化

#### T0.1 — Monorepo 腳手架
- [ ] 使用 `pnpm` 初始化 workspace
- [ ] 建立目錄結構：
  ```
  globalfolio/
  ├── apps/
  │   └── web/                 # Next.js 15 (App Router)
  ├── packages/
  │   └── shared/              # 共享型別、常數
  ├── docker-compose.yml
  ├── Caddyfile
  ├── .env.example
  └── pnpm-workspace.yaml
  ```
- [ ] 配置 TypeScript `paths` 別名（`@/`, `@shared/`）
- [ ] 配置 ESLint + Prettier

**產出**：`pnpm dev` 可啟動 Next.js dev server

#### T0.2 — Docker Compose 環境
- [ ] PostgreSQL 16 容器（含 volume 持久化）
- [ ] Redis 容器（匯率/報價快取）
- [ ] Caddy 反向代理（開發環境可選）
- [ ] `.env.example` 包含所有必要環境變數
- [ ] `docker-compose up -d` 一鍵啟動

**產出**：`docker compose up` 啟動完整開發環境

#### T0.3 — CI 基礎管線
- [ ] GitHub Actions：lint → type-check → test → build
- [ ] Husky + lint-staged：commit 前自動格式化

---

### Sprint 1: 數據層

#### T1.1 — Drizzle Schema 定義
- [ ] 定義 6 張表的 Drizzle Schema（對應 [tech_stack_v2.md](tech_stack_v2.md) §3.5）：
  - `users` — 用戶表
  - `accounts` — 帳戶表
  - `holdings` — 持倉表（Holding-centric，ADR-006）
  - `transactions` — 交易記錄表（含公司行動欄位，P0 僅用 buy/sell）
  - `exchange_rates` — 匯率快照表
  - `snapshots` — 淨值快照表
- [ ] 定義 8 個索引（`idx_holdings_user`, `idx_holdings_account` 等）
- [ ] `NUMERIC(30, 18)` 映射驗證 — 確認 Drizzle 返回 `string` 非 `number`
- [ ] 定義 Zod validation schemas（與 Drizzle schema 共享型別）

**檔案**：`apps/web/src/db/schema.ts`

#### T1.2 — 資料庫遷移
- [ ] 配置 `drizzle-kit`（`drizzle.config.ts`）
- [ ] 生成初始遷移：`pnpm drizzle-kit generate`
- [ ] 執行遷移：`pnpm drizzle-kit migrate`
- [ ] Seed script：插入測試用戶 + 範例數據

**檔案**：`apps/web/drizzle/` 遷移目錄

#### T1.3 — 數據存取層 (DAL)
- [ ] Drizzle client 初始化（連線池配置）
- [ ] 各表 CRUD 函數封裝：
  - `users`: `getUserById`, `updateUser`
  - `accounts`: `createAccount`, `getAccountsByUser`, `updateAccount`, `deleteAccount`
  - `holdings`: `createHolding`, `getHoldingsByUser`, `updateHolding`, `deleteHolding`
  - `snapshots`: `upsertSnapshot`, `getSnapshotsByUser`
  - `exchange_rates`: `upsertRate`, `getLatestRates`
- [ ] 金額計算工具函數（`string` → `Decimal` 運算 → `string`）

**檔案**：`apps/web/src/db/` 目錄

**依賴**：T0.1, T0.2 完成

---

### Sprint 2: 認證 & 佈局

#### T2.1 — NextAuth.js 認證
- [ ] 安裝配置 Auth.js v5
- [ ] OAuth Provider 配置（Google / GitHub — MVP 至少一個）
- [ ] Credentials Provider（email/password 備用）
- [ ] Session 策略：JWT + HttpOnly cookie
- [ ] Middleware 保護路由（`/dashboard/*` 需登入）
- [ ] 登入/註冊頁面 UI

**檔案**：`apps/web/src/auth.ts`, `apps/web/src/middleware.ts`

#### T2.2 — App Shell 佈局
- [ ] 安裝 shadcn/ui（`pnpm dlx shadcn@latest init`）
- [ ] 全域佈局：Header + Sidebar + Main content
  - Header：Logo "Globalfolio" + 用戶頭像 + 主題切換
  - Sidebar：Dashboard / 持倉 / 交易記錄 / 分析 / 股息 / 目標 / 設定
  - 響應式：桌面端固定 Sidebar，移動端 Sheet 抽屜
- [ ] `next-themes` 深色/淺色主題切換
- [ ] Zustand store：`useUIStore`（theme, sidebarOpen, baseCurrency）

**檔案**：
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/(dashboard)/layout.tsx`
- `apps/web/src/components/layout/`
- `apps/web/src/stores/ui-store.ts`

#### T2.3 — 設定頁面
- [ ] Base Currency 選擇器（USD / TWD / HKD / CNY / JPY / EUR / GBP / BRL）
- [ ] 地區多選
- [ ] 資產類別多選
- [ ] 偏好持久化到 `users` 表

**檔案**：`apps/web/src/app/(dashboard)/settings/page.tsx`

**依賴**：T1.1 ~ T1.3 完成

---

### Sprint 3: Onboarding & 帳戶

#### T3.1 — Onboarding 歡迎導引
- [ ] 3 步驟 Stepper UI（參考 prd §3.13.1 wireframe）：
  1. **基本設定**：base currency + 地區 + 資產類別
  2. **建立第一個帳戶**：名稱 / 機構 / 類型 / 幣別 / 地區（可跳過）
  3. **添加第一筆持倉**：手動輸入 / 範例數據 / CSV（P0 僅前兩項可用）
- [ ] 完成後設置 `users.onboarding_completed = true`（需在 Schema 加欄位）
- [ ] 已完成 onboarding 的用戶直接進 Dashboard

**檔案**：`apps/web/src/app/onboarding/page.tsx`

#### T3.2 — 帳戶管理 CRUD
- [ ] API Routes：
  - `POST /api/accounts` — 新建帳戶
  - `GET /api/accounts` — 列出當前用戶帳戶
  - `PUT /api/accounts/[id]` — 更新帳戶
  - `DELETE /api/accounts/[id]` — 刪除帳戶（需確認是否有持倉）
- [ ] 帳戶列表頁面（TanStack Table）
- [ ] 新建/編輯帳戶 Dialog（React Hook Form + Zod 驗證）
- [ ] Input sanitization + 權限檢查（只能操作自己的帳戶）

**檔案**：
- `apps/web/src/app/api/accounts/route.ts`
- `apps/web/src/app/(dashboard)/accounts/page.tsx`

**依賴**：T2.1 完成

---

### Sprint 4: 持倉核心

#### T4.1 — Ticker 搜索 API
- [ ] FMP API 整合：`/search?query=AAPL`
- [ ] 搜索結果快取（Redis，TTL 1 小時）
- [ ] 回退機制：FMP 不可用時 → 手動輸入模式
- [ ] API Route：`GET /api/search/ticker?q=xxx`

**檔案**：`apps/web/src/app/api/search/ticker/route.ts`

#### T4.2 — 報價取得 API
- [ ] FMP API：`/quote/AAPL` 取得當前報價
- [ ] 批量報價：`/quote/AAPL,GOOGL,MSFT`
- [ ] 報價快取（Redis，TTL 15 分鐘）
- [ ] API Route：`GET /api/quotes?tickers=AAPL,GOOGL`

**檔案**：`apps/web/src/app/api/quotes/route.ts`

#### T4.3 — 新增持倉（市場資產）
- [ ] API Route：`POST /api/holdings`
- [ ] 新增持倉表單：
  - 帳戶選擇器（下拉 + 「新建帳戶」快捷入口）
  - 資產類別選擇
  - Ticker 搜索補全（Combobox，使用 T4.1 API）
  - 數量、買入均價（自動帶入當前市價）、幣別（從 Ticker 推導）
  - 買入日期、費用、備註
- [ ] 提交時自動拉取報價 → 計算市值
- [ ] Zod 驗證：數量 > 0、價格 ≥ 0、幣別 ISO 4217

**檔案**：`apps/web/src/app/(dashboard)/holdings/new/page.tsx`

#### T4.4 — 新增持倉（手動估值資產）
- [ ] 與 T4.3 共用表單，`valuation_method = 'manual'` 時切換 UI：
  - 帳戶選填（nullable）
  - 資產名稱（自由文字，無 Ticker 搜索）
  - 當前價值、幣別
  - 估值方式：`manual` / `formula`
- [ ] `formula` 模式：定期存款公式欄位（本金、年利率、起始日）

#### T4.5 — 持倉列表 & 詳情
- [ ] API Route：`GET /api/holdings`（支援排序/篩選 query params）
- [ ] 持倉列表頁（TanStack Table）：
  - 欄位：名稱/Ticker、數量、市值、漲跌幅、佔比、操作（編輯/刪除）
  - 排序：市值、漲跌幅、資產類別
  - 篩選：按資產類別、按帳戶
- [ ] 編輯持倉 Dialog
- [ ] 刪除持倉確認

**檔案**：`apps/web/src/app/(dashboard)/holdings/page.tsx`

#### T4.6 — 成本基礎計算（加權平均法）
- [ ] 買入時：`new_cost_basis = (old_cost × old_qty + buy_price × buy_qty) / (old_qty + buy_qty)`
- [ ] 賣出時：成本基礎不變（加權平均法特性）
- [ ] 已實現損益 = `(sell_price - avg_cost) × sell_qty`
- [ ] 計算邏輯封裝為純函數，單元測試覆蓋

**檔案**：`packages/shared/src/calculations/cost-basis.ts`

**依賴**：T3.2 完成

---

### Sprint 5: Dashboard 主頁

#### T5.1 — 匯率 API 整合
- [ ] ExchangeRate API 整合：每日拉取 8 幣對匯率
- [ ] 存入 `exchange_rates` 表
- [ ] `node-cron` 定時任務：每日 UTC 00:00 更新
- [ ] API Route：`GET /api/exchange-rates`（返回當日所有匯率）
- [ ] 轉換工具函數：`convertCurrency(amount, from, to, rates)`

**檔案**：
- `apps/web/src/app/api/exchange-rates/route.ts`
- `apps/web/src/lib/cron/exchange-rates.ts`
- `packages/shared/src/calculations/currency.ts`

#### T5.2 — 淨值計算引擎
- [ ] 聚合當前用戶所有 holdings：
  - 按 base currency 匯總總資產
  - 按資產類別分組
  - 按幣別分組
- [ ] 與前一日 snapshot 比較 → 計算漲跌幅/百分比
- [ ] API Route：`GET /api/dashboard/summary`
- [ ] 返回結構：
  ```ts
  {
    totalAssets: string;
    totalLiabilities: string;
    netWorth: string;
    dailyChange: string;
    dailyChangePercent: string;
    byAssetClass: Record<string, string>;
    byCurrency: Record<string, string>;
  }
  ```

**檔案**：`apps/web/src/app/api/dashboard/summary/route.ts`

#### T5.3 — Dashboard 主頁 UI
- [ ] **淨值總覽卡片**：淨值數字 + 與前一日漲跌幅（綠/紅色）
- [ ] **2 個 Pie Charts**（Recharts）：
  1. 按資產大類分配
  2. 按幣別分配
- [ ] **持倉列表**（前 10 項，按市值排序）
- [ ] TanStack Query hooks：`useDashboardSummary`, `useHoldings`
- [ ] 載入骨架屏 (Skeleton)
- [ ] 驗收：首屏數據載入 < 3 秒

**檔案**：`apps/web/src/app/(dashboard)/page.tsx`

#### T5.4 — Pie Chart 互動
- [ ] 點擊 Pie Chart 切片 → 展開該類別持倉明細
- [ ] Tooltip：顯示類別名稱、金額、佔比
- [ ] 動畫過渡

**依賴**：T4.5, T5.1 完成

---

### Sprint 6: 走勢圖 & 快照

#### T6.1 — 淨值快照定時任務
- [ ] `node-cron` 每日 UTC 23:59 執行：
  1. 計算當前淨值（複用 T5.2 邏輯）
  2. `UPSERT` 到 `snapshots` 表
  3. 記錄 `breakdown`（by_class, by_currency, by_region）
- [ ] 手動觸發快照 API（用於 debug / 初始化歷史）

**檔案**：`apps/web/src/lib/cron/snapshots.ts`

#### T6.2 — 淨值歷史走勢圖
- [ ] API Route：`GET /api/dashboard/history?range=1Y`
- [ ] 時間範圍選擇器：1D / 1W / 1M / 3M / 6M / YTD / 1Y / 5Y / ALL
- [ ] Recharts Line Chart：
  - X 軸：日期
  - Y 軸：淨值（base currency）
  - Tooltip：日期 + 淨值 + 當日漲跌
- [ ] 空狀態：少於 2 天數據時顯示「至少需要 2 天數據才能顯示走勢」

**檔案**：`apps/web/src/components/charts/net-worth-chart.tsx`

**依賴**：T5.2 完成

---

### Sprint 7: 空狀態 & 收尾

#### T7.1 — 空狀態設計
- [ ] 各模塊空狀態 UI（對應 prd §3.13.2）：
  - 淨值卡片：$0.00 + CTA
  - Pie Chart：虛線圓環 + 「暫無數據」
  - 持倉列表：插畫 + 3 個入口按鈕（手動 / CSV-disabled / 範例數據）
  - 走勢圖：平坦虛線 + 提示

#### T7.2 — 範例數據模式
- [ ] 預設範例組合（prd §3.13.3）：
  - 70% 美股 ETF (VOO, QQQ, VTI)
  - 20% 美國國債 ETF (TLT, SHY)
  - 10% 現金 (USD, JPY)
- [ ] API Route：`POST /api/demo/load` / `DELETE /api/demo/clear`
- [ ] UI 標籤：「範例數據」badge
- [ ] 一鍵清除確認 Dialog

**檔案**：`apps/web/src/lib/demo-data.ts`

#### T7.3 — 報價自動更新
- [ ] `node-cron` 定時拉取所有持倉的最新報價（FMP 批量 API）
- [ ] 更新 `holdings.last_price` + `last_price_at`
- [ ] 每日執行一次（盤後）
- [ ] 超出 FMP 免費額度時降級為手動刷新

#### T7.4 — 響應式 & 主題打磨
- [ ] 桌面端 (≥1280px)：固定 Sidebar
- [ ] 平板端 (768-1279px)：可收合 Sidebar
- [ ] 移動端 (<768px)：Bottom Nav 或 Sheet Sidebar
- [ ] 深色/淺色主題全面檢查（圖表顏色、卡片背景）
- [ ] Lighthouse Performance ≥ 90

#### T7.5 — 部署 & 文檔
- [ ] `Dockerfile`：Multi-stage build（Next.js standalone output）
- [ ] `docker-compose.yml`：web + postgres + redis + caddy
- [ ] `Caddyfile`：反向代理 + 自動 TLS
- [ ] `README.md`：安裝步驟、環境變數說明、截圖
- [ ] `.env.example`：所有必要環境變數及說明

**依賴**：所有前置 Sprint 完成

---

## 4. 目錄結構（P0 完成時）

```
globalfolio/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   ├── login/page.tsx
│       │   │   │   └── register/page.tsx
│       │   │   ├── (dashboard)/
│       │   │   │   ├── layout.tsx              # Dashboard shell (sidebar + header)
│       │   │   │   ├── page.tsx                # Dashboard 主頁 (F7)
│       │   │   │   ├── holdings/
│       │   │   │   │   ├── page.tsx            # 持倉列表 (T4.5)
│       │   │   │   │   └── new/page.tsx        # 新增持倉 (T4.3/T4.4)
│       │   │   │   ├── accounts/page.tsx       # 帳戶管理 (T3.2)
│       │   │   │   └── settings/page.tsx       # 設定 (T2.3)
│       │   │   ├── onboarding/page.tsx         # Onboarding 導引 (T3.1)
│       │   │   ├── api/
│       │   │   │   ├── accounts/route.ts
│       │   │   │   ├── holdings/route.ts
│       │   │   │   ├── quotes/route.ts
│       │   │   │   ├── search/ticker/route.ts
│       │   │   │   ├── exchange-rates/route.ts
│       │   │   │   ├── dashboard/
│       │   │   │   │   ├── summary/route.ts
│       │   │   │   │   └── history/route.ts
│       │   │   │   └── demo/route.ts
│       │   │   ├── layout.tsx                  # Root layout (providers)
│       │   │   └── globals.css
│       │   ├── auth.ts                         # NextAuth 配置
│       │   ├── middleware.ts                    # Route protection
│       │   ├── db/
│       │   │   ├── schema.ts                   # Drizzle schema
│       │   │   ├── index.ts                    # DB client
│       │   │   ├── queries/                    # DAL 函數
│       │   │   │   ├── accounts.ts
│       │   │   │   ├── holdings.ts
│       │   │   │   ├── snapshots.ts
│       │   │   │   └── exchange-rates.ts
│       │   │   └── seed.ts
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── header.tsx
│       │   │   │   ├── sidebar.tsx
│       │   │   │   └── mobile-nav.tsx
│       │   │   ├── charts/
│       │   │   │   ├── pie-chart.tsx
│       │   │   │   └── net-worth-chart.tsx
│       │   │   ├── holdings/
│       │   │   │   ├── holding-form.tsx
│       │   │   │   ├── ticker-search.tsx
│       │   │   │   └── holdings-table.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── net-worth-card.tsx
│       │   │   │   └── empty-state.tsx
│       │   │   └── ui/                         # shadcn/ui 組件
│       │   ├── hooks/
│       │   │   ├── use-dashboard-summary.ts
│       │   │   ├── use-holdings.ts
│       │   │   └── use-exchange-rates.ts
│       │   ├── stores/
│       │   │   └── ui-store.ts                 # Zustand
│       │   ├── lib/
│       │   │   ├── cron/
│       │   │   │   ├── exchange-rates.ts
│       │   │   │   ├── quotes.ts
│       │   │   │   └── snapshots.ts
│       │   │   ├── api/
│       │   │   │   ├── fmp.ts                  # FMP API client
│       │   │   │   └── exchange-rate.ts        # 匯率 API client
│       │   │   └── demo-data.ts
│       │   └── types/
│       │       └── index.ts
│       ├── drizzle/                            # 遷移檔案
│       ├── drizzle.config.ts
│       ├── tailwind.config.ts
│       ├── next.config.ts
│       └── package.json
├── packages/
│   └── shared/
│       └── src/
│           ├── calculations/
│           │   ├── cost-basis.ts
│           │   ├── currency.ts
│           │   └── net-worth.ts
│           ├── constants/
│           │   ├── currencies.ts
│           │   ├── asset-classes.ts
│           │   └── regions.ts
│           └── types/
│               └── index.ts
├── docker-compose.yml
├── Caddyfile
├── .env.example
├── pnpm-workspace.yaml
└── README.md
```

---

## 5. 任務依賴圖

```
T0.1 ──→ T0.2 ──→ T0.3
  │         │
  ▼         ▼
T1.1 ──→ T1.2 ──→ T1.3
                     │
              ┌──────┴──────┐
              ▼             ▼
           T2.1          T2.2 ──→ T2.3
              │
              ▼
           T3.1 ──→ T3.2
                       │
         ┌─────────────┤
         ▼             ▼
      T4.1 ──→ T4.3  T4.5
      T4.2 ──→ T4.4  T4.6
                  │
         ┌───────┤
         ▼       ▼
      T5.1    T5.2 ──→ T5.3 ──→ T5.4
                          │
                          ▼
                       T6.1 ──→ T6.2
                                  │
                                  ▼
                    T7.1, T7.2, T7.3, T7.4, T7.5
```

**可並行的任務**：
- T2.1 (認證) 與 T2.2 (佈局) 可並行
- T4.1 (Ticker 搜索) 與 T4.2 (報價) 可並行
- T5.1 (匯率) 與 T4.x 可並行
- T7.1 ~ T7.5 大部分可並行

---

## 6. 關鍵技術實現備忘

### 6.1 金額精度處理
- DB：`NUMERIC(30,18)` — Drizzle 返回 `string`
- 前端運算：使用 `decimal.js` 或 `big.js`，**禁止**直接用 JavaScript `number` 做金額運算
- API 傳輸：所有金額欄位序列化為 `string`
- 顯示：`Intl.NumberFormat` 格式化

### 6.2 TanStack Query 快取策略
| 資源 | staleTime | gcTime | refetchOnWindowFocus |
|------|-----------|--------|---------------------|
| Dashboard summary | 1 min | 5 min | true |
| Holdings list | 30 sec | 5 min | true |
| Exchange rates | 1 hour | 24 hours | false |
| Ticker search | 1 hour | 1 hour | false |
| Quotes | 15 min | 30 min | true |

### 6.3 安全清單（P0 必須）
- [ ] 所有 API Route 驗證 `session.user.id`
- [ ] 所有 DB 查詢包含 `WHERE user_id = ?`（多租戶隔離）
- [ ] Input sanitization（Zod schema 驗證所有輸入）
- [ ] CSRF token（NextAuth 內建）
- [ ] Rate limiting（API Routes，使用 `next-rate-limit` 或自建）
- [ ] 環境變數：API keys 不提交到 Git
- [ ] Content Security Policy headers
- [ ] SQL injection 防護：Drizzle 參數化查詢（內建）

### 6.4 性能預算
| 指標 | 目標 | 測量工具 |
|------|------|---------|
| JS Bundle (gzipped) | < 300KB | `next build` 輸出 |
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Dashboard 載入 | < 3s | Chrome DevTools (WiFi 50Mbps) |
| Lighthouse Performance | ≥ 90 | Lighthouse |

---

## 7. P1 / P2 / P3+ 路線圖概覽

> 詳細任務分解在各階段啟動時補充。

### P1: 核心擴展
| 模塊 | 主要任務 |
|------|---------|
| CSV 匯入 | 欄位映射 UI、重複檢測、錯誤處理 |
| 交易記錄 | CRUD、搜索篩選、交易歷史 |
| 公司行動 | Stock split / dividend 手動記錄 |
| 多用戶功能 | 邀請 / 共享 / 角色權限 (Admin/Member/Viewer) |
| 收益率引擎 | HPR / CAGR / TWR / MWR 計算 |
| 股息追蹤 | 日曆、年度統計、殖利率 |
| 配置分析 | 當前 vs 目標、再平衡建議、Nivo Sunburst |
| API 遷移 | API Routes → tRPC（ADR-004） |

### P2: 進階功能
| 模塊 | 主要任務 |
|------|---------|
| 帳戶同步 | Plaid (美國) / Open Banking (歐洲) |
| 自動報價 | 定時報價更新、多市場覆蓋 |
| 成本基礎進階 | FIFO、Tax Lot 追蹤 |
| 稅務報表 | 已實現損益、資本利得稅估算 |
| 目標規劃 | 退休/買房目標設定 + 進度 |
| 公司行動自動偵測 | 市場數據 API 自動檢測 + 通知 |

### P3+: 遠期
| 模塊 | 主要任務 |
|------|---------|
| MCP Server | Python SDK、AI 查詢投資組合 (ADR-005) |
| 衍生品 | 需單獨 PRD（prd §3.15） |
| AI Review | AI portfolio review、tax estimation |

---

## 8. 風險與緩解

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| FMP API 免費額度用盡 | 報價無法更新 | 快取策略 + 手動刷新降級 + Yahoo Finance fallback |
| Drizzle NUMERIC 精度問題 | 金額計算錯誤 | Sprint 1 即驗證；寫單元測試覆蓋邊界案例 |
| NextAuth v5 breaking changes | 認證系統不穩 | 鎖定版本、參考官方遷移指南 |
| shadcn/ui 組件不足 | 需自建組件 | Radix UI 原語可直接使用 |
| 單人開發瓶頸 | 進度延遲 | 嚴格控制 P0 範圍，不做鍍金 |

---

*本文件隨開發進展更新。每個 Sprint 完成後標記任務狀態。*
