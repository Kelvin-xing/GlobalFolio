# Competitive Research Report: Portfolio Tracker UX, Corporate Actions & Cost Basis

_Research Date: April 17, 2026_

---

## Topic 1: User Journey & Onboarding in Portfolio Trackers

### 1.1 Ghostfolio

**First-time Onboarding Flow:**
- Anonymous sign-up via security token — no email, phone, or username required
- User creates an account and is immediately directed to add their first "activity" (transaction)
- Activities are the core unit: Buy, Sell, Dividend, Interest, Fee, Liability, Wealth Item
- Users can also import/export activities via CSV/JSON
- Multi-account support from day one (track across multiple platforms)

**Empty State Design:**
- Minimal dashboard with zero data — prompts user to add first activity
- Clean, widget-based layout that fills as data is added

**Data Input UX:**
- Manual entry: select asset type → search ticker → enter date, quantity, unit price, fee, account
- Import: CSV or JSON upload for bulk activity import
- No broker integration (privacy-first design — no Plaid or aggregator connections)
- Supports: Stocks, ETFs, Bonds, Cryptocurrencies, Wealth Items (watches, trading cards), Liabilities

**Daily Usage Patterns:**
- Dashboard with portfolio summary, performance charts (Today, WTD, MTD, YTD, 1Y, 5Y, Max)
- Portfolio allocations by account, asset class, currency, region, sector (Premium)
- X-ray static analysis for risk identification (Premium)
- Watchlist for monitoring potential investments (Premium)
- Market Mood (Fear & Greed Index) (Premium)
- Zen Mode: hides monetary values for calm viewing during volatility
- Emergency Fund tracker

---

### 1.2 Maybe Finance (archived — no longer maintained)

**First-time Onboarding Flow:**
- Self-hosted Ruby on Rails app (Docker deployment)
- Sign up with email/password (demo: `user@maybe.local` / `password`)
- Onboarding flow was redesigned in later versions with trial/Stripe integration
- Demo data available via `rake demo_data:default` for evaluation

**Empty State Design:**
- Dashboard-first approach with cards for Net Worth, Income Statement, Spending
- Empty states with clear CTAs to connect accounts or add manual entries

**Data Input UX:**
- Account-centric model (Bank accounts, Investment accounts, Property, Vehicles, etc.)
- Supported Plaid integration for automatic bank/broker syncing
- Manual transaction entry with categories
- "Synth" for ticker selection in investment accounts

**Daily Usage Patterns:**
- Net worth tracking over time
- Income statement views
- Activity feed with categorized transactions
- AI-powered personal finance chat (v1)
- Sankey diagrams for cash flow visualization
- Data exports
- Mobile responsive UI

**Key Architectural Notes:**
- Built with Ruby on Rails, PostgreSQL, Hotwire/Turbo, Stimulus
- AGPLv3 license
- 54.1k GitHub stars, 147 contributors
- **Repository archived July 2025** — no longer maintained

---

### 1.3 Sharesight

**First-time Onboarding Flow:**
1. Sign up with email (free tier: 1 portfolio, 10 holdings)
2. Select tax residency country → auto-sets base currency, tax year, and reporting defaults
3. First portfolio is automatically created
4. Presented with options to add investments:
   - "Add trades individually" tile (for new users with no holdings)
   - Import from broker (200+ supported brokers)
   - Import from CSV/spreadsheet
   - Manually add holdings

**Empty State Design:**
- Portfolio Investments page with "Add trades individually" prominent tile
- Guided steps: Search holding → Enter trade details → Save
- Video tutorial embedded in getting started guide

**Data Input UX (detailed step-by-step):**
1. Click "Add holding" from investments page
2. Search by company name or ticker code
3. Select correct security from results
4. Enter trade details form:
   - **Type**: Buy, Sell, Split, Bonus, Consolidation, Cancellation, Return of Capital, Adjust Cost Base, Opening Balance
   - **Date of Trade**
   - **Quantity**
   - **Share Price** (auto-suggests closing price for that date — click to accept or type custom)
   - **Exchange Rate** (auto-suggested for foreign stocks)
   - **Brokerage** (optional — includes tax on brokerage)
   - **Comments** (optional)
   - **File Attachments** (optional — one per holding)
