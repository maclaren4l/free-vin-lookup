// Brand styling map. We resolve NHTSA's `Make` field to a known brand so the UI
// can render a per-brand accent color + monogram. We intentionally use text
// monograms (not trademarked logo images) to stay license-clean.

export interface Brand {
  id: string;
  name: string;
  /** Accent color driving the UI theme when this make is decoded */
  accent: string;
  group: string;
  /** Optional short tagline shown under the brand name */
  note?: string;
}

export const GENERIC_BRAND: Brand = {
  id: "generic",
  name: "Vehicle",
  accent: "#6366f1",
  group: "Other",
};

// Keys are lowercase, matched against a normalized NHTSA make.
const BRANDS: Record<string, Brand> = {
  polestar: { id: "polestar", name: "Polestar", accent: "#E8B923", group: "EV / Performance", note: "Priority brand" },

  // US domestic
  ford: { id: "ford", name: "Ford", accent: "#1666C9", group: "US Domestic" },
  lincoln: { id: "lincoln", name: "Lincoln", accent: "#8A9AA7", group: "US Domestic" },
  chevrolet: { id: "chevrolet", name: "Chevrolet", accent: "#E5B842", group: "GM" },
  gmc: { id: "gmc", name: "GMC", accent: "#C8102E", group: "GM" },
  cadillac: { id: "cadillac", name: "Cadillac", accent: "#A6192E", group: "GM" },
  buick: { id: "buick", name: "Buick", accent: "#971B2F", group: "GM" },
  ram: { id: "ram", name: "RAM", accent: "#B5121B", group: "Stellantis" },
  jeep: { id: "jeep", name: "Jeep", accent: "#4B6A3A", group: "Stellantis" },
  dodge: { id: "dodge", name: "Dodge", accent: "#D1121B", group: "Stellantis" },
  chrysler: { id: "chrysler", name: "Chrysler", accent: "#0F5FA6", group: "Stellantis" },

  // Japanese
  toyota: { id: "toyota", name: "Toyota", accent: "#EB0A1E", group: "Japanese" },
  lexus: { id: "lexus", name: "Lexus", accent: "#8B95A0", group: "Japanese" },
  honda: { id: "honda", name: "Honda", accent: "#CC0000", group: "Japanese" },
  acura: { id: "acura", name: "Acura", accent: "#9AA4AD", group: "Japanese" },
  nissan: { id: "nissan", name: "Nissan", accent: "#C3002F", group: "Japanese" },
  infiniti: { id: "infiniti", name: "Infiniti", accent: "#8C9196", group: "Japanese" },
  subaru: { id: "subaru", name: "Subaru", accent: "#0E4C92", group: "Japanese" },
  mazda: { id: "mazda", name: "Mazda", accent: "#910A2D", group: "Japanese" },

  // German / European
  bmw: { id: "bmw", name: "BMW", accent: "#0066B1", group: "German / European" },
  "mercedes-benz": { id: "mercedes-benz", name: "Mercedes-Benz", accent: "#4DB6BD", group: "German / European" },
  mercedes: { id: "mercedes-benz", name: "Mercedes-Benz", accent: "#4DB6BD", group: "German / European" },
  volkswagen: { id: "volkswagen", name: "Volkswagen", accent: "#1E63C4", group: "German / European" },
  audi: { id: "audi", name: "Audi", accent: "#BB0A30", group: "German / European" },
  porsche: { id: "porsche", name: "Porsche", accent: "#C99700", group: "German / European" },

  // EV-focused
  tesla: { id: "tesla", name: "Tesla", accent: "#E82127", group: "EV" },
  rivian: { id: "rivian", name: "Rivian", accent: "#F2C230", group: "EV" },
  lucid: { id: "lucid", name: "Lucid", accent: "#1C8CA8", group: "EV" },
};

export function resolveBrand(make: string | null | undefined): Brand {
  if (!make) return GENERIC_BRAND;
  const key = make.trim().toLowerCase();
  if (BRANDS[key]) return BRANDS[key];
  // Loose contains match (e.g. "MERCEDES-BENZ USA" style values)
  for (const [k, brand] of Object.entries(BRANDS)) {
    if (key.includes(k)) return brand;
  }
  return { ...GENERIC_BRAND, name: titleCase(make) };
}

export function brandMonogram(brand: Brand): string {
  const words = brand.name.replace(/[^A-Za-z0-9 -]/g, "").split(/[\s-]+/);
  if (brand.name.length <= 3) return brand.name.toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
