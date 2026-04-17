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
