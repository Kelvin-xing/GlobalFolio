import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateAccount, deleteAccount, getAccountById } from "@/db/queries/accounts";
import { z } from "zod";

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  institution: z.string().max(100).optional(),
  type: z.enum(["checking", "savings", "brokerage", "crypto", "retirement", "other"]).optional(),
  currency: z.string().length(3).optional(),
  region: z.string().max(10).optional(),
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
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const account = await updateAccount(id, session.user.id, parsed.data);
  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(account);
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
  const account = await deleteAccount(id, session.user.id);
  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
