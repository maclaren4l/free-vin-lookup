import { NextResponse } from "next/server";
import { fetchSafety } from "@/lib/safety";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = (searchParams.get("make") ?? "").trim();
  const model = (searchParams.get("model") ?? "").trim();
  const year = (searchParams.get("year") ?? "").trim();

  try {
    const data = await fetchSafety(make, model, year);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ count: 0, ratings: [], unavailable: true }, { status: 200 });
  }
}
