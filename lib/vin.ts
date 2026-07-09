// VIN validation helpers.
// A VIN is 17 characters, uppercase, and never contains I, O, or Q.
// North American VINs carry a check digit in position 9 (index 8) computed
// from a fixed transliteration + weight table. Non-NA VINs don't always
// follow it, so a mismatch is treated as a *warning*, not a hard failure.

const DISALLOWED = /[IOQ]/;
const VALID_CHARS = /^[A-HJ-NPR-Z0-9]{17}$/;

const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
  "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export interface VinValidation {
  ok: boolean;
  /** Blocking error that should prevent a lookup */
  error: string | null;
  /** Non-blocking note (e.g. check-digit mismatch) */
  warning: string | null;
  normalized: string;
}

export function normalizeVin(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
}

export function validateVin(raw: string): VinValidation {
  const vin = normalizeVin(raw);

  if (vin.length === 0) {
    return { ok: false, error: "Enter a VIN to begin.", warning: null, normalized: vin };
  }
  if (vin.length !== 17) {
    return {
      ok: false,
      error: `A VIN must be exactly 17 characters — you entered ${vin.length}.`,
      warning: null,
      normalized: vin,
    };
  }
  if (DISALLOWED.test(vin)) {
    return {
      ok: false,
      error: "A VIN cannot contain the letters I, O, or Q.",
      warning: null,
      normalized: vin,
    };
  }
  if (!VALID_CHARS.test(vin)) {
    return {
      ok: false,
      error: "That VIN contains invalid characters.",
      warning: null,
      normalized: vin,
    };
  }

  const warning = checkDigitValid(vin)
    ? null
    : "Check-digit mismatch — this may be an imported/non-North-American VIN or a typo. Decoding anyway.";

  return { ok: true, error: null, warning, normalized: vin };
}

export function checkDigitValid(vin: string): boolean {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const value = TRANSLITERATION[vin[i]];
    if (value === undefined) return false;
    sum += value * WEIGHTS[i];
  }
  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : String(remainder);
  return vin[8] === expected;
}
