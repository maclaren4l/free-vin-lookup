"use client";

import { motion } from "framer-motion";
import { Zap, Fuel, Leaf, Gauge } from "lucide-react";
import type { EconomyData } from "@/lib/enrich";

/** Pick the four headline tiles that fit the powertrain. */
function tilesFor(e: EconomyData): { label: string; value: string }[] {
  const t: { label: string; value: string }[] = [];
  const push = (label: string, value?: string) => {
    if (value) t.push({ label, value });
  };
  if (e.isElectric || e.isPlugIn) {
    push("EPA Range", e.range);
    push("Efficiency", e.efficiencyCombined);
    push("Energy Use", e.consumption);
    push("Annual Cost", e.annualFuelCost);
  } else {
    push("Combined", e.efficiencyCombined);
    push("City", e.efficiencyCity);
    push("Highway", e.efficiencyHighway);
    push("Annual Cost", e.annualFuelCost);
  }
  return t.slice(0, 4);
}

export function EfficiencyCard({
  economy,
  loading,
  delay = 0,
}: {
  economy: EconomyData | null;
  loading: boolean;
  delay?: number;
}) {
  // Additive: if there's genuinely nothing to show, render nothing.
  if (!loading && (!economy || !economy.available)) return null;

  const electric = economy?.isElectric || economy?.isPlugIn;
  const Icon = electric ? Zap : Fuel;
  const tiles = economy ? tilesFor(economy) : [];

  const badges: { icon: typeof Leaf; text: string }[] = [];
  if (economy?.co2) badges.push({ icon: Leaf, text: `${economy.co2} CO₂` });
  if (economy?.ghgScore) badges.push({ icon: Gauge, text: `GHG ${economy.ghgScore}` });
  if (economy?.evMotor) badges.push({ icon: Zap, text: economy.evMotor });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="profile-card rounded-[20px] p-5"
    >
      <p
        className="text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4"
        style={{ color: "var(--profile-ink-faint)" }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--brand-accent)" }} />
        {electric ? "EV Efficiency" : "Fuel Economy"}
      </p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl shimmer bg-black/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tiles.map((tile) => (
              <div key={tile.label} className="profile-pill rounded-2xl px-3.5 py-2.5 flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--profile-ink-faint)" }}>
                  {tile.label}
                </span>
                <span className="text-base font-semibold leading-tight" style={{ color: "var(--profile-ink)" }}>
                  {tile.value}
                </span>
              </div>
            ))}
          </div>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
              {badges.map((b) => (
                <span
                  key={b.text}
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: "var(--profile-ink-soft)" }}
                >
                  <b.icon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--brand-accent)" }} />
                  {b.text}
                </span>
              ))}
            </div>
          )}

          <p className="text-[11px] mt-4 leading-relaxed" style={{ color: "var(--profile-ink-faint)" }}>
            EPA estimates via fueleconomy.gov
            {economy?.matchedModel ? ` · based on ${economy.matchedModel}` : ""}. Actual figures vary
            with configuration and driving.
          </p>
        </>
      )}
    </motion.div>
  );
}
