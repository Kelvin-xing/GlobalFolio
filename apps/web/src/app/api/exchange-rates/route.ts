import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLatestRates } from "@/db/queries/exchange-rates";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rates = await getLatestRates("USD");
  return NextResponse.json(rates);
}
