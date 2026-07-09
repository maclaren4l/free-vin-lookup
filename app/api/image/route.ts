import { NextResponse } from "next/server";
import { findVehicleImage } from "@/lib/image";

// Server-side proxy → Wikimedia Commons. Returns a representative "closest match"
// image + attribution, or a placeholder flag when nothing suitable is found.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = (searchParams.get("make") ?? "").trim();
  const model = (searchParams.get("model") ?? "").trim();
  const modelYear = (searchParams.get("year") ?? "").trim();
  const bodyClass = (searchParams.get("body") ?? "").trim();

  if (!make) {
    return NextResponse.json({ error: "make is required" }, { status: 400 });
  }

  try {
    const image = await findVehicleImage({ make, model, modelYear, bodyClass });
    return NextResponse.json(image);
  } catch {
    return NextResponse.json(
      { imageUrl: null, sourceUrl: null, credit: null, license: null, placeholder: true, query: null },
      { status: 200 },
    );
  }
}
