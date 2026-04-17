import Decimal from "decimal.js";

Decimal.set({ precision: 30 });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CashFlow = {
  /** ISO date string or Date */
  date: Date | string;
  /** Positive = inflow (buy), Negative = outflow (sell/dividend received) */
  amount: string;
};

export type PeriodSnapshot = {
  date: Date | string;
  /** Portfolio value at end of sub-period */
  value: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDecimal(v: string | number): Decimal {
  return new Decimal(v);
}

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

/** Years between two dates (fractional) */
function yearsBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return ms / (365.25 * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// HPR — Holding Period Return
// ---------------------------------------------------------------------------

/**
 * HPR = (endValue + realizedGains + dividends - totalCost) / totalCost
 *
 * Simple, does NOT adjust for timing of cash flows.
 */
export function calculateHPR(
  totalCost: string,
  endValue: string,
  realizedGains: string = "0",
  dividends: string = "0"
): string {
  const cost = toDecimal(totalCost);
  if (cost.isZero()) return "0";

  const end = toDecimal(endValue);
  const gains = toDecimal(realizedGains);
  const divs = toDecimal(dividends);

  const hpr = end.plus(gains).plus(divs).minus(cost).div(cost);
  return hpr.toFixed(18);
}

// ---------------------------------------------------------------------------
// CAGR — Compound Annual Growth Rate
// ---------------------------------------------------------------------------

/**
 * CAGR = (endValue / beginValue)^(1 / years) - 1
 */
export function calculateCAGR(
  beginValue: string,
  endValue: string,
  startDate: Date | string,
  endDate: Date | string
): string {
  const begin = toDecimal(beginValue);
  if (begin.isZero()) return "0";

  const end = toDecimal(endValue);
  const years = yearsBetween(toDate(startDate), toDate(endDate));
  if (years <= 0) return "0";

  // (end/begin)^(1/years) - 1
  const ratio = end.div(begin).toNumber();
  if (ratio <= 0) return (-1).toFixed(18);
  const cagr = Math.pow(ratio, 1 / years) - 1;
  return new Decimal(cagr).toFixed(18);
}

// ---------------------------------------------------------------------------
// TWR — Time-Weighted Return
// ---------------------------------------------------------------------------

/**
 * TWR splits the period at each external cash flow, computes a sub-period
 * HPR for each segment, then chains them: TWR = ∏(1 + HPR_i) - 1
 *
 * @param snapshots - Portfolio value snapshots, sorted ASC by date.
 *   Each snapshot must be taken *before* the cash flow on that date.
 * @param cashFlows - External cash flows (buys positive, sells/withdrawals negative)
 */
export function calculateTWR(
  snapshots: PeriodSnapshot[],
  cashFlows: CashFlow[]
): string {
  if (snapshots.length < 2) return "0";

  // Pair each snapshot with the cash flow that occurs right after it
  const sorted = [...snapshots].sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime()
  );

  let twr = new Decimal(1);

  for (let i = 0; i < sorted.length - 1; i++) {
    const beginValue = toDecimal(sorted[i].value);
    const endValue = toDecimal(sorted[i + 1].value);

    // Cash flow that happened at the end of this sub-period (between i and i+1)
    const periodStart = toDate(sorted[i].date);
    const periodEnd = toDate(sorted[i + 1].date);
    const flowInPeriod = cashFlows
      .filter((cf) => {
        const d = toDate(cf.date);
        return d > periodStart && d <= periodEnd;
      })
      .reduce((sum, cf) => sum.plus(toDecimal(cf.amount)), new Decimal(0));

    // Sub-period HPR = (endValue - beginValue - cashFlow) / beginValue
    const denom = beginValue.plus(flowInPeriod);
    if (denom.isZero()) continue;

    const subHPR = endValue.minus(beginValue).minus(flowInPeriod).div(denom);
    twr = twr.mul(new Decimal(1).plus(subHPR));
  }

  return twr.minus(1).toFixed(18);
}

// ---------------------------------------------------------------------------
// MWR / XIRR — Money-Weighted Return (Internal Rate of Return)
// ---------------------------------------------------------------------------

/**
 * Solves for the annualised rate r such that NPV of all cash flows = 0.
 *
 * cashFlows must include the final portfolio value as a negative outflow
 * (representing "liquidation" at endDate).
 *
 * Uses Newton-Raphson with bisection fallback.
 *
 * @returns Annualised MWR as a fixed-precision string, or null if no
 *          solution found within 100 iterations.
 */
export function calculateXIRR(cashFlows: CashFlow[], maxIterations = 100): string | null {
  if (cashFlows.length < 2) return null;

  const dates = cashFlows.map((cf) => toDate(cf.date));
  const amounts = cashFlows.map((cf) => toDecimal(cf.amount).toNumber());
  const t0 = dates[0];

  // t_i = years from first date
  const t = dates.map((d) => yearsBetween(t0, d));

  function npv(r: number): number {
    return amounts.reduce((sum, amt, i) => {
      const denom = Math.pow(1 + r, t[i]);
      return sum + (denom === 0 ? 0 : amt / denom);
    }, 0);
  }

  function dnpv(r: number): number {
    return amounts.reduce((sum, amt, i) => {
      if (t[i] === 0) return sum;
      const denom = Math.pow(1 + r, t[i] + 1);
      return sum + (-t[i] * amt) / (denom === 0 ? 1e-15 : denom);
    }, 0);
  }

  // Newton-Raphson starting near 10%
  let r = 0.1;
  for (let i = 0; i < maxIterations; i++) {
    const f = npv(r);
    const df = dnpv(r);

    if (Math.abs(df) < 1e-15) break;

    const rNew = r - f / df;
    if (Math.abs(rNew - r) < 1e-10) {
      return new Decimal(rNew).toFixed(18);
    }
    r = rNew;

    // Guard against divergence
    if (!isFinite(r) || r < -0.999) {
      r = -0.5 + Math.random() * 0.5; // random restart in (-0.5, 0)
    }
  }

  // Bisection fallback between -99% and +1000%
  let lo = -0.999;
  let hi = 10.0;
  const npvLo = npv(lo);

  for (let i = 0; i < maxIterations; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);

    if (Math.abs(fMid) < 1e-8 || (hi - lo) / 2 < 1e-10) {
      return new Decimal(mid).toFixed(18);
    }

    if (Math.sign(fMid) === Math.sign(npvLo)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Annualised Volatility
// ---------------------------------------------------------------------------

/**
 * Annualised standard deviation of periodic returns.
 * @param periodicReturns - Array of return strings per period (e.g. daily).
 * @param periodsPerYear - 252 for daily, 12 for monthly, 4 for quarterly.
 */
export function calculateVolatility(
  periodicReturns: string[],
  periodsPerYear: number = 252
): string {
  if (periodicReturns.length < 2) return "0";

  const rs = periodicReturns.map((r) => toDecimal(r).toNumber());
  const mean = rs.reduce((a, b) => a + b, 0) / rs.length;
  const variance = rs.reduce((a, b) => a + (b - mean) ** 2, 0) / (rs.length - 1);
  const annualised = Math.sqrt(variance * periodsPerYear);
  return new Decimal(annualised).toFixed(18);
}

// ---------------------------------------------------------------------------
// Sharpe Ratio
// ---------------------------------------------------------------------------

/**
 * Sharpe = (portfolioReturn - riskFreeRate) / annualisedVolatility
 * All inputs are annualised.
 */
export function calculateSharpe(
  portfolioAnnualReturn: string,
  riskFreeRate: string,
  annualisedVolatility: string
): string {
  const vol = toDecimal(annualisedVolatility);
  if (vol.isZero()) return "0";

  const excess = toDecimal(portfolioAnnualReturn).minus(toDecimal(riskFreeRate));
  return excess.div(vol).toFixed(18);
}
