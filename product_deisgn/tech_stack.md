# 技術棧文檔 (Tech Stack)

## 1. 開發階段規劃

### Phase 1: 最小 Web App (MVP)
| 組件 | 技術 | 說明 |
|------|------|------|
| 前端 | Next.js 15 + shadcn/ui | Dashboard、Onboarding、CRUD 表單 |
| 後端 | Next.js API Routes | RESTful API |
| 數據庫 | PostgreSQL | ACID、JSON 支援、NUMERIC 精度 |
| ORM | Drizzle | 見 [decisions.md](decisions.md) ADR-001 |
| 認證 | NextAuth.js (Auth.js) | OAuth 2.0 + 2FA (TOTP) |
| 部署 | Docker Compose | Self-hosted |

> **Phase 1 不含 Notion**。跳過 Notion MVP，直接在目標技術棧上構建最小 Web App。Notion 相關設計保留於 [desktop_research.md](desktop_research.md) §10 作為歷史參考。

---

### Phase 2+: Web App 全棧

## 2. 前端技術棧

| 組件 | 技術 | 理由 |
|------|------|------|
| 框架 | **Next.js 15** (App Router) | SSR/SSG、API Routes、成熟生態 |
| 語言 | **TypeScript** | 金融數據需要嚴格型別安全 |
| UI 組件庫 | **shadcn/ui** | 可定制、無鎖定、現代設計 |
| CSS | **Tailwind CSS v4** | 快速開發、深色/淺色主題原生支援 |
| 圖表 | **Recharts** 或 **Tremor** | React 原生、支援 Pie/Line/Area/Treemap |
| 狀態管理 | **TanStack Query** (服務器狀態) + **Zustand** (客戶端 UI 狀態) | TanStack Query 負責 API 數據快取/同步，Zustand 負責主題/幣別選擇等純 UI 狀態（見 [decisions.md](decisions.md) ADR-002） |
| 表格 | **TanStack Table** | 排序/篩選/分頁/虛擬化 |
| 表單 | **React Hook Form** + **Zod** | 驗證金融數據輸入 |
| 主題 | **next-themes** | 深色/淺色切換 |

### 圖表庫對比
| 庫 | Pie Chart | 互動性 | 金融適用性 | 推薦 |
|---|---|---|---|---|
| Recharts | ✅ | 中等 | 通用，可定制 | ⭐ MVP 首選 |
| Tremor | ✅ | 良好 | Dashboard 專用 | ⭐ 備選 |
| Nivo | ✅ | 優秀 | Sunburst/Treemap 強 | 配置分析用 |
| Lightweight Charts | ❌ | 優秀 | K線/走勢專用 | 股票走勢用 |
| ECharts | ✅ | 優秀 | 功能最全 | 重量級備選 |

---

## 3. 後端技術棧

| 組件 | 技術 | 理由 |
|------|------|------|
| API | **Next.js API Routes** (MVP) → **tRPC** | MVP 直接用 API Routes，穩定後遷移 tRPC 獲得端到端型別安全（見 [decisions.md](decisions.md) ADR-004） |
| ORM | **Drizzle** (推薦) | 金融場景需要 Decimal 精度，Drizzle 可以直接映射 PostgreSQL `numeric` 類型，避免浮點數誤差（見 [decisions.md](decisions.md) ADR-001） |
| 數據庫 | **PostgreSQL** | 金融數據 ACID、JSON 支援、成熟穩定 |
| 快取 | **Redis** (可選) | 匯率/股價快取 |
| 認證 | **NextAuth.js (Auth.js)** | OAuth、2FA 支援 |
| 任務調度 | **node-cron** 或 **Trigger.dev** | 定時更新匯率/報價 |

### 3.5 PostgreSQL Schema 草稿

