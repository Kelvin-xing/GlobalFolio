# Globalfolio — 實施計畫 v2 (Implementation Plan v2)

> 本文件將 [prd_v2.md](prd_v2.md)、[tech_stack_v2.md](tech_stack_v2.md)、[decisions_v2.md](decisions_v2.md) 的需求拆解為可執行的開發任務。
> **v2 涵蓋 P0 → P3+ 全部優先級的完整實施細節。**
> P0 狀態反映截至 2026-04-17 的實際部署狀態。

---

## 0. 文檔依賴關係

```
plan_v2.md（本文件）
  ├── prd_v2.md          — 產品需求（功能定義、用戶故事、驗收標準）
  ├── tech_stack_v2.md   — 技術選型（框架、Schema、API、部署）
  ├── decisions_v2.md    — 架構決策（ADR-001 ~ ADR-006）
  └── desktop_research_v2.md — 競品研究（設計參考）
```

---

## 1. 全局優先級與範圍

| 階段 | 定義 | 狀態 |
|------|------|------|
| **P0 MVP** | 核心功能，無此無法交付價值 | ✅ 已部署 (Vercel + Neon) |
| **P1 核心擴展** | 重要補充，MVP 後緊接 | 🔲 待開發 |
| **P2 進階功能** | 提升競爭力，可延後 | 🔲 待開發 |
| **P3+ 遠期** | 需單獨 PRD | 🔲 規劃中 |

---

## 2. P0 MVP — 已完成狀態確認

> 以下為 P0 範圍。✅ = 已實現，⚠️ = 部分實現，🔲 = 待補齊。

| # | 功能 | PRD | 狀態 | 備註 |
|---|------|-----|------|------|
| F1 | Monorepo + 部署 | tech §5 | ✅ | pnpm workspace，Vercel + Neon |
| F2 | DB Schema (9 張表 + 索引) | tech §3.5 | ✅ | Drizzle + Neon Serverless |
| F3 | 用戶認證 (GitHub + Google OAuth) | prd §3.10 | ✅ | Auth.js v5，trustHost，JWT |
| F4 | Onboarding 歡迎導引 (3 步) | prd §3.13.1 | ✅ | 幣別→帳戶→持倉 |
| F5 | 帳戶 CRUD | prd §3.13.1 | ✅ | API Routes + UI |
| F6 | 持倉手動 CRUD (市場資產 + 手動估值) | prd §3.12.1-2 | ✅ | Ticker 搜索 + 市值計算 |
| F7 | Dashboard 主頁 (淨值 + Pie + 列表) | prd §3.1 | ✅ | Recharts |
| F8 | 多幣別匯率 (≥8 幣別) | prd §3.6 | ✅ | ExchangeRate API，每日 Cron |
| F9 | 淨值歷史走勢圖 | prd §3.2 | ✅ | Snapshots 表 + Recharts Line |
| F10 | 空狀態 + 範例數據模式 | prd §3.13.2-3 | ✅ | Demo data API |
| F11 | 深色/淺色主題 | prd §6.1 | ✅ | next-themes + Zustand |
| F12 | 成本基礎 (加權平均法) | prd §3.12.4 | ✅ | shared/calculations |

### P0 待補齊項目

| # | 項目 | 描述 | 優先度 |
|---|------|------|--------|
| P0-Fix-1 | Drizzle 遷移腳本 | 目前 SQL 直接在 Neon 執行，需建立 `drizzle/` 遷移目錄使 schema 可重放 | 高 |
| P0-Fix-2 | Rate limiting | API Routes 缺少限速，OWASP Top 10 (A04) | 高 |
| P0-Fix-3 | FMP 報價自動更新 Cron | holdings.last_price 需定時刷新 | 中 |
| P0-Fix-4 | 每日快照 Cron 驗證 | vercel.json cron 已配置，需確認實際執行 | 中 |
| P0-Fix-5 | 移動端響應式 | 基礎可用，需驗收 375px 寬度 | 低 |

---

## 3. P1 — 核心擴展

> **P1 啟動條件**：P0 Fix 1-2 完成，Vercel 部署穩定運行 ≥ 1 週。

### P1 範圍定義

