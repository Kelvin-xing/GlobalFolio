export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getHoldingById } from "@/db/queries/holdings";
import { getTransactionsByHoldingAsc } from "@/db/queries/transactions";
import {
  calculateHPR,
  calculateCAGR,
  calculateXIRR,
} from "@globalfolio/shared";

type CashFlow = { date: Date; amount: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: holdingId } = await params;

  const holding = await getHoldingById(holdingId, session.user.id);
  if (!holding) {
    return NextResponse.json({ error: "Holding not found" }, { status: 404 });
  }

  const txs = await getTransactionsByHoldingAsc(holdingId);

  if (txs.length === 0) {
    return NextResponse.json({
      hpr: null,
      cagr: null,
      mwr: null,
      totalCost: "0",
      totalDividends: "0",
      totalRealizedGains: "0",
      firstTxDate: null,
      txCount: 0,
    });
  }

  // ── Build cash-flow series ───────────────────────────────────────────────
  // For XIRR: buys = positive (money out), sells/dividends = negative (money in)
  const cashFlows: CashFlow[] = [];
  let totalCost = 0;
  let totalDividends = 0;
  let totalRealizedGains = 0;
  let avgCost = 0;
  let currentQty = 0;

  for (const tx of txs) {
    const qty = tx.quantity ? parseFloat(tx.quantity) : 0;
    const price = tx.price ? parseFloat(tx.price) : 0;
    const amount = parseFloat(tx.amount ?? "0");
    const fee = tx.fee ? parseFloat(tx.fee) : 0;

    switch (tx.type) {
      case "buy":
      case "drip": {
        const cost = qty * price + fee;
        // Weighted average cost update
        avgCost = (avgCost * currentQty + cost) / (currentQty + qty);
        currentQty += qty;
        totalCost += cost;
        cashFlows.push({ date: tx.executedAt, amount: String(cost) }); // positive = outflow
        break;
      }
      case "sell": {
        const proceeds = qty * price - fee;
        const costOfSold = avgCost * qty;
        totalRealizedGains += proceeds - costOfSold;
        currentQty = Math.max(0, currentQty - qty);
        cashFlows.push({ date: tx.executedAt, amount: String(-proceeds) }); // negative = inflow
        break;
      }
      case "dividend":
      case "return_of_capital": {
        totalDividends += amount;
        cashFlows.push({ date: tx.executedAt, amount: String(-amount) }); // inflow
        break;
      }
      case "bonus": {
        // No cash exchanged, just add shares at zero cost
        currentQty += qty;
        break;
      }
      // split / reverse_split handled by recalculation; no cash flow
    }
  }

  // Current market value as final XIRR "liquidation" inflow
  const currentPrice = holding.lastPrice
    ? parseFloat(holding.lastPrice)
    : avgCost;
  const currentValue = currentQty * currentPrice;

  // HPR
  const hpr = totalCost > 0
    ? calculateHPR(
        String(totalCost),
        String(currentValue),
        String(totalRealizedGains),
        String(totalDividends)
      )
    : null;

  // CAGR
  const firstTxDate = txs[0].executedAt;
  const years =
    (new Date().getTime() - new Date(firstTxDate).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000);

  const cagr =
    totalCost > 0 && years > 0
      ? calculateCAGR(
          String(totalCost),
          String(currentValue + totalRealizedGains + totalDividends),
          firstTxDate,
          new Date()
        )
      : null;

  // MWR (XIRR) — add liquidation inflow as final cash flow
  let mwr: string | null = null;
  if (cashFlows.length > 0 && currentValue > 0) {
    const xirrFlows = [
      ...cashFlows,
      { date: new Date(), amount: String(-currentValue) }, // terminal inflow
    ];
    mwr = calculateXIRR(
      xirrFlows.map((cf) => ({ date: cf.date, amount: cf.amount }))
    );
  }

  return NextResponse.json({
    hpr,
    cagr,
    mwr,
    totalCost: String(totalCost),
    totalDividends: String(totalDividends),
    totalRealizedGains: String(totalRealizedGains),
    currentValue: String(currentValue),
    firstTxDate: firstTxDate.toISOString(),
    txCount: txs.length,
  });
}
