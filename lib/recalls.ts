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

// NHTSA sends ReportReceivedDate as DD/MM/YYYY (e.g. "24/03/2021"), which
// JS's Date constructor cannot parse (it assumes MM/DD/YYYY for slash-form
// strings and silently returns Invalid Date). Parse it explicitly.
function parseNhtsaDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const match = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseTs(raw: string | undefined): number {
  return parseNhtsaDate(raw)?.getTime() ?? 0;
}

function formatDate(raw: string | undefined): string {
  const d = parseNhtsaDate(raw);
  if (!d) return (raw ?? "").trim();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
