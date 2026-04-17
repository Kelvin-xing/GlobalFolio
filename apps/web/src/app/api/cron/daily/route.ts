import { NextResponse } from "next/server";
import { generateAllSnapshots } from "@/lib/snapshot-engine";
import { fetchAndStoreRates } from "@/lib/exchange-rate-service";

/**
 * Cron endpoint to run daily jobs:
 * 1. Fetch exchange rates
 * 2. Generate snapshots for all users
 *
 * Protect this with a cron secret in production.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch exchange rates
    await fetchAndStoreRates();

    // 2. Generate snapshots
    await generateAllSnapshots();

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Cron job failed:", err);
    return NextResponse.json(
      { error: "Cron job failed", details: String(err) },
      { status: 500 }
    );
  }
}
