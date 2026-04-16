# AI Product CEO 第二輪審閱報告

**專案**：Globalfolio (Investment Portfolio Dashboard)  
**分支**：main  
**審閱範圍**：prd.md、tech_stack.md、decisions.md、desktop_research_v2.md  
**前次審閱**：[gstack_CEO_review.md](gstack_CEO_review.md)（2026-04-17 第一輪）  
**本輪審閱角色**：產品 CEO — 聚焦第一輪修改的完成度、新增矛盾、MVP 可交付性  
**審閱日期**：2026-04-17

---

## 〇、前次審閱修正完成度

| # | 第一輪問題 | 狀態 | 評分 |
|---|----------|------|------|
| 1 | 產品定位不清（個人工具 vs 市場產品） | ✅ 已修正 — PRD §1.2 明確「面向市場的多用戶平台」 | 9/10 |
| 2 | Notion MVP 在驗證什麼？ | ✅ 已修正 — 全部文檔移除 Notion Phase 1 | 10/10 |
| 3 | 7 國 8 幣別是否規格膨脹 | ✅ 已決定保留 — 定位為市場產品，合理 | N/A |
| 4 | 缺少用戶旅程 | ✅ 已補充 — PRD §3.11，9 個場景 | 8/10 |
| 5 | 數據輸入設計不足 | ✅ 已補充 — PRD §3.12，含手動/估值/CSV/成本基礎 | 9/10 |
| 6 | 空狀態設計 | ✅ 已補充 — PRD §3.13，3 步 Onboarding + 空 Dashboard + 範例數據 | 9/10 |
| 7 | 缺少公司行動 | ✅ 已補充 — PRD §3.14，9 種類型 + 數據模型 | 9/10 |
| 8 | 手動估值資產 | ✅ 已補充 — PRD §3.12.2 + Schema `valuation_method` | 9/10 |
| 9 | API 用量預算 | ✅ 已補充 — tech_stack §4.1，含場景估算 | 8/10 |
| 10 | 衍生品定義不清 | ✅ 已降級 P3+ — PRD §3.15 含暫行方案 | 10/10 |
| 11 | 競品表誤導 | ✅ 已修正 — 三態標記（✅/🔲/❌） | 10/10 |
| 12 | Schema account_id 耦合 | ✅ 已修正 — nullable + 設計說明 | 10/10 |
| 13 | NUMERIC 精度不足 | ✅ 已修正 — 統一 NUMERIC(30,18) | 10/10 |
| 14 | MCP 權重失調 | ✅ 已修正 — 標記 Phase 4 | 9/10 |

**結論**：第一輪 14 個問題全部得到有效修正。文檔成熟度從 5/10 提升至 8/10。

---

## 一、本輪最關鍵的 3 個結構性問題

### 問題 1：文檔體系出現分裂 — desktop_research.md vs desktop_research_v2.md

倉庫中現在有**兩份研究文檔**：

| 文檔 | 行數 | 角色 |
|------|------|------|
| `desktop_research.md` | ~880 行 | 第一輪研究（已被局部修正：§10 標記為歷史參考、§6.2 改三態等） |
| `desktop_research_v2.md` | ~1050 行 | 整合稿 — 合併了 `desktop_research.md` + `competitive_research.md` |

**矛盾所在**：
- prd.md 和 tech_stack.md 仍然引用 `desktop_research.md`
- `desktop_research_v2.md` 的內容更完整，但沒有被任何文檔引用
- 開發者查閱時不知道哪份是正式版

**建議**：明確文檔定位 — 用 v2 作為正式版，更新所有跨文檔引用。

### 問題 2：「Priority (P0/P1/P2)」與「Phase (1/2/3/4)」兩套體系混用，造成矛盾

PRD 中有兩套維度交叉使用但未明確定義：

**當前矛盾實例**：

| 功能 | Priority 標記 | Phase 歸屬 | 矛盾 |
|------|-------------|-----------|------|
| CSV 匯入 | §3.12 標為 **P0** | §4 + §7 放在 **Phase 2** | P0 怎麼不在 Phase 1？ |
| 公司行動 (Split/Dividend) | §3.14 標為 **P1** | §7 放在 **Phase 2** | 可接受，但不直覺 |
| 多用戶 & 權限 | §3.10 標為 **P1** | §7 放在 **Phase 2** | 但 §1.2 說「Phase 1 起即以多用戶架構設計」 |
| 成功指標 §9 | 提到「CSV 匯入均可用」 | CSV 在 Phase 2 | §9 的指標到底測量哪個 Phase？ |