```sql
-- 用戶表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  base_currency CHAR(3) NOT NULL DEFAULT 'USD',  -- 基準幣別
  regions TEXT[],                                  -- 持有資產地區
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 帳戶表
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  institution TEXT,
  type TEXT NOT NULL,        -- checking, savings, brokerage, crypto, etc.
  currency CHAR(3) NOT NULL, -- ISO 4217
  region TEXT,               -- US, HK, CN, JP, EU, UK, BR
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 持倉表
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  account_id UUID REFERENCES accounts(id),  -- nullable：房產/硬體錢包等不屬於任何機構帳戶
  name TEXT NOT NULL,
  ticker TEXT,
  asset_class TEXT NOT NULL,  -- stock, etf, bond, fund, crypto, cash, insurance, real_estate, other
  quantity NUMERIC(30, 18) NOT NULL,  -- 18 位小數支援加密貨幣精度
  cost_basis NUMERIC(30, 18),
  currency CHAR(3) NOT NULL,
  valuation_method TEXT NOT NULL DEFAULT 'market',  -- market（自動報價）/ manual（手動估值）/ formula（公式計算）
  last_price NUMERIC(30, 18),
  last_price_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 交易記錄表（含公司行動）
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID REFERENCES holdings(id),
  type TEXT NOT NULL,
  -- 一般類型：buy, sell, dividend, interest, transfer
  -- 公司行動：split, reverse_split, drip, spinoff, merger, return_of_capital, bonus
  quantity NUMERIC(30, 18),
  price NUMERIC(30, 18),
  amount NUMERIC(30, 18) NOT NULL,
  fee NUMERIC(30, 18) DEFAULT 0,
  currency CHAR(3) NOT NULL,
  -- 公司行動專用欄位
  ratio_from NUMERIC,      -- 拆股舊比例（如 1:10 的 1）
  ratio_to NUMERIC,        -- 拆股新比例（如 1:10 的 10）
  executed_at TIMESTAMPTZ NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 匯率快照表
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  base_currency CHAR(3) NOT NULL,
  quote_currency CHAR(3) NOT NULL,
  rate NUMERIC(30, 18) NOT NULL,
  snapshot_date DATE NOT NULL,
  UNIQUE(base_currency, quote_currency, snapshot_date)
);

-- 淨值快照表（用於歷史走勢圖）
CREATE TABLE snapshots (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  snapshot_date DATE NOT NULL,
  total_assets NUMERIC(30, 18),
  total_liabilities NUMERIC(30, 18),
  net_worth NUMERIC(30, 18),
  breakdown JSONB, -- { by_class: {}, by_currency: {}, by_region: {} }
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);
```

### 3.6 Schema 設計說明

- **`account_id` 可為 NULL**：房產、硬體冷錢包、保單等資產不屬於任何金融機構帳戶。`holdings.account_id` 允許 NULL，此類資產直接掛在 `user_id` 下。
- **`NUMERIC(30, 18)` 精度**：加密貨幣（如 ETH wei = 10⁻¹⁸）需要極高小數精度。使用 NUMERIC(30,18) 避免浮點誤差。
- **`valuation_method` 欄位**：區分自動報價（`market`）、手動估值（`manual`）、公式計算（`formula`，如定期存款）三種定價模式。
- **公司行動欄位**：`transactions.type` 擴展支援 `split`, `reverse_split`, `drip` 等公司行動類型；`ratio_from`/`ratio_to` 記錄拆股比例。
- **多用戶**：所有主要表都包含 `user_id` 外鍵，支援多用戶隔離。

---

## 4. 數據源 API

### 市場數據
| 數據類型 | API | 費用 | 備註 |
|---------|-----|------|------|
| 美股報價 | **Financial Modeling Prep (FMP)** | 免費/付費 | ⭐ **主要數據源** — 官方 API，穩定可靠。免費層 250 次/天 |
| 美股報價 (備用) | **Yahoo Finance (unofficial)** | 免費 | ℹ️ **備用數據源** — 非官方，可能隨時被封鎖，不保證 SLA。僅用作 FMP 不可用時的 fallback |
| 全球股票 | **Alpha Vantage** | 免費 (25次/天) | 有限額度 |
| 即時報價 | **Polygon.io** | $29/mo+ | 專業級 |
| 匯率 | **ExchangeRate API** / **Open Exchange Rates** | 免費/付費 | 多幣別 |
| 加密貨幣 | **CoinGecko API** | 免費 | 全面的加密數據 |
| 債券 | **FRED API** (美國國債) | 免費 | 美國聯儲數據 |

