"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import type { SafetyData, SafetyRating } from "@/lib/types";
import { cn } from "@/lib/utils";

function Stars({ value }: { value: string }) {
  const n = Number(value);
  if (!value || Number.isNaN(n)) {
    return <span className="text-xs text-white/35">Not rated</span>;
  }
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < n ? "text-amber-400" : "text-white/15")}
          fill={i < n ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function RatingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/55">{label}</span>
      <Stars value={value} />
    </div>
  );
}

function VariantCard({ rating }: { rating: SafetyRating }) {
  return (
    <div className="glass-hover rounded-xl p-4 border border-white/8">
      <p className="text-sm font-medium text-white/90 mb-3">{rating.description}</p>
      <RatingRow label="Overall" value={rating.overall} />
      <RatingRow label="Frontal Crash" value={rating.frontCrash} />
      <RatingRow label="Side Crash" value={rating.sideCrash} />
      <RatingRow label="Rollover" value={rating.rollover} />
    </div>
  );
}

export function SafetyRatings({
  data,
  loading,
  delay = 0,
}: {
  data: SafetyData | null;
  loading: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-4 w-4 accent-text" />
        <h3 className="text-sm font-semibold uppercase tracking-widest accent-text">
          NHTSA Safety Ratings
        </h3>
      </div>
      <p className="text-xs text-white/45 mb-4">
        Official NCAP 5-star crash-test results for this make/model/year.
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="h-40 rounded-xl bg-white/[0.04] shimmer" />
          <div className="h-40 rounded-xl bg-white/[0.04] shimmer" />
        </div>
      ) : !data || data.ratings.length === 0 ? (
        <p className="text-sm text-white/40">
          No NCAP crash-test ratings published for this make/model/year.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {data.ratings.map((r) => (
            <VariantCard key={r.vehicleId} rating={r} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
