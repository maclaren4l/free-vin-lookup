// Enrichment registry. Register adapters here; the route calls runEnrichers()
// and gets a merged Enrichment back. Adding a new source (e.g. a paid per-VIN
// options provider) is a one-line push — the pipeline doesn't change.

import type { EnrichInput, Enrichment, VehicleEnricher } from "./types";
import { fuelEconomyEnricher } from "./fueleconomy";

const ENRICHERS: VehicleEnricher[] = [fuelEconomyEnricher];

/**
 * Run every supporting enricher in parallel and shallow-merge their output.
 * Each adapter is isolated: one throwing or timing out never sinks the others.
 */
export async function runEnrichers(input: EnrichInput): Promise<Enrichment> {
  const applicable = ENRICHERS.filter((e) => e.supports(input));

  const results = await Promise.allSettled(applicable.map((e) => e.enrich(input)));

  const merged: Enrichment = {};
  for (const r of results) {
    if (r.status === "fulfilled") Object.assign(merged, r.value);
  }
  return merged;
}

export type { Enrichment, EconomyData, VehicleEnricher, EnrichInput } from "./types";
