"use client";

import { motion } from "framer-motion";
import { CalendarClock, ShieldCheck, ChevronDown } from "lucide-react";
import type { RecallsData } from "@/lib/types";

export function RecallTimeline({
  data,
  loading,
  delay = 0,
}: {
  data: RecallsData | null;
  loading: boolean;
  delay?: number;
}) {
  const count = data?.recalls.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="profile-card rounded-[20px] p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock className="h-4 w-4" style={{ color: "var(--brand-accent)" }} />
        <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--profile-ink)" }}>
          Recall Timeline
        </h3>
      </div>

      {loading ? (
        <div className="space-y-2 mt-3">
          <div className="h-10 rounded-xl shimmer bg-black/5" />
          <div className="h-10 rounded-xl shimmer bg-black/5" />
        </div>
      ) : data?.unavailable ? (
        <p className="text-sm mt-3" style={{ color: "var(--profile-ink-faint)" }}>
          Recall lookup needs a resolved make, model, and year.
        </p>
      ) : count === 0 ? (
        <p className="text-sm mt-3 flex items-center gap-2" style={{ color: "var(--profile-ink-soft)" }}>
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" /> No recalls on record for this
          make/model/year.
        </p>
      ) : (
        <ol className="mt-3 relative border-l pl-4 space-y-4" style={{ borderColor: "var(--profile-card-border)" }}>
          {data!.recalls.map((r, i) => (
            <li key={r.campaign || i} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
              <details className="group">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--profile-ink)" }}>
                      {r.component || "Recall"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--profile-ink-faint)" }}>
                      {r.reportDate}
                    </p>
                  </div>
                  <ChevronDown
                    className="h-4 w-4 mt-1 shrink-0 transition-transform group-open:rotate-180"
                    style={{ color: "var(--profile-ink-faint)" }}
                  />
                </summary>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--profile-ink-soft)" }}>
                  {r.summary}
                </p>
              </details>
            </li>
          ))}
        </ol>
      )}
    </motion.div>
  );
}
