import { NextResponse } from "next/server";
import { runEnrichers } from "@/lib/enrich";

// Optional enrichment (EPA efficiency now; paid per-VIN options later). Fetched
// separately from /api/decode so the core spec render never waits on it, and
// always 200s with an empty object on a miss — enrichment is additive.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = (searchParams.get("make") ?? "").trim();
  const model = (searchParams.get("model") ?? "").trim();
  const year = (searchParams.get("year") ?? "").trim();
  const trim = (searchParams.get("trim") ?? "").trim();
  const vin = (searchParams.get("vin") ?? "").trim();

  try {
    const data = await runEnrichers({ vin, make, model, modelYear: year, trim });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
