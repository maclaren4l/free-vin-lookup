// NHTSA NCAP Safety Ratings API — free, no key. Two-step:
//   1) list rated variants for a model year/make/model
//   2) fetch star ratings for each VehicleId
// Docs: https://api.nhtsa.gov/SafetyRatings

import type { SafetyData, SafetyRating } from "./types";

const BASE = "https://api.nhtsa.gov/SafetyRatings";
const MAX_VARIANTS = 4; // cap detail calls

interface VariantRow {
  VehicleId: number;
  VehicleDescription: string;
}

interface RatingRow {
  VehicleId: number;
  VehicleDescription?: string;
  OverallRating?: string;
  OverallFrontCrashRating?: string;
  OverallSideCrashRating?: string;
  RolloverRating?: string;
}

export async function fetchSafety(
  make: string,
  model: string,
  year: string,
): Promise<SafetyData> {
  if (!make || !model || !year) {
    return { count: 0, ratings: [], unavailable: true };
  }

  const listUrl = `${BASE}/modelyear/${encodeURIComponent(year)}/make/${encodeURIComponent(
    make,
  )}/model/${encodeURIComponent(model)}`;

  const listRes = await fetch(listUrl, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!listRes.ok) throw new Error(`NHTSA safety list failed (${listRes.status})`);

  const listData = (await listRes.json()) as { Count?: number; Results?: VariantRow[] };
  const variants = (listData.Results ?? []).slice(0, MAX_VARIANTS);
  if (variants.length === 0) return { count: 0, ratings: [] };

  const ratings = await Promise.all(
    variants.map(async (v): Promise<SafetyRating | null> => {
      try {
        const res = await fetch(`${BASE}/VehicleId/${v.VehicleId}`, {
          headers: { Accept: "application/json" },
          next: { revalidate: 60 * 60 * 24 },
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { Results?: RatingRow[] };
        const row = data.Results?.[0];
        if (!row) return null;
        return {
          vehicleId: v.VehicleId,
          description: (row.VehicleDescription ?? v.VehicleDescription ?? "").trim(),
          overall: norm(row.OverallRating),
          frontCrash: norm(row.OverallFrontCrashRating),
          sideCrash: norm(row.OverallSideCrashRating),
          rollover: norm(row.RolloverRating),
        };
      } catch {
        return null;
      }
    }),
  );

  const clean = ratings.filter((r): r is SafetyRating => r !== null);
  return { count: clean.length, ratings: clean };
}

function norm(v: string | undefined): string {
  const t = (v ?? "").trim();
  if (!t || /not rated|not applicable/i.test(t)) return "";
  return t;
}