| # | 功能模塊 | PRD 章節 | 驗收標準摘要 |
|---|---------|---------|------------|
| P1-F1 | 交易記錄 CRUD | prd §3.7 | 完整的買/賣/股息/轉帳記錄 + 搜索篩選 |
| P1-F2 | CSV 匯入 | prd §3.12.3 | 欄位映射 UI + 重複檢測 + 逐行錯誤處理 |
| P1-F3 | 公司行動 (Stock Split / Dividend) | prd §3.14 | 手動記錄，系統自動調整持倉 |
| P1-F4 | 收益率計算引擎 | prd §3.4 | HPR / CAGR / TWR / MWR，與 S&P 500 對比 |
| P1-F5 | 股息追蹤 | prd §3.5 | 股息日曆 + 年度統計 + 殖利率 |
| P1-F6 | 資產配置分析 | prd §3.3 | 當前 vs 目標 + 再平衡建議 + Sunburst |
| P1-F7 | 多用戶 & 權限 | prd §3.10 | Admin / Member / Viewer 角色 |
| P1-F8 | 2FA (TOTP) | prd §3.10 | Google Authenticator 相容 |

---

### Sprint P1-1: 交易記錄系統

#### P1-T1.1 — 交易記錄 API
- [ ] API Routes：
  - `GET /api/holdings/[id]/transactions` — 列出某持倉的交易記錄（支援 pagination, filter by type/date）
  - `POST /api/holdings/[id]/transactions` — 新增交易記錄
  - `PUT /api/holdings/[id]/transactions/[txId]` — 更新交易記錄
  - `DELETE /api/holdings/[id]/transactions/[txId]` — 刪除交易記錄（需重算成本基礎）
- [ ] 交易類型支援：`buy`, `sell`, `dividend`, `interest`, `transfer`
- [ ] 每次 CRUD 後觸發成本基礎重算
- [ ] 輸入驗證：Zod schema，量 > 0、金額 > 0、日期不能是未來

**檔案**：`apps/web/src/app/api/holdings/[id]/transactions/route.ts`

#### P1-T1.2 — 交易記錄 UI
- [ ] 交易記錄頁面：TanStack Table
  - 欄位：日期、類型、Ticker/名稱、數量、單價、金額、費用、備註
  - 篩選：按類型、按帳戶、按日期範圍
  - 搜索：Ticker / 名稱關鍵字
  - 排序：日期（預設降序）、金額
- [ ] 新增交易 Dialog（React Hook Form + Zod）：
  - 持倉選擇（Combobox，從已有持倉選）
  - 交易類型、日期、數量、單價（自動帶入最新報價）、費用、備註
- [ ] 編輯/刪除交易確認 Dialog
- [ ] 刪除後提示「成本基礎已重新計算」

**檔案**：`apps/web/src/app/(dashboard)/transactions/page.tsx`

#### P1-T1.3 — 成本基礎引擎重構
- [ ] 將 P0 的加權平均計算改為基於完整交易記錄重算：
  - 遍歷持倉所有交易（按時間排序）
  - `buy`：更新加權平均成本
  - `sell`：記錄已實現損益，不改變平均成本
  - `split` / `reverse_split`：調整數量和成本（P1-T3.x）
  - `dividend` / `drip`：記錄收入（不改成本基礎 / DRIP 增加持倉）
- [ ] 單元測試：覆蓋 buy/sell/split/drip 各場景
- [ ] 計算結果更新：`holdings.cost_basis`, `holdings.quantity`

**檔案**：`packages/shared/src/calculations/cost-basis.ts`

**依賴**：P0 全部完成

---

### Sprint P1-2: CSV 匯入

#### P1-T2.1 — CSV 解析器
- [ ] 安裝 `papaparse`（CSV）+ `xlsx`（Excel）
- [ ] 服務端解析 API：`POST /api/import/parse`
  - 接受 multipart/form-data
  - 返回前 5 行預覽 + 欄位列表
  - 檔案大小限制：5MB
- [ ] 欄位映射邏輯：
  ```ts
  type FieldMapping = {
    date: string;      // CSV column name -> date
    ticker: string;    // CSV column name -> ticker
    type: string;      // CSV column name -> transaction type
    quantity: string;
    price: string;
    amount: string;
    currency: string;
    fee?: string;
    note?: string;
  }
  ```
- [ ] 重複檢測：相同 `(date, ticker, quantity, amount)` → 標記重複

**檔案**：`apps/web/src/app/api/import/parse/route.ts`

#### P1-T2.2 — CSV 匯入 UI
- [ ] 匯入頁面（3 步驟）：
  1. **上傳**：拖拽或點擊上傳 CSV/Excel，顯示檔案名稱和大小
  2. **映射**：前 5 行預覽表格 + 欄位映射下拉選擇器（日期 / Ticker / 類型 / 數量 / 價格 / 金額 / 費用）
  3. **確認**：逐行驗證結果，錯誤行標紅 + 說明，重複行標黃，用戶可勾選排除
