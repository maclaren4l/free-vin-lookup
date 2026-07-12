"use client";

import { AlertTriangle, ShieldCheck, Sparkles, Info } from "lucide-react";
import type {
  DecodeResult,
  RecallsData,
  SafetyData,
  VehicleImage as VehicleImageType,
} from "@/lib/types";
import { resolveBrand, vehicleHeadline } from "@/lib/brands";
import { pickQuickStats } from "@/lib/profile-stats";
import { ProfileHero } from "./profile-hero";
import { StatPills } from "./stat-pills";
import { SafetyGauge } from "./safety-gauge";
import { ChecklistCard } from "./checklist-card";
import { RecallTimeline } from "./recall-timeline";
import { ProfileSpecCard } from "./profile-spec-card";

export function ProfileShell({
  result,
  image,
  imageLoading,
  recalls,
  recallsLoading,
  safety,
  safetyLoading,
}: {
  result: DecodeResult;
  image: VehicleImageType | null;
  imageLoading: boolean;
  recalls: RecallsData | null;
  recallsLoading: boolean;
  safety: SafetyData | null;
  safetyLoading: boolean;
}) {
  const brand = resolveBrand(result.make);
  const headline = vehicleHeadline(result.modelYear, brand.name, result.model);
  const quickStats = pickQuickStats(result);

  // Identity & Powertrain read first (who/what it is); Chassis & Manufacturing
  // and the recall timeline are lower-priority detail, pushed further down.
  const topSections = result.sections.filter((s) => s.id === "identity" || s.id === "powertrain");
  const lowerSections = result.sections.filter((s) => s.id !== "identity" && s.id !== "powertrain");

  return (
    <div className="theme-profile">
      {result.warnings.length > 0 && (
        <div
          className="rounded-2xl border p-4 flex gap-3 mb-5"
          style={{ borderColor: "rgba(217,119,6,0.35)", background: "rgba(217,119,6,0.08)" }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1" style={{ color: "#7c4a03" }}>
            {result.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        {/* Portrait profile card */}
        <div className="space-y-3 self-start">
          <ProfileHero
            headline={headline || brand.name}
            trim={result.trim}
            vin={result.vin}
            brandGroup={brand.group}
            image={image}
            imageLoading={imageLoading}
          />
          <p className="text-xs px-1 leading-relaxed" style={{ color: "var(--profile-ink-faint)" }}>
            Representative photo, closest match for this make/model/year, not the actual vehicle.
          </p>
        </div>

        {/* Content column */}
        <div className="space-y-5 min-w-0">
          <StatPills stats={quickStats} />

          <div className="grid sm:grid-cols-2 gap-5">
            {topSections.map((section, i) => (
              <ProfileSpecCard key={section.id} section={section} index={i} />
            ))}
          </div>

          <SafetyGauge data={safety} loading={safetyLoading} delay={0.1} />

          <div className="grid sm:grid-cols-2 gap-5">
            <ChecklistCard
              title="Standard Equipment"
              icon={<ShieldCheck className="h-4 w-4" style={{ color: "var(--brand-accent)" }} />}
              items={result.equipment}
              delay={0.15}
              emptyText="No standard-equipment data reported for this configuration."
            />
            <ChecklistCard
              title="Available Options"
              icon={<Sparkles className="h-4 w-4" style={{ color: "var(--brand-accent)" }} />}
              items={result.options}
              delay={0.2}
              emptyText="No optional features flagged for this configuration."
              hideStatus
            />
          </div>

          <div className="profile-card rounded-2xl p-4 flex gap-3">
            <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--profile-ink-faint)" }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--profile-ink-soft)" }}>
              Equipment reflects the manufacturer&apos;s NHTSA filing for this trim, not a per-VIN
              factory build sheet. True as-built option codes aren&apos;t available from free/open
              data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {lowerSections.map((section, i) => (
              <ProfileSpecCard key={section.id} section={section} index={topSections.length + i} />
            ))}
          </div>

          <RecallTimeline data={recalls} loading={recallsLoading} delay={0.25} />
        </div>
      </div>

      <p className="text-center text-xs pt-6" style={{ color: "var(--profile-ink-faint)" }}>
        Specifications decoded from the free NHTSA vPIC database, recalls and ratings from NHTSA.
        Imagery from Wikimedia Commons. No API keys, no paywalls.
      </p>
    </div>
  );
}
