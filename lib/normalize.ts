import type { NhtsaRecord } from "./nhtsa";
import { extractWarnings } from "./nhtsa";
import { resolveBrand } from "./brands";
import type { DecodeResult, EquipmentItem, SpecRow, SpecSection } from "./types";

const EMPTY = new Set(["", "not applicable", "n/a", "na"]);

function clean(v: string | undefined): string {
  if (v == null) return "";
  const t = v.trim();
  if (EMPTY.has(t.toLowerCase())) return "";
  return t;
}

/** Build a section from [label, key] pairs, dropping empty values. */
function buildSection(
  id: string,
  title: string,
  r: NhtsaRecord,
  fields: [label: string, key: string, format?: (v: string) => string][],
): SpecSection {
  const rows: SpecRow[] = [];
  for (const [label, key, format] of fields) {
    const raw = clean(r[key]);
    if (!raw) continue;
    rows.push({ label, value: format ? format(raw) : raw });
  }
  return { id, title, rows };
}

const withUnit = (unit: string) => (v: string) =>
  new RegExp(unit.trim(), "i").test(v) ? v : `${v} ${unit}`.trim();

/** Round a numeric string to `digits` decimals before appending a unit. */
const rounded = (unit: string, digits: number) => (v: string) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return withUnit(unit)(v);
  const num = digits === 0 ? Math.round(n).toLocaleString("en-US") : n.toFixed(digits);
  return `${num} ${unit}`;
};

// Equipment / safety fields → friendly labels. Values keep NHTSA's own wording
// (Standard / Optional / Not Available / location text) so nothing is invented.
const EQUIPMENT_FIELDS: [label: string, key: string][] = [
  ["Front Airbags", "AirBagLocFront"],
  ["Side Airbags", "AirBagLocSide"],
  ["Curtain Airbags", "AirBagLocCurtain"],
  ["Knee Airbags", "AirBagLocKnee"],
  ["Seat Cushion Airbags", "AirBagLocSeatCushion"],
  ["Pretensioner", "Pretensioner"],
  ["Seat Belt Type", "SeatBeltsAll"],
  ["Anti-lock Braking (ABS)", "ABS"],
  ["Electronic Stability Control (ESC)", "ESC"],
  ["Traction Control", "TractionControl"],
  ["Tire Pressure Monitoring (TPMS)", "TPMS"],
  ["Backup Camera", "RearVisibilitySystem"],
  ["Parking Assist", "ParkAssist"],
  ["Adaptive Cruise Control", "AdaptiveCruiseControl"],
  ["Forward Collision Warning", "ForwardCollisionWarning"],
  ["Crash Imminent Braking", "CIB"],
  ["Dynamic Brake Support", "DynamicBrakeSupport"],
  ["Pedestrian Auto Emergency Braking", "PedestrianAutomaticEmergencyBraking"],
  ["Blind Spot Warning", "BlindSpotMon"],
  ["Blind Spot Intervention", "BlindSpotIntervention"],
  ["Lane Departure Warning", "LaneDepartureWarning"],
  ["Lane Keeping Assist", "LaneKeepSystem"],
  ["Lane Centering", "LaneCenteringAssistance"],
  ["Daytime Running Lights", "DaytimeRunningLight"],
  ["Adaptive Headlights", "AdaptiveDrivingBeam"],
  ["Auto Headlamp Beam Switching", "SemiautomaticHeadlampBeamSwitching"],
  ["Keyless Ignition", "KeylessIgnition"],
  ["Event Data Recorder (EDR)", "EDR"],
  ["Automatic Crash Notification", "AutomaticPedestrianAlertingSound"],
];

export function normalize(vin: string, r: NhtsaRecord): DecodeResult {
  const make = clean(r.Make) || "Unknown";
  const model = clean(r.Model);
  const modelYear = clean(r.ModelYear);
  const trim = clean(r.Trim) || clean(r.Trim2) || clean(r.Series);
  const bodyClass = clean(r.BodyClass);
  const vehicleType = clean(r.VehicleType);
  const brand = resolveBrand(make);

  const sections: SpecSection[] = [
    buildSection("identity", "Identity", r, [
      ["Make", "Make"],
      ["Model", "Model"],
      ["Model Year", "ModelYear"],
      ["Trim", "Trim"],
      ["Trim (2)", "Trim2"],
      ["Series", "Series"],
      ["Series (2)", "Series2"],
      ["Vehicle Type", "VehicleType"],
      ["Body Class", "BodyClass"],
      ["Doors", "Doors"],
    ]),
    buildSection("powertrain", "Powertrain", r, [
      ["Engine Model", "EngineModel"],
      ["Displacement", "DisplacementL", rounded("L", 1)],
      ["Displacement (cc)", "DisplacementCC", rounded("cc", 0)],
      ["Cylinders", "EngineCylinders"],
      ["Configuration", "EngineConfiguration"],
      ["Horsepower", "EngineHP", withUnit("hp")],
      ["Engine (kW)", "EngineKW", withUnit("kW")],
      ["Fuel — Primary", "FuelTypePrimary"],
      ["Fuel — Secondary", "FuelTypeSecondary"],
      ["Electrification", "ElectrificationLevel"],
      ["Turbo", "Turbo"],
      ["Engine Manufacturer", "EngineManufacturer"],
      ["Transmission", "TransmissionStyle"],
      ["Transmission Speeds", "TransmissionSpeeds"],
      ["Drive Type", "DriveType"],
      ["Top Speed", "TopSpeedMPH", withUnit("mph")],
    ]),
    buildSection("chassis", "Body & Chassis", r, [
      ["Doors", "Doors"],
      ["Windows", "Windows"],
      ["Wheelbase", "WheelBaseShort", withUnit("in")],
      ["Wheelbase (long)", "WheelBaseLong", withUnit("in")],
      ["Wheels", "Wheels"],
      ["Front Wheel Size", "WheelSizeFront", withUnit("in")],
      ["Rear Wheel Size", "WheelSizeRear", withUnit("in")],
      ["Curb Weight", "CurbWeightLB", withUnit("lb")],
      ["GVWR", "GVWR"],
      ["Bed Type", "BedType"],
      ["Cab Type", "CabType"],
      ["Brake System", "BrakeSystemType"],
      ["Axles", "Axles"],
      ["Seat Rows", "SeatRows"],
      ["Seats", "Seats"],
      ["Steering Location", "SteeringLocation"],
    ]),
    buildSection("manufacturing", "Manufacturing", r, [
      ["Manufacturer", "Manufacturer"],
      ["Plant City", "PlantCity"],
      ["Plant State", "PlantState"],
      ["Plant Country", "PlantCountry"],
      ["Plant Company", "PlantCompanyName"],
      ["Note", "Note"],
    ]),
  ].filter((s) => s.rows.length > 0);

  const equipment: EquipmentItem[] = [];
  const options: EquipmentItem[] = [];
  for (const [label, key] of EQUIPMENT_FIELDS) {
    const value = clean(r[key]);
    if (!value) continue;
    const item = { label, status: value };
    // "Optional" = available but not standard → its own tile section.
    if (/optional/i.test(value)) options.push(item);
    else equipment.push(item);
  }

  return {
    vin,
    make,
    model,
    modelYear,
    trim,
    bodyClass,
    vehicleType,
    sections,
    equipment,
    options,
    warnings: extractWarnings(r),
    brandId: brand.id,
  };
}