- [ ] 批量提交 API：`POST /api/import/confirm`（逐行插入交易記錄）
- [ ] 進度條顯示匯入進度（大量數據用串流）
- [ ] 匯入完成摘要：成功 X 筆 / 跳過 Y 筆 / 失敗 Z 筆

**檔案**：`apps/web/src/app/(dashboard)/import/page.tsx`

#### P1-T2.3 — 券商預設模板（P1 初版）
- [ ] Interactive Brokers Activity Statement CSV 映射模板
- [ ] 富途（Futu）交易記錄 CSV 映射模板
- [ ] 模板選擇 UI：「使用券商模板」下拉，自動填充欄位映射

**檔案**：`packages/shared/src/constants/import-templates.ts`

**依賴**：P1-T1.x 完成

---

### Sprint P1-3: 公司行動

#### P1-T3.1 — 公司行動 API
- [ ] 交易記錄表新增類型：`split`, `reverse_split`, `drip`, `dividend`（cash）
  - `ratio_from`, `ratio_to` 欄位（已在 schema）已可用
- [ ] `POST /api/holdings/[id]/corporate-actions` — 記錄公司行動
- [ ] 公司行動處理邏輯：
  - **Stock Split** (type: `split`)：`quantity *= ratio_to / ratio_from`, `cost_basis /= ratio_to / ratio_from`
  - **Reverse Split** (type: `reverse_split`)：`quantity *= ratio_from / ratio_to`, `cost_basis *= ratio_to / ratio_from`
  - **Cash Dividend** (type: `dividend`)：記錄股息收入，不改持倉
  - **DRIP** (type: `drip`)：增加持倉數量，成本 = 股息金額

**檔案**：`apps/web/src/app/api/holdings/[id]/corporate-actions/route.ts`

#### P1-T3.2 — 公司行動 UI
- [ ] 公司行動 Dialog（在持倉詳情頁觸發）：
  - 類型選擇：Stock Split / Reverse Split / Cash Dividend / DRIP
  - Split 模式：比例輸入（如 10:1 → ratio_from=1, ratio_to=10）、生效日期
  - Dividend 模式：每股金額、付息日、持有數量（自動填充）
- [ ] 操作後顯示影響預覽：「此操作將把數量從 100 股改為 1000 股」
- [ ] 公司行動歷史列表（在交易記錄中以不同標籤顯示）

**依賴**：P1-T1.x, P1-T2.x 完成

---

### Sprint P1-4: 收益率計算引擎

#### P1-T4.1 — 計算函數
- [ ] **HPR（持有期報酬率）**：
  ```
  HPR = (期末市值 + 已實現損益 + 股息 - 初始成本) / 初始成本
  ```
- [ ] **CAGR（年化複合增長率）**：
  ```
  CAGR = (期末 / 期初)^(1/年數) - 1
  ```
- [ ] **TWR（時間加權報酬率）**：
  - 按現金流日期分段計算子期間報酬率
  - 連乘各子期間：`TWR = ∏(1 + HPR_i) - 1`
  - 適合評估投資策略效果
- [ ] **MWR / XIRR（資金加權報酬率）**：
  - 求解使 NPV = 0 的折現率
  - 適合反映個人實際報酬
  - 使用數值方法（Newton-Raphson）求解 XIRR
- [ ] 所有計算函數：純函數，輸入為 `Decimal` 字串，輸出為 `string`
- [ ] 單元測試：至少 5 個真實案例（含分紅、加碼、減倉場景）

**檔案**：`packages/shared/src/calculations/returns.ts`

#### P1-T4.2 — 基準指數對比
- [ ] FMP API 取得指數歷史數據：`/historical-price-full/^GSPC`（S&P 500）
- [ ] 支援基準：S&P 500 (`^GSPC`)、MSCI World (`URTH`)、Nasdaq (`^IXIC`)
- [ ] 快取策略：基準數據 24 小時更新一次
- [ ] API Route：`GET /api/benchmark?symbol=^GSPC&range=1Y`

#### P1-T4.3 — 績效頁面 UI
- [ ] 績效頁面 (`/dashboard/performance`)：
  - **總覽卡片**：HPR / CAGR / TWR / MWR（選擇器切換）
  - **走勢圖對比**：投資組合 vs 基準指數（Recharts Line，雙線）
  - **時間範圍**：1M / 3M / 6M / YTD / 1Y / 5Y / ALL
  - **按持倉排名**：各持倉的報酬率排行（表格）
  - **已實現 vs 未實現損益**：Card 顯示
- [ ] 基準選擇器下拉（S&P 500 / MSCI World / Nasdaq / 無）

**檔案**：`apps/web/src/app/(dashboard)/performance/page.tsx`

