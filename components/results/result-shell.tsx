"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, AlertTriangle } from "lucide-react";
import type {
  DecodeResult,
  RecallsData,
  SafetyData,
  VehicleImage as VehicleImageType,
} from "@/lib/types";
import { resolveBrand, brandMonogram } from "@/lib/brands";
import { SpecSection } from "./spec-section";
import { StandardEquipment } from "./standard-equipment";
import { OptionsSection } from "./options-section";
import { VehicleImage } from "./vehicle-image";
import { RecallsSection } from "./recalls-section";
import { SafetyRatings } from "./safety-ratings";

export function ResultShell({
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
  const [copied, setCopied] = useState(false);

  const headline = [result.modelYear, brand.name, result.model].filter(Boolean).join(" ");

  function copyVin() {
    navigator.clipboard.writeText(result.vin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full space-y-4"
    >
      {/* Brand header */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="grid place-items-center h-16 w-16 rounded-2xl font-display font-bold text-black text-xl shrink-0"
          style={{ background: "var(--brand-accent)" }}
        >
          {brandMonogram(brand)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
            <span>{brand.group}</span>
            {brand.note && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{ background: "var(--brand-accent-soft)", color: "var(--brand-accent)" }}
              >
                {brand.note}
              </span>
            )}
          </div>
          <h2 className="font-display text-3xl font-bold mt-1 truncate">{headline || brand.name}</h2>
          {result.trim && <p className="text-white/50 mt-0.5">{result.trim}</p>}
        </div>
        <button
          onClick={copyVin}
          className="glass glass-hover rounded-xl px-4 py-2.5 flex items-center gap-2 font-mono text-sm shrink-0"
          title="Copy VIN"
        >
          <span className="tracking-wider">{result.vin}</span>
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4 text-white/40" />
          )}
        </button>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100/80 space-y-1">
            {result.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Image + specs */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 lg:sticky lg:top-6 self-start">
          <VehicleImage image={image} loading={imageLoading} headline={headline} />
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 content-start">
          {result.sections.map((section, i) => (
            <SpecSection key={section.id} section={section} index={i} />
          ))}
        </div>
      </div>

      {/* Optional (non-standard) equipment tiles */}
      <OptionsSection options={result.options} delay={0.1} />

      {/* Equipment */}
      <StandardEquipment items={result.equipment} delay={0.15} />

      {/* Recalls + Safety ratings */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RecallsSection data={recalls} loading={recallsLoading} delay={0.15} />
        <SafetyRatings data={safety} loading={safetyLoading} delay={0.2} />
      </div>

      {/* Data provenance footer */}
      <p className="text-center text-xs text-white/30 pt-2">
        Specifications decoded from the free{" "}
        <a
          href="https://vpic.nhtsa.dot.gov/api/"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/60"
        >
          NHTSA vPIC
        </a>{" "}
, recalls &amp; ratings from NHTSA · Imagery from Wikimedia Commons · No API keys, no paywalls.
      </p>
    </motion.section>
  );
}