5. Click "Save this trade"
6. For existing portfolios: "Add holding" button on investments page

**Alternative data entry paths:**
- **Bulk import from broker**: Direct integration with 200+ global brokers
- **Bulk import from CSV**: Download from broker, upload to Sharesight
- **Opening balances**: Skip historical trades, set a starting point
- **Contract Notes Inbox**: Forward broker confirmations via email for auto-import
- **Portfolio email address**: Each portfolio gets a unique email for trade imports

**What can be tracked:**
- Listed shares on supported exchanges (auto price updates)
- ETFs (auto price updates)
- Managed/Mutual funds (listed and unlisted, search by APIR code)
- Custom investments (unlisted assets, property, term deposits, precious metals)
- Cash accounts (deposits, withdrawals, interest)
- Bonds (listed and unlisted)
- Cryptocurrencies (popular coins supported, others via custom investment)
- Foreign currency holdings
- Warrants & stock options
- DRP/DRIP (automatic tracking)
- Superannuation (via custom investment)
- **NOT supported**: Derivatives (CFDs, futures, options), physical art/collectibles, liabilities

**Daily Usage Patterns:**
- Portfolio dashboard with performance, holdings list
- Automatic dividend tracking (up to 20 years historical data)
- Future income report (estimated upcoming dividends)
- Multi-period performance comparison (up to 5 periods)
- Diversity/asset allocation reports
- Exposure report (look inside ETFs)
- Contribution analysis report
- Tax reports (taxable income, CGT, historical cost, all trades, unrealised CGT)
- Drawdown risk report
- Export to PDF, Excel, Google Sheets
- Share portfolio with accountant/advisor (tiered permissions)
- Labels for custom organization of holdings

---

### 1.4 Kubera

**First-time Onboarding Flow:**
- 14-day free trial, no credit card required
- Sign up → immediately see a balance sheet-style interface
- Concierge onboarding available for Black tier ($2,499/yr)

**Empty State Design:**
- Balance sheet layout with categories for different asset types
- Clean, spreadsheet-inspired design (positions itself as "ditch the spreadsheet")

**Data Input UX:**
- **Aggregator connections**: Partners with multiple aggregators (local + global) for bank/brokerage connections
  - Smart algorithm picks optimal connector per institution
  - Thousands of institutions worldwide
- **Ticker tracking**: Add tickers for stocks, ETFs, mutual funds on all major exchanges (US, Canada, UK, Europe, Asia)
- **AI Import**: Upload PDFs, documents, or screenshots → AI extracts and imports data (killer feature for alts/private investments)
- **Manual entry**: For any asset type
- **Carta integration**: Direct integration for private stock/LP positions
- **AI Appraiser**: Live price feeds + AI for valuing real estate, vehicles, jewelry, watches, etc.

**Supported Asset Types (broadest coverage):**
- Banks & brokerages (via aggregators)
- Digital assets (blockchains, exchanges, wallets, DeFi, NFTs, staking, lending)
- Alternative investments (private stocks, LP positions, capital calls, distributions, IRR)
- Real estate, vehicles, jewelry, watches, "anything ownable"
- Stablecoins categorized as cash equivalents
- Net worth viewable in Bitcoin

**Daily Usage Patterns:**
- Unified balance sheet view (all assets in one place)
- Net worth tracking over time
- Multi-currency wealth management (core design principle)
- Cash management & forecasting
- Fast Forward: Dynamic scenario planning (not a typical retirement calculator)
- Club Benchmarks: Compare against anonymous peers with similar net worth
- Proof of Wealth: Self-attested wealth verification
- Dead Man's Switch: Automatic beneficiary notification
- AI Advisor integration (ChatGPT, Claude, Gemini CLI, Codex via MCP)
- Nested portfolios for entities (trusts, LLCs, holding companies)
- Multiplayer: Share with family, advisors, accountants (granular access control)

