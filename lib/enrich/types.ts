// Enrichment layer — optional, per-source adapters that add depth on top of the
// universal NHTSA decode. NHTSA stays the base for every VIN; an enricher only
// contributes when it `supports()` the decoded vehicle and finds a match.
//
// This is the seam where a future paid per-VIN options provider (BMW SA codes,
// etc.) drops in as just another VehicleEnricher — no changes to the decode
// pipeline or the route that runs the registry.

import type { DecodeResult } from "../types";

/** The decoded fields an enricher is allowed to key off (never the raw VIN
 *  unless the adapter genuinely needs it — most match on make/model/year). */
export type EnrichInput = Pick<
  DecodeResult,
  "vin" | "make" | "model" | "modelYear" | "trim"
>;

/** EPA fuel-economy / efficiency data from fueleconomy.gov (free, no key). */
export interface EconomyData {
  available: boolean;
  /** "Electricity" | "Gasoline" | "Diesel" | … (EPA's own wording) */
  fuelType?: string;
  isElectric?: boolean;
  isPlugIn?: boolean;
  /** Combined efficiency, unit-suffixed: "76 MPGe" or "28 MPG". */
  efficiencyCombined?: string;
  efficiencyCity?: string;
  efficiencyHighway?: string;
  /** EV/PHEV driving range, e.g. "284 mi". */
  range?: string;
  /** Electric consumption, e.g. "44.4 kWh/100mi". */
  consumption?: string;
  /** Estimated annual energy cost, e.g. "$1,000". */
  annualFuelCost?: string;
  /** Tailpipe CO2, e.g. "0 g/mi". */
  co2?: string;
  /** EPA greenhouse-gas score, e.g. "10/10". */
  ghgScore?: string;
  /** EV motor description when present, e.g. "190 and 360 kW EESM". */
  evMotor?: string;
  /** The fueleconomy.gov model string we matched against (for transparency). */
  matchedModel?: string;
  /** Always attributed so nothing is presented as our own measurement. */
  source: "fueleconomy.gov";
}

/** The merged shape returned by the enrichment registry. Grows over time. */
export interface Enrichment {
  economy?: EconomyData;
  // future: buildOptions?: BuildOptionsData;  // per-VIN factory options (paid)
}

export interface VehicleEnricher {
  /** Stable id for logging/debugging. */
  id: string;
  /** Cheap, synchronous gate — does this adapter apply to the vehicle at all? */
  supports(input: EnrichInput): boolean;
  /** Do the network work. MUST resolve (never throw); return {} on any miss. */
  enrich(input: EnrichInput): Promise<Partial<Enrichment>>;
}
