// EPA fuel-economy enricher — fueleconomy.gov web services (free, no key).
// Docs: https://www.fueleconomy.gov/feg/ws/
//
// NHTSA gives us make/model/year/trim but no efficiency data. The EPA keys its
// data off descriptive model strings ("iX M60 (21 inch Wheels)"), so we fuzzy-
// match NHTSA's terser model + trim against the EPA model menu, then pull the
// vehicle record. Any miss returns {} — enrichment is always best-effort.

import type { EconomyData, EnrichInput, Enrichment, VehicleEnricher } from "./types";
import { resolveBrand } from "../brands";

const BASE = "https://www.fueleconomy.gov/ws/rest";
const DAY = 60 * 60 * 24;

interface MenuItem {
  text: string;
  value: string;
}
interface MenuResponse {
  menuItem?: MenuItem | MenuItem[];
}
// fueleconomy.gov returns every field as a string, even numeric ones, so the
// raw record is loosely typed and coerced in buildEconomy().
type VehicleRecord = Record<string, string | number | boolean>;

async function feGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: DAY },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function menuItems(res: MenuResponse | null): MenuItem[] {
  if (!res?.menuItem) return [];
  return Array.isArray(res.menuItem) ? res.menuItem : [res.menuItem];
}

// Lowercase, drop hyphens (NHTSA "F-150" vs EPA "F150"), collapse whitespace.
const norm = (s: string) => s.toLowerCase().replace(/-/g, "").replace(/\s+/g, " ").trim();

/**
 * NHTSA sometimes bakes the brand into the model ("Polestar 2") while EPA lists
 * it bare ("2"), and vice-versa. Build the model strings worth trying: the full
 * value, plus a brand-stripped variant when the model leads with the make.
 */
function modelCandidates(make: string, model: string): string[] {
  const m = norm(model);
  if (!m) return [];
  const mk = norm(make);
  const out = [m];
  if (mk && m.startsWith(`${mk} `)) out.push(m.slice(mk.length + 1));
  return out;
}

/**
 * Choose the EPA model string that best matches NHTSA's model + trim.
 *
 * Exact equality on any candidate wins outright — it protects base trims (a gas
 * "Camry" must not lose to "Camry Hybrid LE" over a shared "LE" trim) and short
 * bare names ("Polestar 2" → EPA "2"). Otherwise we require a candidate to
 * appear and score trim-token hits, tie-breaking toward the shortest (least-
 * qualified) entry — which is how variant-only lines like "iX M60" get matched.
 */
function pickModel(models: MenuItem[], candidates: string[], trim: string): MenuItem | null {
  if (candidates.length === 0) return null;

  for (const c of candidates) {
    const exact = models.find((it) => norm(it.text) === c);
    if (exact) return exact;
  }

  const trimTokens = norm(trim)
    .split(" ")
    .filter((t) => t.length > 1);

  const scored = models
    .map((it) => {
      const t = norm(it.text);
      const hit = candidates.find((c) => t.includes(c));
      if (!hit) return null;
      let score = t.startsWith(hit) ? 2 : 0;
      for (const tok of trimTokens) if (t.includes(tok)) score += 3;
      return { it, score, len: t.length };
    })
    .filter((x): x is { it: MenuItem; score: number; len: number } => x !== null);
  if (scored.length === 0) return null;

  scored.sort((a, b) => b.score - a.score || a.len - b.len);
  return scored[0].it;
}

const num = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const str = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s || undefined;
};
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function buildEconomy(v: VehicleRecord, matchedModel: string): EconomyData {
  const atvType = str(v.atvType) ?? "";
  const electric = atvType === "EV" || str(v.fuelType1) === "Electricity";
  const plugIn = v.phevBlended === true || v.phevBlended === "true" || /plug-in|phev/i.test(atvType);
  const effUnit = electric || plugIn ? "MPGe" : "MPG";

  const eff = (v2: unknown) => {
    const n = num(v2);
    return n && n > 0 ? `${n} ${effUnit}` : undefined;
  };
  const range = num(v.range);
  const combE = num(v.combE);
  const cost = num(v.fuelCost08);
  const co2 = num(v.co2TailpipeGpm);
  const ghg = num(v.ghgScore);

  return {
    available: true,
    source: "fueleconomy.gov",
    matchedModel,
    fuelType: str(v.fuelType),
    isElectric: electric,
    isPlugIn: plugIn,
    efficiencyCombined: eff(v.comb08),
    efficiencyCity: eff(v.city08),
    efficiencyHighway: eff(v.highway08),
    range: range && range > 0 ? `${Math.round(range)} mi` : undefined,
    consumption: (electric || plugIn) && combE && combE > 0 ? `${combE.toFixed(1)} kWh/100mi` : undefined,
    annualFuelCost: cost && cost > 0 ? money(cost) : undefined,
    co2: co2 !== undefined && co2 >= 0 ? `${Math.round(co2)} g/mi` : undefined,
    ghgScore: ghg && ghg > 0 ? `${ghg}/10` : undefined,
    evMotor: str(v.evMotor),
  };
}

export const fuelEconomyEnricher: VehicleEnricher = {
  id: "fueleconomy.gov",

  supports(input: EnrichInput): boolean {
    return Boolean(input.make && input.model && input.modelYear);
  },

  async enrich(input: EnrichInput): Promise<Partial<Enrichment>> {
    const { make, model, modelYear, trim } = input;
    const q = `year=${encodeURIComponent(modelYear)}&make=${encodeURIComponent(make)}`;

    const models = menuItems(await feGet<MenuResponse>(`/vehicle/menu/model?${q}`));
    if (models.length === 0) return {};

    const matched = pickModel(models, modelCandidates(make, model), trim);
    if (!matched) return {};

    const options = menuItems(
      await feGet<MenuResponse>(`/vehicle/menu/options?${q}&model=${encodeURIComponent(matched.value)}`),
    );
    const vehicleId = options[0]?.value;
    if (!vehicleId) return {};

    const record = await feGet<VehicleRecord>(`/vehicle/${encodeURIComponent(vehicleId)}`);
    if (!record) return {};

    // EPA's bare model names (Polestar "2", MINI "Hardtop") read oddly on their
    // own; prefix the proper-cased brand when the name doesn't already carry it.
    const brandName = resolveBrand(make).name;
    const label = norm(matched.text).includes(norm(brandName))
      ? matched.text
      : `${brandName} ${matched.text}`;

    return { economy: buildEconomy(record, label) };
  },
};
