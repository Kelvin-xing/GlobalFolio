import {
  pgTable,
  uuid,
  text,
  char,
  numeric,
  timestamp,
  date,
  serial,
  jsonb,
  unique,
  index,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

const timestamptz = (name: string) =>
  timestamp(name, { mode: "date", withTimezone: true });

// ── Users ──
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: timestamptz("email_verified"),
  baseCurrency: char("base_currency", { length: 3 }).notNull().default("USD"),
  regions: text("regions").array(),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamptz("created_at").defaultNow(),
  updatedAt: timestamptz("updated_at").defaultNow(),
});

// ── Accounts ──
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    institution: text("institution"),
    type: text("type").notNull(), // checking, savings, brokerage, crypto, retirement, other
    currency: char("currency", { length: 3 }).notNull(),
    region: text("region"),
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [index("idx_accounts_user").on(table.userId)]
);

// ── Holdings ──
export const holdings = pgTable(
  "holdings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    ticker: text("ticker"),
    assetClass: text("asset_class").notNull(), // stock, etf, bond, fund, crypto, cash, insurance, real_estate, other
    quantity: numeric("quantity", { precision: 30, scale: 18 }).notNull(),
    costBasis: numeric("cost_basis", { precision: 30, scale: 18 }),
    currency: char("currency", { length: 3 }).notNull(),
    valuationMethod: text("valuation_method").notNull().default("market"), // market, manual, formula
    lastPrice: numeric("last_price", { precision: 30, scale: 18 }),
    lastPriceAt: timestamptz("last_price_at"),
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_holdings_user").on(table.userId),
    index("idx_holdings_account").on(table.accountId),
    index("idx_holdings_ticker").on(table.ticker),
  ]
);

// ── Transactions ──
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    holdingId: uuid("holding_id").references(() => holdings.id, {
      onDelete: "cascade",
    }),
    type: text("type").notNull(), // buy, sell, dividend, interest, transfer, split, reverse_split, drip, spinoff, merger, return_of_capital, bonus
    quantity: numeric("quantity", { precision: 30, scale: 18 }),
    price: numeric("price", { precision: 30, scale: 18 }),
    amount: numeric("amount", { precision: 30, scale: 18 }).notNull(),
    fee: numeric("fee", { precision: 30, scale: 18 }).default("0"),
    currency: char("currency", { length: 3 }).notNull(),
    ratioFrom: numeric("ratio_from"),
    ratioTo: numeric("ratio_to"),
    executedAt: timestamptz("executed_at").notNull(),
    note: text("note"),
    createdAt: timestamptz("created_at").defaultNow(),
  },
  (table) => [
    index("idx_transactions_holding").on(table.holdingId),
    index("idx_transactions_executed").on(table.executedAt),
  ]
);

// ── Exchange Rates ──
export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: serial("id").primaryKey(),
    baseCurrency: char("base_currency", { length: 3 }).notNull(),
    quoteCurrency: char("quote_currency", { length: 3 }).notNull(),
    rate: numeric("rate", { precision: 30, scale: 18 }).notNull(),
    snapshotDate: date("snapshot_date").notNull(),
  },
  (table) => [
    unique("uq_exchange_rate").on(
      table.baseCurrency,
      table.quoteCurrency,
      table.snapshotDate
    ),
    index("idx_exchange_rates_lookup").on(
      table.baseCurrency,
      table.quoteCurrency,
      table.snapshotDate
    ),
  ]
);

// ── Snapshots (Net Worth History) ──
export const snapshots = pgTable(
  "snapshots",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    snapshotDate: date("snapshot_date").notNull(),
    totalAssets: numeric("total_assets", { precision: 30, scale: 18 }),
    totalLiabilities: numeric("total_liabilities", { precision: 30, scale: 18 }),
    netWorth: numeric("net_worth", { precision: 30, scale: 18 }),
    breakdown: jsonb("breakdown"), // { by_class: {}, by_currency: {}, by_region: {} }
    createdAt: timestamptz("created_at").defaultNow(),
  },
  (table) => [
    unique("uq_snapshot_user_date").on(table.userId, table.snapshotDate),
    index("idx_snapshots_user_date").on(table.userId, table.snapshotDate),
  ]
);

// ── NextAuth.js tables ──
export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    unique("uq_auth_account").on(table.provider, table.providerAccountId),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamptz("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamptz("expires").notNull(),
  },
  (table) => [unique("uq_verification").on(table.identifier, table.token)]
);
