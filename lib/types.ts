export interface SpecRow {
  label: string;
  value: string;
}

export interface SpecSection {
  id: string;
  title: string;
  rows: SpecRow[];
}

export interface EquipmentItem {
  label: string;
  /** "Standard" | "Optional" | "Not Available" | free text from NHTSA */
  status: string;
}

export interface Recall {
  campaign: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
}

export interface RecallsData {
  count: number;
  recalls: Recall[];
  /** Null when the lookup couldn't run (missing make/model/year) */
  unavailable?: boolean;
}

export interface SafetyRating {
  vehicleId: number;
  description: string;
  overall: string;
  frontCrash: string;
  sideCrash: string;
  rollover: string;
}

export interface SafetyData {
  count: number;
  ratings: SafetyRating[];
  unavailable?: boolean;
}

export interface VehicleImage {
  imageUrl: string | null;
  sourceUrl: string | null;
  credit: string | null;
  license: string | null;
  /** true when we fell back to the bundled silhouette */
  placeholder: boolean;
  query: string | null;
}

export interface DecodeResult {
  vin: string;
  /** Headline fields for the result hero */
  make: string;
  model: string;
  modelYear: string;
  trim: string;
  bodyClass: string;
  vehicleType: string;
  /** Grouped, display-ready spec sections */
  sections: SpecSection[];
  /** Standard / safety equipment, labeled honestly */
  equipment: EquipmentItem[];
  /** Equipment NHTSA flags as Optional (not standard) — rendered as tiles */
  options: EquipmentItem[];
  /** Non-blocking NHTSA warnings (ErrorText, etc.) */
  warnings: string[];
  /** Brand id resolved from make (see lib/brands.ts) */
  brandId: string;
}
