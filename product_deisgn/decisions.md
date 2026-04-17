# 架構決策記錄 (Architecture Decision Records)

> 本文件記錄專案中的關鍵技術決策，採用 ADR 格式。每個決策包含背景、方案對比和最終選擇。

---

## ADR-001: ORM 選擇 — Drizzle vs Prisma

**狀態**：已決定
**日期**：2026-04-17

### 背景
金融數據涉及大量貨幣金額計算，對數值精度有嚴格要求。需要選擇一個支持 PostgreSQL `NUMERIC` 類型的 ORM。

### 方案對比

| 維度 | Drizzle | Prisma |
|------|---------|--------|
| Decimal 支援 | ✅ 原生映射 PostgreSQL `numeric`，返回 `string` 避免精度丟失 | ⚠️ `Decimal` 類型底層用 `decimal.js`，需額外配置 |
| Bundle 大小 | ~7.4KB (輕量) | ~800KB (含 Query Engine WASM) |
| SQL 控制 | SQL-like API，接近原生 SQL | 高階抽象，複雜查詢需 `$queryRaw` |
| 遷移 | `drizzle-kit` CLI | `prisma migrate` (成熟) |
| 學習曲線 | 需了解 SQL | 更直覺 |

### 決策
選擇 **Drizzle**。理由：
1. 金融計算對 Decimal 精度要求高，Drizzle 的 `numeric` 映射更直接
2. Bundle 更小，適合 self-hosted 場景
3. SQL-like API 更靈活，適合未來的複雜報表查詢

---

## ADR-002: 狀態管理 — TanStack Query + Zustand

**狀態**：已決定
**日期**：2026-04-17

### 背景
Dashboard 需要頻繁從 API 獲取報價、持倉數據（服務器狀態），同時管理主題切換、幣別選擇等 UI 狀態（客戶端狀態）。

### 方案對比

| 方案 | 適用場景 | 缺點 |
|------|---------|------|
| 僅 Zustand | 所有狀態 | 需手動處理 API 快取、失效、重試 |
| 僅 TanStack Query | API 數據 | 無法方便管理純 UI 狀態 |
| TanStack Query + Zustand | 各司其職 | 需管理兩個庫 |

### 決策
選擇 **TanStack Query + Zustand** 組合：
- **TanStack Query**：管理所有服務器狀態（持倉數據、報價、匯率），自動處理快取、後台重新獲取、失效策略
- **Zustand**：管理純客戶端 UI 狀態（主題、base currency 選擇、側邊欄展開、篩選條件）

---

## ADR-003: 圖表庫 — Recharts 為主

**狀態**：已決定
**日期**：2026-04-17

### 背景
Dashboard 需要 Pie Chart、Line Chart（淨值走勢）、Treemap/Sunburst（配置分析）。

### 決策
- **MVP 主要圖表庫**：Recharts — React 原生、社區活躍、Pie/Line/Area 支援良好
- **配置分析（P1）**：Nivo — Sunburst/Treemap 表現優秀
- **股票走勢（P3+）**：Lightweight Charts — K 線/走勢專用

不選 ECharts 的原因：非 React 原生，Bundle 過大。

---

## ADR-004: API 策略 — Next.js API Routes → tRPC

**狀態**：已決定
**日期**：2026-04-17

### 背景
需要在 Next.js 應用中提供後端 API，同時保持型別安全。

### 方案對比

| 方案 | 優點 | 缺點 |
|------|------|------|
| Next.js API Routes (MVP) | 零配置，開箱即用 | 無自動型別推導 |
| tRPC | 端到端型別安全，自動推導 | 需要額外設置，不適合外部 API 消費 |
| REST + OpenAPI | 標準化，易對接第三方 | 需維護 Schema，型別同步手動 |

### 決策
**漸進式方案**：
1. **MVP (Phase 1)**：直接使用 Next.js API Routes，快速啟動
2. **穩定期 (Phase 2+)**：遷移到 tRPC，獲得端到端型別安全
3. MCP Server 和外部 API 消費仍通過標準 REST

不選 Hono 的原因：tRPC 與 Next.js 整合更成熟，且團隊只有一人，不需要 REST-first 設計。

---

## ADR-005: MCP Server 語言 — Python

**狀態**：已決定
**日期**：2026-04-17

### 背景
MCP Server 需要連接 PostgreSQL 並暴露投資組合數據給 AI 客戶端（Claude/ChatGPT）。

### 方案對比

| 方案 | 優點 | 缺點 |
|------|------|------|
| Python SDK | 金融庫豐富（pandas, numpy）；MCP Python SDK 成熟 | 需維護兩種語言 |
| TypeScript SDK | 與 Next.js 同語言 | 金融計算庫不如 Python 豐富 |

### 決策
選擇 **Python SDK**：
1. 金融分析（TWR/MWR 計算、蒙特卡洛模擬）Python 生態更成熟
2. MCP Python SDK 文檔完善，社區示例豐富
3. MCP Python SDK 文檔完善，社區示例豐富
4. MCP Server 是獨立進程，語言不同不影響 Next.js 應用

---

*本文件將隨專案進展持續更新。新增決策請按 ADR-NNN 格式追加。*
