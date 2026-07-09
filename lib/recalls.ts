// NHTSA Recalls API — free, no key. Recalls are issued per make/model/year
// (not per VIN), which is exactly what our decode gives us.
// Docs: https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls

import type { Recall, RecallsData } from "./types";

const BASE = "https://api.nhtsa.gov/recalls/recallsByVehicle";

interface NhtsaRecallRow {
  NHTSACampaignNumber?: string;
  Component?: string;
  Summary?: string;
  Consequence?: string;
  Remedy?: string;
  ReportReceivedDate?: string;
}

export async function fetchRecalls(
  make: string,
  model: string,
  year: string,
): Promise<RecallsData> {
  if (!make || !model || !year) {
    return { count: 0, recalls: [], unavailable: true };
  }

  const params = new URLSearchParams({ make, model, modelYear: year });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 12 },
  });
  if (!res.ok) throw new Error(`NHTSA recalls request failed (${res.status})`);

  const data = (await res.json()) as { Count?: number; results?: NhtsaRecallRow[] };
  const rows = (data.results ?? []).map((r) => ({
    ts: parseTs(r.ReportReceivedDate),
    recall: {
      campaign: (r.NHTSACampaignNumber ?? "").trim(),
      component: (r.Component ?? "").trim(),
      summary: (r.Summary ?? "").trim(),
      consequence: (r.Consequence ?? "").trim(),
      remedy: (r.Remedy ?? "").trim(),
      reportDate: formatDate(r.ReportReceivedDate),
    } satisfies Recall,
  }));

  // Newest first by actual timestamp.
  rows.sort((a, b) => b.ts - a.ts);

  return { count: rows.length, recalls: rows.map((r) => r.recall) };
}

function parseTs(raw: string | undefined): number {
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function formatDate(raw: string | undefined): string {
  if (!raw) return "";
  // NHTSA returns e.g. "24/09/2015" or ISO — keep it simple and readable.
  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) {
    return iso.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  return raw.trim();
}