**Pricing:**
- Essentials: $249/year (all features except premium)
- Black: $2,499/year (nested portfolios, granular access, concierge onboarding, VIP support)
- White Label: From $299/month

---

### 1.5 Monarch Money

**Note:** Help article URL has changed (redirected from monarchmoney.com to monarch.com). Content was not accessible at time of research. Based on known product features:

- Account aggregation via Plaid (primary method)
- Comprehensive budgeting + investment tracking
- Net worth dashboard
- Collaborative features (family sharing)

---

### Comparative Summary: Onboarding Approaches

| Feature | Ghostfolio | Maybe Finance | Sharesight | Kubera |
|---------|-----------|---------------|------------|--------|
| **Auth method** | Anonymous token | Email/password | Email | Email |
| **Free tier** | Yes (limited) | Self-hosted free | 10 holdings free | 14-day trial |
| **Broker integration** | None (privacy) | Plaid | 200+ brokers | Multiple aggregators |
| **Manual entry** | Activity-based | Transaction-based | Trade-based | Balance sheet |
| **Bulk import** | CSV/JSON | — | CSV + broker | AI Import (PDFs) |
| **Empty state** | Minimal prompt | Dashboard cards | Guided tiles + video | Balance sheet |
| **Time to first value** | ~2 min (manual) | ~5 min (Plaid) | ~3 min (broker import) | ~5 min (aggregator) |
| **Target user** | Privacy-focused DIY | General personal finance | Active investors | HNW individuals |

---

## Topic 2: Corporate Actions in Portfolio Trackers

### 2.1 Sharesight — Corporate Actions (Gold Standard)

Sharesight has the most comprehensive corporate action handling of any portfolio tracker researched. They handle corporate actions both **automatically** and via **manual entry**.

**Built-in Transaction Types for Corporate Actions:**
| Type | Description |
|------|-------------|
| **Buy** | Standard purchase |
| **Sell** | Standard sale |
| **Split** | Stock split (forward) — auto-adjusts quantity |
| **Bonus** | Bonus share issue |
| **Consolidation** | Reverse split / share consolidation |
| **Cancellation** | Share cancellation |
| **Return of Capital** | Capital return to shareholders |
| **Adjust Cost Base** | Manual cost base adjustment |
| **Opening Balance** | Set initial position without history |

**Specific Corporate Action Coverage:**
- **Stock splits**: Handled automatically for listed securities. Sharesight detects splits and adjusts quantity/price accordingly. Users can also enter manually via "Split" transaction type.
- **Reverse splits/consolidations**: Dedicated "Consolidation" transaction type. Auto-detected for listed securities.
- **Mergers & Acquisitions**: Sharesight publishes step-by-step guides for major M&A events (dozens of specific guides, e.g., "How to handle acquisition of Altium by Renesas"). General pattern:
  1. Sell all shares of acquired company at the acquisition price
  2. If receiving acquirer shares: Buy equivalent shares of acquiring company
  3. If mixed (cash + shares): Record both components
- **Spin-offs**: Step-by-step guides published per event (e.g., "Sunrise Communications spinoff from Liberty Global", "TC Energy spinoff of South Bow"). General pattern:
  1. Adjust cost base of parent company (reduce by spin-off allocation)
  2. Create new holding for spun-off entity
  3. Buy shares of new entity at allocated cost
- **Dividend Reinvestment (DRP/DRIP)**: Automatically tracked. Sharesight detects DRP elections and records reinvested dividends as new buy trades.
- **Delistings**: Guide to record — typically sell at final price or write off
- **Name/Ticker changes**: Handled automatically for listed securities
- **Employee shares (ESS/ESPP)**: Supported with tracking guidance
- **Inherited shares**: Supported with specific recording instructions
- **Divorce/separation transfers**: Supported with recording guidance