**依賴**：P1-T1.x, P1-T3.x 完成

---

### Sprint P1-5: 股息追蹤

#### P1-T5.1 — 股息數據
- [ ] FMP API：`/historical-price-full/stock_dividend/AAPL` 取得股息歷史
- [ ] 自動匹配用戶持倉 → 計算股息收入（持倉數量 × 每股股息）
- [ ] 股息資料存入 `transactions` 表（type: `dividend`）
- [ ] Cron 每日更新：檢查持倉中有無新除息日
- [ ] API Route：`GET /api/dividends?year=2026`

#### P1-T5.2 — 股息 UI
- [ ] **股息日曆**：月曆視圖，標記除息日（參考 Sharesight 設計）
- [ ] **年度統計卡片**：當年已收股息、預計股息（按持倉推算）
- [ ] **股息殖利率**：各持倉的 TTM Yield（過去 12 個月股息 / 當前市值）
- [ ] **存款利息追蹤**：對 `valuation_method = formula` 的資產計算利息收入
- [ ] 股息頁面 (`/dashboard/dividends`)

**檔案**：`apps/web/src/app/(dashboard)/dividends/page.tsx`

**依賴**：P1-T1.x 完成

---

### Sprint P1-6: 資產配置分析

#### P1-T6.1 — 目標配置設定
- [ ] 用戶可設定目標配置（存入 `users` 表 `target_allocation` JSONB 欄位）：
  ```json
  {
    "by_asset_class": { "stock": 70, "bond": 20, "cash": 10 },
    "by_region": { "US": 60, "HK": 20, "JP": 20 }
  }
  ```
- [ ] Schema 新增：`ALTER TABLE users ADD COLUMN target_allocation JSONB`
- [ ] 目標配置設定 UI：滑桿 + 數字輸入，總和自動驗證 = 100%

#### P1-T6.2 — 配置分析計算
- [ ] 計算當前配置 vs 目標配置偏差（百分比差）
- [ ] 再平衡建議算法：
  - 計算每個類別的實際佔比 vs 目標佔比
  - 輸出：「建議買入 ETF $X,XXX / 賣出 Bond $X,XXX」
- [ ] API Route：`GET /api/analysis/allocation`

#### P1-T6.3 — 配置分析 UI
- [ ] 分析頁面 (`/dashboard/analysis`)：
  - **當前配置 vs 目標配置**：雙側柱狀圖或 Bullet Chart
  - **Sunburst 圖**（Nivo）：多層次配置視圖（大類 → 子類 → 個別持倉）
  - **再平衡建議清單**：各類別偏差 + 建議操作金額
  - **P1-F6 額外指標**：Treemap 按市值大小可視化

**檔案**：`apps/web/src/app/(dashboard)/analysis/page.tsx`

**依賴**：P1-T4.x 完成

---

### Sprint P1-7: 多用戶 & 2FA

#### P1-T7.1 — 角色權限系統
- [ ] Schema 新增：
  ```sql
  CREATE TABLE team_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id),
    member_user_id UUID NOT NULL REFERENCES users(id),
    role TEXT NOT NULL DEFAULT 'viewer', -- admin | member | viewer
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(owner_user_id, member_user_id)
  );
  ```
- [ ] 所有 API Routes 加入 RBAC 中間件：
  - `viewer`：只讀（GET 請求）
  - `member`：CRUD 持倉和交易記錄
  - `admin`：全部功能 + 邀請/踢出成員
- [ ] 邀請流程：發送邀請連結 → 被邀者點擊 → 關聯帳戶

#### P1-T7.2 — 邀請 UI
- [ ] 設定頁面新增「成員管理」Tab：
  - 列出當前成員（頭像、名稱、角色、狀態）
  - 邀請表單：Email + 角色選擇
  - 撤銷邀請 / 移除成員
- [ ] 被邀用戶登入後顯示「XXX 邀請您加入 Globalfolio」橫幅
- [ ] 切換視角：Header 下拉選擇「自己的組合 / XXX 的組合（只讀）」

#### P1-T7.3 — 2FA (TOTP)
- [ ] 安裝 `otplib`（TOTP 實現）
- [ ] 啟用 2FA 流程：
  1. 生成 TOTP secret → 顯示 QR Code（`qrcode` 套件）
  2. 用戶輸入 6 位驗證碼確認
  3. 顯示一次性備份碼（加密存儲）
  4. `users.totp_secret` 欄位加密存儲
- [ ] 登入時：OAuth 成功後若已啟用 2FA → 跳轉 OTP 輸入頁
- [ ] 備份碼驗證（每碼只能用一次）

