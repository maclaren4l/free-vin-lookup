import { NextResponse } from "next/server";
import { fetchRecalls } from "@/lib/recalls";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = (searchParams.get("make") ?? "").trim();
  const model = (searchParams.get("model") ?? "").trim();
  const year = (searchParams.get("year") ?? "").trim();

  try {
    const data = await fetchRecalls(make, model, year);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ count: 0, recalls: [], unavailable: true }, { status: 200 });
  }
}
