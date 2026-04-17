export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Papa from "papaparse";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/** Maximum file size: 5 MB */
const MAX_BYTES = 5 * 1024 * 1024;
/** Maximum rows to preview */
const PREVIEW_ROWS = 5;
/** Maximum total rows allowed in a single import */
const MAX_ROWS = 10_000;

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded (field name: 'file')" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Only CSV files are supported" }, { status: 415 });
  }

  const text = await file.text();

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    return NextResponse.json(
      { error: "CSV parse error: " + result.errors[0].message },
      { status: 422 }
    );
  }

  const totalRows = result.data.length;
  if (totalRows === 0) {
    return NextResponse.json({ error: "CSV file has no data rows" }, { status: 422 });
  }
  if (totalRows > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows (max ${MAX_ROWS.toLocaleString()})` },
      { status: 422 }
    );
  }

  const headers = result.meta.fields ?? [];
  const preview = result.data.slice(0, PREVIEW_ROWS);

  // Suggest automatic field mappings based on common header names
  const suggestions = autoMapHeaders(headers);

  return NextResponse.json({
    headers,
    preview,
    totalRows,
    suggestions,
  });
}

/**
 * Heuristically maps CSV column names to transaction field names.
 * Returns a partial mapping from our field names → detected CSV header.
 */
function autoMapHeaders(headers: string[]): Record<string, string> {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const norm = headers.map((h) => ({ raw: h, n: normalize(h) }));

  const find = (...candidates: string[]) => {
    for (const c of candidates) {
      const match = norm.find((h) => h.n.includes(c));
      if (match) return match.raw;
    }
    return "";
  };

  return {
    executedAt: find("date", "tradedate", "transactiondate", "settledate"),
    type: find("type", "transactiontype", "action", "activity"),
    ticker: find("ticker", "symbol", "code", "isin", "cusip"),
    holdingName: find("name", "description", "security", "asset"),
    quantity: find("quantity", "qty", "shares", "units", "amount"),
    price: find("price", "unitprice", "tradeprice", "costprice"),
    amount: find("total", "value", "netamount", "proceeds", "cost"),
    currency: find("currency", "ccy", "curr"),
    fee: find("fee", "commission", "brokerage", "charge"),
    note: find("note", "notes", "comment", "memo", "remarks"),
    ratioFrom: find("ratiofrom", "splitfrom", "oldratio"),
    ratioTo: find("ratioto", "splitto", "newratio"),
  };
}
