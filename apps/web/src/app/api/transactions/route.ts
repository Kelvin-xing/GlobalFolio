export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTransactionsByUser } from "@/db/queries/transactions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getTransactionsByUser(session.user.id);
  return NextResponse.json(data);
}
