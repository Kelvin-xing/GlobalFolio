export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateHolding, deleteHolding } from "@/db/queries/holdings";
import { z } from "zod";

const updateHoldingSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  ticker: z.string().max(20).nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
  assetClass: z
    .enum(["stock", "etf", "bond", "fund", "crypto", "cash", "insurance", "real_estate", "other"])
    .optional(),
  quantity: z.string().optional(),
  costBasis: z.string().nullable().optional(),
  currency: z.string().length(3).optional(),
  valuationMethod: z.enum(["market", "manual", "formula"]).optional(),
  lastPrice: z.string().nullable().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateHoldingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const holding = await updateHolding(id, session.user.id, {
    ...parsed.data,
    lastPriceAt: parsed.data.lastPrice ? new Date() : undefined,
  });
  if (!holding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(holding);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const holding = await deleteHolding(id, session.user.id);
  if (!holding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
