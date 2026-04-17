import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createHolding } from "@/db/queries/holdings";

const DEMO_HOLDINGS = [
  {
    name: "Apple Inc.",
    ticker: "AAPL",
    assetClass: "stock",
    quantity: "50",
    costBasis: "150.00",
    currency: "USD",
    lastPrice: "195.00",
  },
  {
    name: "Vanguard Total Stock Market ETF",
    ticker: "VTI",
    assetClass: "etf",
    quantity: "100",
    costBasis: "200.00",
    currency: "USD",
    lastPrice: "260.00",
  },
  {
    name: "台積電",
    ticker: "2330.TW",
    assetClass: "stock",
    quantity: "1000",
    costBasis: "550.00",
    currency: "TWD",
    lastPrice: "980.00",
  },
  {
    name: "Bitcoin",
    ticker: "BTC",
    assetClass: "crypto",
    quantity: "0.5",
    costBasis: "30000.00",
    currency: "USD",
    lastPrice: "100000.00",
  },
  {
    name: "iShares Core US Aggregate Bond ETF",
    ticker: "AGG",
    assetClass: "bond",
    quantity: "200",
    costBasis: "100.00",
    currency: "USD",
    lastPrice: "98.00",
  },
  {
    name: "Emergency Fund",
    ticker: null,
    assetClass: "cash",
    quantity: "1",
    costBasis: "10000.00",
    currency: "USD",
    lastPrice: "10000.00",
  },
  {
    name: "Sony Group",
    ticker: "6758.T",
    assetClass: "stock",
    quantity: "100",
    costBasis: "12000.00",
    currency: "JPY",
    lastPrice: "14500.00",
  },
  {
    name: "Alibaba Group",
    ticker: "9988.HK",
    assetClass: "stock",
    quantity: "200",
    costBasis: "85.00",
    currency: "HKD",
    lastPrice: "120.00",
  },
];

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  for (const h of DEMO_HOLDINGS) {
    await createHolding({
      userId,
      ...h,
      valuationMethod: "market",
      lastPriceAt: new Date(),
      isDemo: true,
    });
  }

  return NextResponse.json({
    success: true,
    count: DEMO_HOLDINGS.length,
  });
}
