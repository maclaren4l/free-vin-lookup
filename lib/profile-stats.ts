import type { DecodeResult } from "./types";

export interface QuickStat {
  label: string;
  value: string;
}

// Ordered by how useful they are at a glance; first few that exist win.
const QUICK_STAT_LABELS: [wanted: string, short: string][] = [
  ["Horsepower", "Horsepower"],
  ["Fuel — Primary", "Fuel"],
  ["Drive Type", "Drive"],
  ["Transmission", "Transmission"],
  ["Body Class", "Body"],
  ["Doors", "Doors"],
];

export function pickQuickStats(result: DecodeResult, max = 4): QuickStat[] {
  const allRows = result.sections.flatMap((s) => s.rows);
  const stats: QuickStat[] = [];
  for (const [wanted, short] of QUICK_STAT_LABELS) {
    if (stats.length >= max) break;
    const row = allRows.find((r) => r.label === wanted);
    if (row) stats.push({ label: short, value: row.value });
  }
  return stats;
}
