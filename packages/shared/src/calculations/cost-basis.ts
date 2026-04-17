import Decimal from "decimal.js";

Decimal.set({ precision: 30 });

/**
 * Calculate new weighted average cost basis after a buy.
 * All inputs/outputs are string to preserve NUMERIC precision.
 */
export function calculateCostBasisAfterBuy(
  currentCostBasis: string,
  currentQuantity: string,
  buyPrice: string,
  buyQuantity: string,
  buyFee: string = "0"
): { newCostBasis: string; newQuantity: string } {
  const oldCost = new Decimal(currentCostBasis);
  const oldQty = new Decimal(currentQuantity);
  const price = new Decimal(buyPrice);
  const qty = new Decimal(buyQuantity);
  const fee = new Decimal(buyFee);

  const totalOldValue = oldCost.mul(oldQty);
  const totalNewValue = price.mul(qty).plus(fee);
  const newQty = oldQty.plus(qty);

  const newCostBasis = newQty.isZero()
    ? new Decimal(0)
    : totalOldValue.plus(totalNewValue).div(newQty);

  return {
    newCostBasis: newCostBasis.toFixed(18),
    newQuantity: newQty.toFixed(18),
  };
}

/**
 * Calculate realized gain/loss from a sell using average cost method.
 */
export function calculateRealizedGainLoss(
  avgCostBasis: string,
  sellPrice: string,
  sellQuantity: string,
  sellFee: string = "0"
): { realizedGainLoss: string; remainingQuantity: string } {
  const avgCost = new Decimal(avgCostBasis);
  const price = new Decimal(sellPrice);
  const qty = new Decimal(sellQuantity);
  const fee = new Decimal(sellFee);

  const proceeds = price.mul(qty).minus(fee);
  const costOfSold = avgCost.mul(qty);
  const realizedGainLoss = proceeds.minus(costOfSold);

  return {
    realizedGainLoss: realizedGainLoss.toFixed(18),
    remainingQuantity: qty.toFixed(18),
  };
}

type RecalcTransaction = {
  type: string;
  quantity: string | null;
  price: string | null;
  amount: string;
  fee: string | null;
  ratioFrom: string | null;
  ratioTo: string | null;
  executedAt: Date;
};

/**
 * Recalculate holding quantity and weighted-average cost basis
 * from the full ordered transaction history (ASC by executedAt).
 *
 * Handles: buy, sell, split, reverse_split, drip, bonus
 * Returns strings to preserve NUMERIC(30,18) precision.
 */
export function recalculateCostBasisFromHistory(
  txs: RecalcTransaction[]
): { quantity: string; costBasis: string } {
  let qty = new Decimal(0);
  let totalCost = new Decimal(0); // qty * avgCost

  for (const tx of txs) {
    const txQty = tx.quantity ? new Decimal(tx.quantity) : new Decimal(0);
    const txPrice = tx.price ? new Decimal(tx.price) : new Decimal(0);
    const txFee = tx.fee ? new Decimal(tx.fee) : new Decimal(0);

    switch (tx.type) {
      case "buy": {
        // Increase qty, add cost (price * qty + fee) to total cost
        const newCost = txPrice.mul(txQty).plus(txFee);
        totalCost = totalCost.plus(newCost);
        qty = qty.plus(txQty);
        break;
      }
      case "sell": {
        // Decrease qty proportionally, reduce total cost
        if (qty.isZero()) break;
        const fraction = txQty.div(qty);
        totalCost = totalCost.minus(totalCost.mul(fraction));
        qty = qty.minus(txQty);
        if (qty.lessThan(0)) {
          qty = new Decimal(0);
          totalCost = new Decimal(0);
        }
        break;
      }
      case "split": {
        // ratio_from:ratio_to — multiply qty, divide cost per unit (total cost unchanged)
        if (!tx.ratioFrom || !tx.ratioTo) break;
        const rf = new Decimal(tx.ratioFrom);
        const rt = new Decimal(tx.ratioTo);
        if (rf.isZero()) break;
        qty = qty.mul(rt).div(rf);
        // totalCost stays the same (market cap unchanged), per-unit cost drops
        break;
      }
      case "reverse_split": {
        // qty shrinks, per-unit cost rises, total cost unchanged
        if (!tx.ratioFrom || !tx.ratioTo) break;
        const rf = new Decimal(tx.ratioFrom);
        const rt = new Decimal(tx.ratioTo);
        if (rt.isZero()) break;
        qty = qty.mul(rf).div(rt);
        break;
      }
      case "drip": {
        // Dividend Reinvestment: new shares acquired at dividend price
        const newCost = txPrice.mul(txQty);
        totalCost = totalCost.plus(newCost);
        qty = qty.plus(txQty);
        break;
      }
      case "bonus": {
        // Bonus / rights shares: qty increases, total cost unchanged
        qty = qty.plus(txQty);
        break;
      }
    }
  }

  const avgCostBasis = qty.isZero()
    ? new Decimal(0)
    : totalCost.div(qty);

  return {
    quantity: qty.toFixed(18),
    costBasis: avgCostBasis.toFixed(18),
  };
}
