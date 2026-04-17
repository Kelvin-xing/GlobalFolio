import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAccountsByUser,
  createAccount,
} from "@/db/queries/accounts";
import { z } from "zod";

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  institution: z.string().max(100).optional(),
  type: z.enum(["checking", "savings", "brokerage", "crypto", "retirement", "other"]),
  currency: z.string().length(3),
  region: z.string().max(10).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAccountsByUser(session.user.id);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const account = await createAccount({
    userId: session.user.id,
    ...parsed.data,
  });
  return NextResponse.json(account, { status: 201 });
}