### 帳戶同步
| 數據類型 | API | 費用 | 覆蓋 |
|---------|-----|------|------|
| 美國銀行/券商 | **Plaid** | 按連接數計費 | 美國 12,000+ 機構 |
| 券商交易 | **Interactive Brokers API** | 免費 (需帳戶) | 全球多市場 |
| 歐洲銀行 | **TrueLayer** / **Nordigen** | 免費/付費 | PSD2 Open Banking |
| 加密交易所 | **CCXT** (library) | 免費 | 100+ 交易所 |
| 手動/CSV | 自建 Parser | — | 通用 |

### 4.1 API 用量預算估算

> 確保免費層級能滿足 MVP 階段的日常使用需求。

**假設場景**：1 個用戶，50 筆持倉（含不同 Ticker），7 種幣對，每日更新 1 次。

| API | 免費額度 | 每日估算用量 | 餘裕 |
|-----|---------|------------|------|
| FMP (股票報價) | 250 次/天 | ~50 次（每 Ticker 1 次）+ 10 次搜索 ≈ 60 次 | ✅ 充裕（~190 次餘裕） |
| ExchangeRate API (匯率) | 1,500 次/月 ≈ 50 次/天 | ~7 次（7 個幣對，每日更新 1 次） | ✅ 充裕 |
| CoinGecko (加密) | 30 次/分鐘 | ~10 次（10 個加密 Ticker） | ✅ 充裕 |
| Alpha Vantage (全球) | 25 次/天 | 備用 — 僅 FMP 不覆蓋的市場 | ⚠️ 有限 |

**策略**：
- 報價快取 15 分鐘（非即時交易，15 分鐘延遲可接受）
- 匯率每日更新 1 次（盤後收盤價）
- 批量請求：FMP 支持一次查詢多個 Ticker（`/quote/AAPL,GOOGL,MSFT`）
- 超出免費額度時降級為手動刷新（不自動拉取）

---

## 5. 部署架構

### Self-hosted (推薦)
```
┌─────────────────────────────────────┐
│  Docker Compose                     │
│  ┌─────────────┐                      │
│  │ Caddy        │  ← 反向代理、自動 TLS │
│  └──────┬──────┘                      │
│         │                              │
│  ┌─────┴───────┐ ┌───────────────┐ │
│  │ Next.js App  │ │  PostgreSQL   │ │
│  │ (Frontend +  │ │  (encrypted   │ │
│  │  API)        │ │   at rest)    │ │
│  └──────┬──────┘ └───────┬───────┘ │
│         │                │         │
│  ┌──────┴──────┐ ┌───────┴───────┐ │
│  │ Redis Cache │ │  MCP Server   │ │
│  │ (匯率/報價)  │ │  (Python SDK) │ │
│  └─────────────┘ └───────────────┘ │
└─────────────────────────────────────┘
```

### Monorepo 目錄結構
```
investment-portfolio-dashboard/
├── apps/
│   ├── web/              # Next.js 15 前端 + API Routes
│   └── mcp-server/       # Python MCP Server (Phase 4)
├── packages/
│   └── shared/           # 共享型別、常數、工具函數
├── docker-compose.yml
├── Caddyfile
└── README.md
```

### 雲端部署 (替代方案)
| 組件 | 服務 | 費用 |
|------|------|------|
| 前端 + API | **Vercel** | 免費 (Hobby) |
| 數據庫 | **Supabase** 或 **Neon** | 免費 (小規模) |
| 快取 | **Upstash Redis** | 免費 (10K req/day) |
| 定時任務 | **Vercel Cron** 或 **Trigger.dev** | 免費/付費 |

