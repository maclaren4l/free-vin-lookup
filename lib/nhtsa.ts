// NHTSA vPIC — the only genuinely free, no-key, open VIN data source.
// Docs: https://vpic.nhtsa.dot.gov/api/  (CORS-enabled, 24/7, no registration)

const BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

/** Raw flat record returned in Results[0] by DecodeVinValuesExtended. */
export type NhtsaRecord = Record<string, string>;

export interface NhtsaResponse {
  Count: number;
  Message: string;
  Results: NhtsaRecord[];
}

export async function decodeVin(vin: string): Promise<NhtsaRecord> {
  const url = `${BASE}/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // Cache identical VIN decodes for a day — the data is static per VIN.
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    throw new Error(`NHTSA request failed with status ${res.status}`);
  }

  const data = (await res.json()) as NhtsaResponse;
  const record = data.Results?.[0];
  if (!record) {
    throw new Error("NHTSA returned no results for that VIN.");
  }
  return record;
}

/**
 * NHTSA always returns a record, even for junk input, but signals problems via
 * ErrorCode / ErrorText. ErrorCode "0" is a fully clean decode. Anything else
 * is surfaced to the user as a non-blocking warning.
 */
export function extractWarnings(record: NhtsaRecord): string[] {
  const warnings: string[] = [];
  const code = record.ErrorCode ?? "";
  const hasError = code !== "" && code !== "0";
  if (hasError && record.ErrorText) {
    // ErrorText can be a "; "-joined list of coded messages; clean it up.
    const parts = record.ErrorText.split(/;\s*/)
      .map((p) => p.replace(/^\d+\s*-\s*/, "").trim())
      .filter((p) => p && !/^0\b/.test(p));
    warnings.push(...parts);
  }
  if (record.AdditionalErrorText) {
    warnings.push(record.AdditionalErrorText.trim());
  }
  return warnings;
}
