// Representative vehicle photo via Wikimedia Commons (free, open, license-clean).
// We search the File namespace for the best raster image matching the decoded
// make/model/year, falling back through a query chain. Anything found is clearly
// labeled in the UI as a "closest match", never the actual vehicle.

import type { VehicleImage } from "./types";

const API = "https://commons.wikimedia.org/w/api.php";
// Wikimedia asks all API clients to send a descriptive User-Agent.
const UA = "VINCoder/0.1 (local demo; https://example.com)";

interface CommonsImageInfo {
  url: string;
  thumburl?: string;
  mime?: string;
  width?: number;
  height?: number;
  extmetadata?: Record<string, { value: string }>;
}

interface CommonsPage {
  title: string;
  index?: number;
  imageinfo?: CommonsImageInfo[];
}

function stripHtml(s: string | undefined): string | null {
  if (!s) return null;
  const text = s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return text || null;
}

const BAD_NAME = /(logo|icon|emblem|badge|diagram|map|interior|dashboard|engine bay)/i;

async function searchCommons(query: string): Promise<VehicleImage | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6", // File:
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1200",
    origin: "*",
  });

  const res = await fetch(`${API}?${params.toString()}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    query?: { pages?: Record<string, CommonsPage> };
  };
  const pages = data.query?.pages;
  if (!pages) return null;

  const candidates = Object.values(pages)
    .filter((p) => !BAD_NAME.test(p.title))
    .sort((a, b) => (a.index ?? 999) - (b.index ?? 999));

  for (const page of candidates) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const mime = info.mime ?? "";
    if (!/image\/(jpeg|png|webp)/.test(mime)) continue; // skip SVG logos etc.
    if (info.width && info.height && info.height > info.width * 1.1) continue; // prefer landscape

    return {
      imageUrl: info.thumburl ?? info.url,
      sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      credit: stripHtml(info.extmetadata?.Artist?.value) ?? "Wikimedia Commons",
      license: stripHtml(info.extmetadata?.LicenseShortName?.value),
      placeholder: false,
      query,
    };
  }
  return null;
}

export async function findVehicleImage(input: {
  make: string;
  model: string;
  modelYear: string;
  bodyClass: string;
}): Promise<VehicleImage> {
  const { make, model, modelYear, bodyClass } = input;
  const queries = [
    [modelYear, make, model].filter(Boolean).join(" "),
    [make, model].filter(Boolean).join(" "),
    [make, bodyClass].filter(Boolean).join(" "),
  ].filter((q) => q.trim().length > 1);

  for (const q of queries) {
    try {
      const hit = await searchCommons(q);
      if (hit) return hit;
    } catch {
      // ignore and continue down the chain
    }
  }

  return {
    imageUrl: null,
    sourceUrl: null,
    credit: null,
    license: null,
    placeholder: true,
    query: queries[0] ?? null,
  };
}