**Automatic vs Manual:**
- Dividends and corporate actions (splits, consolidations) generate automatically with a ⚡ lightning bolt icon
- Once manually saved/edited, auto-adjustment stops
- For M&A and spin-offs: typically requires manual recording following published guides

---

### 2.2 Ghostfolio — Corporate Actions (Major Gap)

**Current State (as of April 2026): Stock splits are NOT supported as a dedicated feature.**

This is the #1 most-requested feature, documented across multiple GitHub issues and discussions:
- Discussion #1072: "Stock splits" — 50 upvotes, 15 comments, 10 replies, ongoing since July 2022
- Issue #1693: "Is it possible to represent a stock split?"
- Issue #2722: "How to deal with corporate actions (stock split & reverse split)"
- Issue #6271: "Incorrect ROI calculation for AZN due to 2-for-1 Reverse Stock Split"
- PR #3211: "Add support for stock split orders" — **closed/abandoned** (never merged)

**Current Workarounds (all manual and error-prone):**

1. **Sell + Rebuy method**: Sell all shares before split date, buy new quantity after split date at adjusted price. **Problem**: Skews performance metrics because the baseline resets at the split date.

2. **Modify historical transactions**: Go back and edit all pre-split activities — multiply quantity by split ratio, divide price by split ratio. **Problem**: Tedious for long transaction histories.

3. **Buy at $0**: Import remaining shares at price 0 with "buy" type (Revolut-style). **Problem**: Affects cost basis calculations.

4. **Re-gather historical market data**: Admin Control > Market Data > ticker > "Gather Historical Market Data" to normalize prices, then manually adjust all activities.

**PR #3211 Technical Approach (never merged):**
- New `SPLIT` order type added to the activity type enum
- Quantity field used as split ratio:
  - Positive = forward split (e.g., quantity=2 means 2-for-1)
  - Negative = reverse split (e.g., quantity=-2 means 1-for-2)
- Portfolio calculator updated to apply split ratio to total share count
- 109 additions, 11 deletions across the codebase
- **Rejected** because "portfolio calculator is currently undergoing a major rebuild"

**Other Corporate Actions in Ghostfolio:**
- **Dividends**: Supported as a dedicated activity type
- **Mergers/Acquisitions**: Not supported — manual workaround only
- **Spin-offs**: Not supported
- **DRIP**: Draft PR #1963 exists but never completed
- **Name/ticker changes**: Not documented — likely requires manual re-entry

**Key Insight for Our Product:** This is a massive competitive opportunity. Users describe stock splits as a "rather large blocker for tracking stocks accurately" and "a no-go for me to use this nice tool."

---

### 2.3 Implementation Patterns — Data Model Implications

Based on research across all platforms, corporate actions require:

**Activity/Transaction Types Enum:**
```
BUY, SELL, DIVIDEND, INTEREST, FEE,
SPLIT, CONSOLIDATION (reverse split),
BONUS, CANCELLATION,
RETURN_OF_CAPITAL, ADJUST_COST_BASE,
OPENING_BALANCE, TRANSFER,
DRIP (dividend reinvestment)
```

**Split Data Model:**
```
{
  type: "SPLIT" | "CONSOLIDATION",
  date: Date,
  holding_id: FK,
  ratio_from: number,  // e.g., 1 (pre-split shares)
  ratio_to: number,    // e.g., 10 (post-split shares)
  // Derived: all pre-split quantities multiplied by (ratio_to / ratio_from)
  // Derived: all pre-split prices divided by (ratio_to / ratio_from)
}
```

**M&A Data Model:**
```
{
  type: "MERGER" | "ACQUISITION",
  date: Date,
  source_holding_id: FK,     // acquired company
  target_holding_id: FK,      // acquiring company (nullable for cash-only)
  cash_component: Decimal,    // cash received per share
  share_ratio_from: number,   // shares of source
  share_ratio_to: number,     // shares of target received
}
```