**依賴**：P0 認證完成

---

## 4. P2 — 進階功能

> **P2 啟動條件**：P1 全部完成，用戶反饋收集 ≥ 2 週。

### P2 範圍定義

| # | 功能模塊 | PRD 章節 | 描述 |
|---|---------|---------|------|
| P2-F1 | Plaid API 整合 | prd §4 P2 | 自動同步美國銀行/券商帳戶 |
| P2-F2 | 加密貨幣交易所 API | prd §4 P2 | Binance / Coinbase，CoinGecko 報價 |
| P2-F3 | 公司行動自動偵測 | prd §3.14.2 | API 自動檢測拆股/除息，通知用戶確認 |
| P2-F4 | 自動報價更新 (多市場) | prd §4 P2 | 港股、A股、日股定時更新 |
| P2-F5 | FIFO + Tax Lot 追蹤 | prd §3.12.4 | 美國稅務計算需要 |
| P2-F6 | 稅務報表 | prd §3.9 | 已實現損益、資本利得稅估算 |
| P2-F7 | 目標設定 & 財務規劃 | prd §3.8 | 退休/買房目標，進度 + 預測 |
| P2-F8 | 券商 CSV 預設模板擴展 | prd §3.12.3 | Schwab, 老虎, Charles Stanley 等 |
| P2-F9 | Open Banking (歐洲/英國) | prd §4 P2 | TrueLayer / Nordigen PSD2 |
| P2-F10 | 保險/房產詳細模型 | prd §2 P2 | 儲蓄險 IRR 計算、房產市值追蹤 |

---

### Sprint P2-1: Plaid 整合

#### P2-T1.1 — Plaid Link 流程
- [ ] 安裝 `plaid` Node.js SDK + `react-plaid-link`
- [ ] Plaid Link 初始化：`POST /api/plaid/link-token` 生成 link token
- [ ] 連接回調：`POST /api/plaid/exchange-token`（public_token → access_token）
- [ ] access_token 加密存入 DB（`plaid_items` 表）
- [ ] Schema：
  ```sql
  CREATE TABLE plaid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL UNIQUE,
    access_token TEXT NOT NULL, -- 加密存儲
    institution_name TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

#### P2-T1.2 — 帳戶同步
- [ ] `GET /api/plaid/accounts` — 拉取連接機構的帳戶列表
- [ ] 自動匹配或創建 `accounts` 表記錄
- [ ] `GET /api/plaid/holdings` — 拉取持倉（Investment Accounts）
- [ ] 同步邏輯：比對現有持倉，新增/更新，標記「Plaid 同步」來源
- [ ] Webhook：Plaid `DEFAULT_UPDATE` 事件觸發後台同步
- [ ] UI：帳戶設定頁顯示「已連接 Plaid 帳戶」列表 + 手動同步按鈕

#### P2-T1.3 — 錯誤處理 & 重連
- [ ] Plaid ITEM_LOGIN_REQUIRED 錯誤 → 提示用戶重新連接
- [ ] 連接過期 Token 自動刷新
- [ ] 同步失敗通知（in-app notification）

---

### Sprint P2-2: 加密貨幣整合

#### P2-T2.1 — CoinGecko 報價
- [ ] CoinGecko API：`/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`
- [ ] 加密貨幣 ID 映射表（`BTC` → `bitcoin` 等）
- [ ] 每 15 分鐘更新加密持倉報價
- [ ] 支援 ERC-20 代幣查詢

#### P2-T2.2 — 交易所 API（只讀）
- [ ] Binance API（只讀 Key）：拉取帳戶持倉
- [ ] Coinbase API（只讀 Key）：拉取帳戶持倉
- [ ] API Keys 加密存入 DB（`exchange_connections` 表）
- [ ] 同步邏輯：與 Plaid 類似，自動匹配/創建持倉
- [ ] 安全提示 UI：「請只提供只讀 API Key，不要提供提現權限」

#### P2-T2.3 — 鏈上地址追蹤（可選）
- [ ] Etherscan API：輸入 ETH 地址，自動查詢餘額
- [ ] Bitcoin API（Blockchair）：BTC 地址餘額查詢
- [ ] 持倉類型 `wallet_address` 模式

---

### Sprint P2-3: 稅務功能

#### P2-T3.1 — FIFO 成本基礎
- [ ] 在 P1 的加權平均法基礎上新增 FIFO 算法：
  - 每筆買入作為獨立 Tax Lot 記錄
  - 賣出時按時間順序消耗最早買入的 Lot
  - 計算每個 Lot 的已實現損益
- [ ] Schema：
  ```sql
  CREATE TABLE tax_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    acquired_at TIMESTAMPTZ NOT NULL,
    quantity NUMERIC(30,18) NOT NULL,
    cost_per_unit NUMERIC(30,18) NOT NULL,
    remaining_quantity NUMERIC(30,18) NOT NULL,
    currency CHAR(3) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] 用戶可在設定中選擇成本計算方法：加權平均 / FIFO
