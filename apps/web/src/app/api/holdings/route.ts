export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getHoldingsByUser, createHolding } from "@/db/queries/holdings";
import { z } from "zod";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const createHoldingSchema = z.object({
  accountId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  ticker: z.string().max(20).nullable().optional(),
  assetClass: z.enum([
    "stock", "etf", "bond", "fund", "crypto",
    "cash", "insurance", "real_estate", "other",
  ]),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Quantity must be a positive number",
  }),
  costBasis: z.string().nullable().optional(),
  currency: z.string().length(3),
  valuationMethod: z.enum(["market", "manual", "formula"]).default("market"),
  lastPrice: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getHoldingsByUser(session.user.id);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createHoldingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const holding = await createHolding({
    userId: session.user.id,
    ...parsed.data,
    lastPriceAt: parsed.data.lastPrice ? new Date() : null,
  });
  return NextResponse.json(holding, { status: 201 });
}