**Spin-off Data Model:**
```
{
  type: "SPINOFF",
  date: Date,
  parent_holding_id: FK,
  child_holding_id: FK,
  cost_allocation_pct: Decimal,  // % of parent cost allocated to child
  share_ratio: Decimal,          // child shares received per parent share
}
```

---

## Topic 3: Cost Basis Calculation Methods

### 3.1 Overview of Methods

| Method | Description | Used In |
|--------|-------------|---------|
| **FIFO** (First In, First Out) | Oldest shares sold first | US default, most countries |
| **LIFO** (Last In, First Out) | Newest shares sold first | US (optional), some countries |
| **Average Cost** | Weighted average of all purchase prices | Australia, NZ, UK default |
| **Specific Identification** | User selects which tax lots to sell | US (optional), for tax optimization |
| **HIFO** (Highest In, First Out) | Highest cost shares sold first | Tax optimization strategy |

### 3.2 Sharesight's Cost Basis Implementation

**Default Method: Average Cost**

Sharesight uses the **average cost base** method by default, which is the standard in Australia, New Zealand, and many other jurisdictions.

**Key Reports for Cost Basis:**
- **Sold Securities Report**: Shows realized gains on sold positions calculated using average cost base
- **Capital Gains Tax Report**: Full CGT calculations with discounts where applicable
- **Historical Cost Report**: Complete cost basis history for all holdings
- **Unrealised CGT Report**: Projected gains/losses on current holdings
- **All Trades Report**: Complete trading history

**How Average Cost Works in Sharesight:**
1. Each buy trade adds to the cost pool: `total_cost += (quantity × price) + brokerage`
2. Average cost per share = `total_cost / total_quantity`
3. When selling, cost basis per share = the weighted average at time of sale
4. Corporate actions adjust the cost base:
   - **Return of Capital**: Reduces cost base by the return amount
   - **Adjust Cost Base**: Manual override for specific adjustments
   - **Split**: Adjusts quantity but total cost stays the same (per-share cost recalculates)
   - **Consolidation**: Same as split but in reverse
   - **Bonus shares**: Added at $0 cost, diluting the average

**Tax Residency Integration:**
- Portfolio's tax residency determines which tax rules apply
- Australian CGT: 50% discount for assets held >12 months
- Custom tax year alignment per country
- Foreign income source tracking (local vs. foreign)

**Performance Calculation:**
- Sharesight calculates "true total return" including:
  - Capital gains/losses
  - Dividend income
  - Currency fluctuations
  - Brokerage fees
- Annualized returns for proper time-weighted comparison

### 3.3 Ghostfolio's Cost Basis Implementation

**Method: Return on Average Investment (ROAI)**

Ghostfolio uses ROAI based on the average amount of capital invested over time.

**Key characteristics:**
- Aims to provide more insightful performance view than simpler approaches
- Especially useful when contributions are made over time (DCA strategies)
- **Dividends are NOT part of the performance calculation** (noted in FAQ)
- No dedicated cost basis tracking for tax purposes
- No tax lot identification
- No FIFO/LIFO selection

### 3.4 Kubera's Approach

Kubera focuses on **net worth tracking** rather than tax-lot-level cost basis:
- Tracks current market values through aggregator connections
- IRR calculations for alternative investments (LP positions, venture capital)
- Does not appear to offer detailed cost basis method selection
- Positioned for wealth overview, not tax compliance

### 3.5 Implementation Guide for Cost Basis

**Recommended Data Model:**

```
Tax Lot:
{
  id: UUID,
  holding_id: FK,
  buy_date: Date,
  quantity: Decimal,
  remaining_quantity: Decimal,  // decremented on sells
  cost_per_share: Decimal,
  total_cost: Decimal,          // including fees
  brokerage: Decimal,
  currency: String,
  exchange_rate: Decimal,       // at time of purchase
}

Sale Allocation:
{
  id: UUID,
  sell_transaction_id: FK,
  tax_lot_id: FK,
  quantity_sold: Decimal,
  proceeds_per_share: Decimal,
  cost_basis_per_share: Decimal,
  realized_gain: Decimal,
  holding_period_days: Integer,
  is_long_term: Boolean,        // for US tax purposes
}
```