---

## 6. MCP Server 設計

> **語言決策**：採用 **Python SDK** 開發 MCP Server，利用 Python 豐富的金融數據處理生態（pandas, numpy），與主流金融 API SDK 相容性佳（見 [decisions.md](decisions.md) ADR-005）。此為 Phase 4 功能。

```
MCP Server (本地運行)
├── Resources
│   ├── portfolio://summary       → 投資組合總覽
│   ├── portfolio://holdings      → 持倉列表
│   ├── portfolio://performance   → 收益率數據
│   └── portfolio://allocation    → 配置分析
├── Tools
│   ├── add_transaction()         → 新增交易記錄
│   ├── query_portfolio()         → 自然語言查詢
│   ├── calculate_returns()       → 計算報酬率
│   └── rebalance_suggest()       → 再平衡建議
└── Prompts
    ├── portfolio-review          → 定期審視投資組合
    └── tax-estimation            → 稅務估算
```

---

## 7. 安全架構

| 層級 | 措施 |
|------|------|
| 傳輸層 | TLS 1.3、HTTPS only |
| 應用層 | CSRF protection、Rate limiting、Input sanitization |
| 數據層 | AES-256 encryption at rest、Column-level encryption for PII |
| 認證 | OAuth 2.0 + TOTP 2FA、Session management with HttpOnly cookies |
| API Keys | 環境變數存儲、不提交到 Git |
| 備份 | 定期加密備份、異地存儲 |

---

## 8. 可用 Skills

以下 Skills 可在開發過程中使用：

> ⚠️ **安全注意**：僅推薦使用 `tailwind-v4-shadcn`（安裝量 2.7K，來源可靠）。其他 Skills 安裝量 < 100，來源信譽未經驗證，使用前請審查其代碼。

| Skill | 安裝命令 | 用途 |
|-------|---------|------|
| Tailwind v4 + shadcn | `npx skills add jezweb/claude-skills@tailwind-v4-shadcn -g -y` | UI 組件開發 (2.7K installs) |
| Data Visualizer | `npx skills add daffy0208/ai-dev-standards@data-visualizer -g -y` | 圖表可視化 (488 installs) |
| Tremor Design System | `npx skills add dodatech/approved-skills@tremor-design-system -g -y` | Dashboard UI (72 installs) |


---

## 9. 可參考的開源專案

| 專案 | Stars | 技術棧 | 參考價值 |
|------|-------|--------|----------|
| [ghostfolio](https://github.com/ghostfolio/ghostfolio) | 8.1K | Angular, NestJS, Prisma, PostgreSQL | **最相關** — 投資組合追蹤、性能分析、多資產 |
| [maybe](https://github.com/maybe-finance/maybe) | 54K | Ruby on Rails, Hotwire, PostgreSQL | 全功能個人財務、淨值追蹤、架構參考 |
| [firefly-iii](https://github.com/firefly-iii/firefly-iii) | 23K | PHP, Laravel, Docker | 自託管、多幣別、預算管理 |
| [shadcn-openai-plaid-dashboard](https://github.com/cameronking4/shadcn-openai-plaid-dashboard) | 50 | Next.js, shadcn/ui, Plaid, OpenAI | **技術棧最接近** — 現代前端 + Plaid |
| [anychart investment-portfolio-dashboard](https://github.com/anychart-solutions/investment-portfolio-dashboard) | 51 | HTML, JS, AnyChart | 純前端 Dashboard 參考 |

---

## 10. 開發工具

| 工具 | 用途 |
|------|------|
| VS Code + GitHub Copilot | 主要 IDE |
| Docker / Docker Compose | 本地開發 + 部署 |
| ESLint + Prettier | 代碼品質 |
| Vitest | 單元測試 |
| Playwright | E2E 測試 |
| GitHub Actions | CI/CD |
