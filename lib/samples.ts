// Curated sample VINs across priority brands so users can test instantly.
// These use real manufacturer WMIs; NHTSA resolves make/model/year from them.
// (Serial digits are zeroed, so a check-digit warning may appear — that's
// intentional and also demonstrates the non-blocking warning UX.)

export interface SampleVin {
  vin: string;
  label: string;
}

export const SAMPLE_VINS: SampleVin[] = [
  { vin: "5YJ3E1EA7JF000000", label: "Tesla Model 3" },
  { vin: "1FTFW1E50MFA00000", label: "Ford F-150" },
  { vin: "1G1YY2D79F5000000", label: "Chevrolet Corvette" },
  { vin: "1HGCM82633A004352", label: "Honda Accord" },
  { vin: "4T1BF1FK5CU000000", label: "Toyota Camry" },
  { vin: "WBA8E9C50GK000000", label: "BMW 3 Series" },
  { vin: "WP0AB2A99KS000000", label: "Porsche 911" },
  { vin: "LPSED3KA9M3000000", label: "Polestar 2" },
  { vin: "4S4BSANC5N3000000", label: "Subaru Outback" },
  { vin: "7FCTGAAA5NN000000", label: "Rivian R1T" },
];
