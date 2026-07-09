import { NextResponse } from "next/server";
import { validateVin } from "@/lib/vin";
import { decodeVin } from "@/lib/nhtsa";
import { normalize } from "@/lib/normalize";

// Server-side proxy → NHTSA. Keeps the browser off cross-origin calls, lets us
// normalize the payload, and leaves room to add a paid options provider later.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vinParam = searchParams.get("vin") ?? "";

  const validation = validateVin(vinParam);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, vin: validation.normalized },
      { status: 400 },
    );
  }

  try {
    const record = await decodeVin(validation.normalized);
    const result = normalize(validation.normalized, record);

    // Fold the client-side check-digit note into the result warnings.
    if (validation.warning) {
      result.warnings = [validation.warning, ...result.warnings];
    }

    // If NHTSA couldn't even resolve a make, treat it as "not found".
    if (result.make === "Unknown" && !result.model && !result.modelYear) {
      return NextResponse.json(
        {
          error:
            "NHTSA couldn't decode that VIN. Double-check the characters — it may be a typo or a vehicle not in the US database.",
          vin: validation.normalized,
          warnings: result.warnings,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error decoding VIN.";
    return NextResponse.json({ error: message, vin: validation.normalized }, { status: 502 });
  }
}