- [ ] 切換方法時警告：「切換方法將重新計算所有歷史已實現損益」

#### P2-T3.2 — 稅務報表
- [ ] 稅務報表頁面 (`/dashboard/tax`)：
  - **年度已實現損益摘要**：按資產類別 / 按帳戶
  - **短期 vs 長期資本利得**：持有 < 1 年 vs ≥ 1 年（美國稅率不同）
  - **資本利得稅估算**：根據用戶設定的稅率（簡化估算，非正式稅務建議）
  - **交易記錄匯出**：PDF / CSV（按年度）
- [ ] 免責聲明：「本功能提供估算，非正式稅務建議，請諮詢稅務顧問」

**依賴**：P1-T1.x 完成

---

### Sprint P2-4: 公司行動自動偵測

#### P2-T4.1 — 事件偵測 API
- [ ] FMP API：`/historical-price-full/stock_dividend/{ticker}` — 股息歷史
- [ ] FMP API：`/historical-price-full/stock_split/{ticker}` — 拆股歷史
- [ ] 每日 Cron：遍歷所有用戶持倉，查詢最近 7 天內的公司行動
- [ ] 發現未記錄的公司行動 → 創建 `pending_corporate_actions` 記錄

#### P2-T4.2 — 通知 & 確認流程
- [ ] In-App 通知系統（Notification Bell）：
  - `notifications` 表：`id, user_id, type, payload JSONB, read_at, created_at`
  - Dashboard Header 顯示未讀數量
- [ ] 公司行動通知：「偵測到 AAPL 股票分割 4:1，是否套用？」
  - 確認 → 自動建立 `split` 交易記錄
  - 拒絕 → 忽略（用戶可手動記錄）
- [ ] 通知列表頁

---

### Sprint P2-5: 目標規劃

#### P2-T5.1 — 目標數據模型
- [ ] Schema：
  ```sql
  CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                    -- 如「退休金」「買房頭期款」
    type TEXT NOT NULL,                    -- retirement | house | education | custom
    target_amount NUMERIC(30,18) NOT NULL,
    currency CHAR(3) NOT NULL,
    target_date DATE,
    current_amount NUMERIC(30,18),         -- 定期快照記錄
    monthly_contribution NUMERIC(30,18),   -- 每月預計投入
    expected_return_rate NUMERIC(5,4),     -- 預期年化報酬率（如 0.07 = 7%）
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] API CRUD：`/api/goals`

#### P2-T5.2 — 目標計算 & 可視化
- [ ] 計算邏輯：
  - **未來值**：`FV = PV × (1+r)^n + PMT × ((1+r)^n - 1) / r`
  - **預計達成日**：求解 n
  - **缺口分析**：目標金額 - 預計期末金額
- [ ] 目標頁面 (`/dashboard/goals`)：
  - 各目標進度條（當前 / 目標）
  - 預計達成日 vs 目標日期
  - 每月需要再投入多少
  - 調整參數模擬器（投入金額 / 報酬率 Slider）

---

## 5. P3+ — 遠期功能（需單獨 PRD）

> P3+ 每個模塊需要在啟動前撰寫獨立的詳細 PRD。以下僅為高層描述。

### P3-F1: MCP Server（AI 查詢投資組合）

> 參考 Kubera MCP 整合、[decisions_v2.md](decisions_v2.md) ADR-005。

**架構**：
```
本地 MCP Server (Python SDK)
├── Resources
│   ├── portfolio://summary       — 投資組合總覽
│   ├── portfolio://holdings      — 持倉列表
│   ├── portfolio://performance   — 收益率數據
│   └── portfolio://allocation    — 配置分析
├── Tools
│   ├── add_transaction()         — 新增交易記錄（自然語言指令）
│   ├── query_portfolio()         — 自然語言查詢
│   ├── calculate_returns()       — 計算報酬率
│   └── rebalance_suggest()       — 再平衡建議
└── Prompts
    ├── portfolio-review          — 定期審視
    └── tax-estimation            — 稅務估算