**建議**：統一為 P0/P1/P2/P3+ 單一體系，消除 Phase 概念。

### 問題 3：Phase 1 MVP 的 4 週交付承諾是否可信？

Phase 1 待辦清單包含 ~24 個工作日的工作量，4 週一人開發非常緊張。

**建議**：可拆分為子里程碑或適當調整 scope。

---

## 二、本輪 6 個產品 / 技術問題

### 問題 4：產品仍然沒有名字

四份文檔中一直稱為「投資組合管理 Dashboard」「本產品」「本專案」。作為面向市場的多用戶平台，需要一個產品名稱用於：
- GitHub repo 識別
- Onboarding 歡迎頁文案
- 開源社區識別度

### 問題 5：§1.2 說「Phase 1 起即以多用戶架構設計」，但多用戶功能在 Phase 2

Schema 中已有 `user_id`，認證在 Phase 1，架構上是多用戶。但功能上（邀請家庭成員、RBAC 等）是 Phase 2。

**建議**：區分「多用戶架構」和「多用戶功能」。

### 問題 6：desktop_research_v2.md §2.4-2.5 仍推薦安裝 Notion API Skill

與「跳過 Notion」的決策矛盾。

### 問題 7：desktop_research_v2.md §12.2 建議「Activity-centric」模型，但 Schema 是「Holding-centric」

需要在 decisions.md 新增 ADR-006 明確選擇並說明理由。

### 問題 8：decisions.md ADR-005 有重複行

第 2 點和第 3 點完全相同。

### 問題 9：Schema 缺少索引定義

至少需要 `holdings(user_id)`、`transactions(holding_id)` 等索引保障查詢性能。

---

## 三、交叉比對一致性問題

| # | 位置 | 問題 | 嚴重程度 |
|---|------|------|---------|
| C1 | prd.md §9 成功指標 | 「MVP 功能完整性」列出「CSV 匯入均可用」，但 CSV 在 Phase 2 | 中 |
| C2 | desktop_research_v2.md §2.4-2.5 | 仍推薦 Notion API skill 安裝 | 低 |
| C3 | desktop_research_v2.md §12.1 | MVP 必做清單含 CSV + Average Cost + Corporate Actions，均不在 PRD Phase 1 | 高 |
| C4 | decisions.md ADR-005 | 重複行 | 低 |

---

## 四、行動建議（按優先級排序）

| # | 行動 | 影響 |
|---|------|------|
| 1 | **統一文檔體系** — 決定 v2 vs 原版的關係 | 消除開發者困惑 |
| 2 | **統一為 P0/P1/P2/P3+ 體系** — 消除 Phase 概念 | 消除所有矛盾 |
| 3 | **確定產品名稱** | 統一四份文檔稱謂 |
| 4 | **新增 ADR-006：數據模型選擇** | 影響 Schema 和 UX |
| 5 | **修正 §1.2 措辭** — 區分架構 vs 功能 | 避免 scope 誤解 |
| 6 | **Schema 補充索引定義** | 保障查詢性能 |
| 7 | **修復 ADR-005 重複行** | 文檔品質 |
| 8 | **清理 v2 中的 Notion skill 殘留** | 文檔一致性 |

---

## 五、總體評估

**文檔成熟度**：8/10

**最值得肯定的改進**：
- §3.11-3.15 的新增內容質量很高
- Schema 改進到位
- 三態競品表和 API 預算估算讓產品定位更誠實

**最需要解決的問題**：
1. Priority vs Phase 的混淆（結構性問題）
2. 文檔體系（兩份研究報告的關係）
3. 產品命名

---

## 六、用戶回覆與決策

> 以下為用戶回覆（2026-04-17）：

1. **Priority vs Phase 矛盾**：統一為 P0/P1/P2/P3+ 格式，消除 Phase 概念
2. **交付可行性**：不考慮，不拆分里程碑
3. **產品名稱**：**Globalfolio**
4. **其他行動建議**：全部接受 — ADR-006、§1.2 措辭、索引定義、ADR-005 重複行、Notion 殘留清理
5. **文檔輸出**：prd_v2.md、tech_stack_v2.md、decisions_v2.md（各自保存為 _v2 文件）

---
