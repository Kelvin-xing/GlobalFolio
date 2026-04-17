export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSnapshotsByUser } from "@/db/queries/snapshots";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "1Y";

  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "1W":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "1M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "6M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "YTD":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "1Y":
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "5Y":
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 5);
      break;
    case "ALL":
      startDate = new Date(2000, 0, 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const data = await getSnapshotsByUser(
    session.user.id,
    startDate.toISOString().split("T")[0],
    now.toISOString().split("T")[0]
  );

  return NextResponse.json(data);
}