**FIFO Algorithm:**
```python
def allocate_fifo(sell_qty, sell_price, tax_lots):
    allocations = []
    remaining = sell_qty
    for lot in sorted(tax_lots, key=lambda l: l.buy_date):  # oldest first
        if remaining <= 0:
            break
        alloc_qty = min(remaining, lot.remaining_quantity)
        allocations.append({
            'lot': lot,
            'quantity': alloc_qty,
            'cost_basis': alloc_qty * lot.cost_per_share,
            'proceeds': alloc_qty * sell_price,
            'gain': alloc_qty * (sell_price - lot.cost_per_share),
            'holding_days': (sell_date - lot.buy_date).days
        })
        lot.remaining_quantity -= alloc_qty
        remaining -= alloc_qty
    return allocations
```

**Average Cost Algorithm:**
```python
def calc_average_cost(tax_lots):
    total_cost = sum(lot.remaining_quantity * lot.cost_per_share for lot in tax_lots)
    total_qty = sum(lot.remaining_quantity for lot in tax_lots)
    return total_cost / total_qty if total_qty > 0 else 0
```

**Corporate Action Impact on Cost Basis:**

| Action | Impact on Cost Basis |
|--------|---------------------|
| Stock Split | Total cost unchanged; per-share cost = total_cost / new_quantity |
| Reverse Split | Total cost unchanged; per-share cost = total_cost / new_quantity |
| Return of Capital | Reduces total cost by return amount |
| Bonus Shares | Shares added at $0; dilutes average cost |
| Spin-off | Parent cost reduced by allocation %; child gets allocated cost |
| DRIP | New lot created at dividend reinvestment price |
| M&A (share swap) | New lots created with allocated cost basis |
| M&A (cash) | Treated as sale; cost basis of old lots used |

---

## Key Takeaways for Product Development

### 1. Onboarding Priority
- **Minimum viable**: Manual entry + CSV import (like Ghostfolio)
- **Better**: Broker CSV import templates (like Sharesight)
- **Best**: Aggregator connection + AI document import (like Kubera)
- **Critical**: Show value immediately — auto-fetch current prices as soon as first holding is added

### 2. Corporate Actions Priority
- **Must have (Day 1)**: Stock splits, reverse splits, dividends
- **Should have (v1.1)**: DRIP, return of capital, bonus shares, adjust cost base
- **Nice to have (v2)**: Automated M&A/spin-off handling, auto-detection from data providers
- **Competitive advantage**: Ghostfolio's biggest gap is stock splits — solving this well would attract their user base

### 3. Cost Basis Priority
- **Must have**: Average cost method (simplest, covers AU/NZ/UK)
- **Should have**: FIFO (US default), tax lot tracking
- **Nice to have**: LIFO, Specific Identification, HIFO
- **Tax reporting**: CGT report, taxable income report, sold securities report

### 4. Transaction Type Enum (Recommended)
```
BUY, SELL, DIVIDEND, INTEREST, FEE,
SPLIT, CONSOLIDATION, BONUS, CANCELLATION,
RETURN_OF_CAPITAL, ADJUST_COST_BASE,
OPENING_BALANCE, TRANSFER_IN, TRANSFER_OUT,
DRIP, SPINOFF, MERGER
```

### 5. Architecture Notes
- **Sharesight model**: Trade-centric (transactions build up holdings)
- **Kubera model**: Balance-sheet-centric (current state matters most)
- **Ghostfolio model**: Activity-centric (similar to trade but includes non-trade events)
- **Recommended**: Activity-centric with tax lot tracking — most flexible for both performance and tax calculations