```

**主要任務**：
- [ ] Python MCP Server（`apps/mcp-server/`）
- [ ] PostgreSQL 連接（共用 Neon DB）
- [ ] Claude Desktop / ChatGPT Plugin 整合
- [ ] 本地運行、不暴露公網（安全原則）
- [ ] 需單獨 PRD 覆蓋 Auth flow、Tool 定義、安全模型

---

### P3-F2: 衍生品支援

> 參考 [prd_v2.md](prd_v2.md) §3.15 的詳細說明。需單獨 PRD。

**主要任務**：
- [ ] 期權定價模型（Black-Scholes / Binomial）
- [ ] 到期日管理與提醒系統
- [ ] Greeks 計算（Delta, Gamma, Theta, Vega）
- [ ] 保證金追蹤
- [ ] 期貨合約展期 (Roll)
- [ ] 需單獨 PRD 完整定義

---

### P3-F3: AI Portfolio Review

**主要任務**：
- [ ] 週期性 AI 分析報告（配置、績效、風險）
- [ ] 異常偵測（持倉突然大跌 → 主動通知）
- [ ] 自然語言問答：「我的組合比 S&P 500 表現如何？」
- [ ] AI 交易記錄自動分類（從 CSV 描述推斷交易類型）

---

### P3-F4: 移動端 App

**主要任務**：
- [ ] React Native / Expo（共用 `packages/shared` 邏輯）
- [ ] 或 PWA 強化（Add to Home Screen + Push Notifications）
- [ ] Push 通知：每日淨值摘要、大幅波動警報、公司行動通知
- [ ] 生物識別登入（Face ID / Touch ID）
- [ ] Widget：桌面小工具顯示當日淨值

---

### P3-F5: Dead Man's Switch

> 參考 Kubera 的「緊急訪問」功能。

**主要任務**：
- [ ] 指定受益人 Email（加密存儲）
- [ ] 定期確認存活（每月 Ping）
- [ ] 超過 X 天未登入 → 傳送一次性訪問連結給受益人
- [ ] 只讀模式（受益人無法修改數據）
- [ ] 需單獨 PRD 覆蓋法律/隱私考量

---

## 6. 技術債務清單

> 在整個開發過程中識別的技術債，按優先級排列。

### 高優先（P0 補齊期間）
- [ ] **TD-1**: `drizzle-kit generate` 在 Node.js v25 下因 esbuild 不相容失敗 — 需降至 Node 20 或等待 drizzle-kit 修復
- [ ] **TD-2**: 缺少 API Rate Limiting — 所有 API Routes 應加 `next-rate-limit` 或 Upstash Redis Rate Limit
- [ ] **TD-3**: API 密鑰輪換機制未建立 — FMP / ExchangeRate API key 應支援輪換不停機

### 中優先（P1 期間）
- [ ] **TD-4**: 無端到端測試 — Playwright E2E 覆蓋核心用戶旅程（登入→Onboarding→新增持倉→Dashboard）
- [ ] **TD-5**: 無單元測試覆蓋計算邏輯 — `packages/shared/calculations/` 應有 Vitest 測試
- [ ] **TD-6**: 無 API 文檔 — 應生成 OpenAPI / Swagger 文檔（可用 `next-swagger-doc`）
- [ ] **TD-7**: Drizzle 遷移未版本控制 — 目前直接跑 SQL，需建立 `drizzle/` 遷移目錄並 commit

### 低優先（P2 期間）
- [ ] **TD-8**: 無監控/告警 — 建議接入 Sentry（錯誤追蹤）+ Vercel Analytics（性能監控）
- [ ] **TD-9**: 無 CSP Headers — Content Security Policy 應在 `next.config.ts` 配置
- [ ] **TD-10**: 無 DB 備份策略 — Neon 有自動備份，但應測試恢復流程

---

## 7. 關鍵技術實現備忘（全優先級通用）

### 7.1 金額精度處理
- DB：`NUMERIC(30,18)` — Drizzle 返回 `string`
- 前端運算：使用 `decimal.js` 或 `big.js`，**禁止**直接用 JavaScript `number` 做金額運算
- API 傳輸：所有金額欄位序列化為 `string`
- 顯示：`Intl.NumberFormat` 格式化

### 7.2 TanStack Query 快取策略
| 資源 | staleTime | gcTime | refetchOnWindowFocus |
|------|-----------|--------|---------------------|
| Dashboard summary | 1 min | 5 min | true |
| Holdings list | 30 sec | 5 min | true |
| Transactions | 30 sec | 5 min | true |
| Exchange rates | 1 hour | 24 hours | false |
| Ticker search | 1 hour | 1 hour | false |
| Quotes | 15 min | 30 min | true |
| Performance / Returns | 5 min | 30 min | false |
| Benchmark data | 24 hours | 48 hours | false |

### 7.3 安全清單（各階段累積）
**P0**：
- [x] 所有 API Route 驗證 `session.user.id`
- [x] 所有 DB 查詢包含 `WHERE user_id = ?`
- [x] Input sanitization（Zod schema）
- [x] CSRF token（NextAuth 內建）
- [ ] Rate limiting（待實現）
- [ ] Content Security Policy headers

**P1 新增**：
- [ ] RBAC 中間件（角色權限檢查）
- [ ] 邀請 Token 單次使用 + 過期
- [ ] TOTP 備份碼加密存儲
- [ ] 敏感操作確認（刪除帳戶、更改角色）

**P2 新增**：
- [ ] Plaid access_token 加密（AES-256）
- [ ] 交易所 API Key 加密
- [ ] 行為日誌（誰在何時修改了什麼）
- [ ] 帳戶刪除前數據導出

### 7.4 性能預算（各階段目標不變）
| 指標 | 目標 | 工具 |
|------|------|------|
| JS Bundle (gzipped) | < 300KB | `next build` 輸出 |
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| Dashboard 載入 | < 3s | Chrome DevTools |
| Lighthouse Performance | ≥ 90 | Lighthouse |

---

## 8. 任務依賴總覽

```
P0 (✅ 完成)
  └── P0-Fix-1 (Drizzle 遷移)
  └── P0-Fix-2 (Rate Limiting)
        │
        ▼
