"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { SafetyData } from "@/lib/types";

export function SafetyGauge({
  data,
  loading,
  delay = 0,
}: {
  data: SafetyData | null;
  loading: boolean;
  delay?: number;
}) {
  const rating = data?.ratings[0];
  const overall = rating ? Number(rating.overall) : null;
  const pct = overall ? Math.min(100, (overall / 5) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="profile-card rounded-[20px] p-5 flex items-center gap-5"
    >
      <div
        className="relative h-24 w-24 shrink-0 rounded-full grid place-items-center"
        style={{
          background: overall
            ? `conic-gradient(var(--brand-accent) ${pct}%, rgba(23,19,15,0.08) ${pct}%)`
            : "rgba(23,19,15,0.08)",
        }}
      >
        <div className="h-[72px] w-[72px] rounded-full profile-card grid place-items-center">
          {loading ? (
            <div className="h-6 w-10 rounded shimmer bg-black/5" />
          ) : overall ? (
            <span className="text-xl font-bold" style={{ color: "var(--profile-ink)" }}>
              {overall}
              <span className="text-xs font-normal" style={{ color: "var(--profile-ink-faint)" }}>
                /5
              </span>
            </span>
          ) : (
            <span className="text-xs" style={{ color: "var(--profile-ink-faint)" }}>
              N/A
            </span>
          )}
        </div>
      </div>
      <div className="min-w-0">
        <p
          className="text-xs uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: "var(--profile-ink-faint)" }}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> NHTSA Safety
        </p>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--profile-ink-soft)" }}>
          {loading
            ? "Checking crash-test ratings…"
            : overall
              ? `Overall ${overall}-star rating${rating?.description ? ` · ${rating.description}` : ""}`
              : "No NCAP crash-test rating published for this configuration."}
        </p>
      </div>
    </motion.div>
  );
}