P1-Sprint1: 交易記錄
  └── P1-Sprint2: CSV 匯入
  └── P1-Sprint3: 公司行動
        │
        ▼
P1-Sprint4: 收益率引擎
  └── P1-Sprint5: 股息追蹤
  └── P1-Sprint6: 配置分析
        │
        ▼
P1-Sprint7: 多用戶 & 2FA
        │
        ▼
P2-Sprint1: Plaid
P2-Sprint2: 加密貨幣
P2-Sprint3: 稅務 (依賴 P1-T1 + P1-Sprint3)
P2-Sprint4: 公司行動自動偵測 (依賴 P1-T3)
P2-Sprint5: 目標規劃 (依賴 P1-T4)
        │
        ▼
P3+: MCP / 衍生品 / AI / 移動端（各需單獨 PRD）
```

**可並行任務**：
- P1-Sprint5（股息）與 P1-Sprint6（配置分析）可並行
- P2-Sprint1（Plaid）與 P2-Sprint2（加密貨幣）可並行
- P2-Sprint3（稅務）與 P2-Sprint4（公司行動自動偵測）可並行

---

## 9. 風險登記冊

| 風險 | 影響 | 概率 | 緩解措施 |
|------|------|------|---------|
| FMP API 免費額度用盡 | 報價停止更新 | 中 | 快取 15 分鐘 + Yahoo Finance fallback + 手動刷新降級 |
| Neon 免費層 Storage 超限 | DB 無法寫入 | 低 | 監控用量，超 0.5GB 前升級計劃 |
| NextAuth v5 Breaking Changes | 認證系統不穩 | 低 | 鎖定版本（`5.0.0-beta.x`），定期追蹤 Changelog |
| Plaid API 費用（P2） | 成本失控 | 中 | 先試用沙盒環境，生產上按連接數控制 |
| Node.js v25 相容性 | drizzle-kit 本地無法運行 | 高（已發生） | 升級至 Node 20 LTS（或 nvm 切換）|
| 單人開發瓶頸 | 進度延遲 | 高 | 嚴格控制每個 Sprint 範圍，P2/P3 按需拆分 |
| 加密貨幣 API 不穩定 | 報價缺失 | 中 | CoinGecko 備用 CoinMarketCap API |

---

## 10. 成功指標（按優先級）

| 階段 | 指標 | 目標值 |
|------|------|--------|
| P0 | 用戶可完成 Onboarding + 首筆持倉錄入 | < 5 分鐘 |
| P0 | Dashboard 首屏載入 | < 3 秒 |
| P0 | 匯率幣別支援 | ≥ 8 種幣別 |
| P1 | 交易記錄準確率 | 100%（計算可重放） |
| P1 | CSV 匯入成功率 | > 95%（標準格式） |
| P1 | TWR 計算誤差 | < 0.01% vs 手算 |
| P2 | Plaid 帳戶同步成功率 | > 99% |
| P2 | 公司行動偵測準確率 | > 90%（主要美股） |
| P3 | MCP 查詢響應時間 | < 2 秒 |

---

*本文件隨開發進展更新。每個 Sprint 完成後在任務旁標記 ✅。*
*最後更新：2026-04-17*
