"use client";

import { motion } from "framer-motion";
import { AlertOctagon, ShieldCheck, ChevronDown } from "lucide-react";
import type { RecallsData } from "@/lib/types";

export function RecallsSection({
  data,
  loading,
  delay = 0,
}: {
  data: RecallsData | null;
  loading: boolean;
  delay?: number;
}) {
  const count = data?.recalls.length ?? 0;
  const hasRecalls = count > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          {hasRecalls ? (
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          )}
          <h3 className="text-sm font-semibold uppercase tracking-widest accent-text">
            Safety Recalls
          </h3>
        </div>
        {!loading && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              hasRecalls
                ? "bg-rose-400/15 text-rose-300"
                : "bg-emerald-400/15 text-emerald-300"
            }`}
          >
            {count} {count === 1 ? "recall" : "recalls"}
          </span>
        )}
      </div>
      <p className="text-xs text-white/45 mb-4">
        Manufacturer safety recalls reported to NHTSA for this make/model/year.
      </p>

      {loading ? (
        <div className="space-y-2">
          <div className="h-14 rounded-xl bg-white/[0.04] shimmer" />
          <div className="h-14 rounded-xl bg-white/[0.04] shimmer" />
        </div>
      ) : data?.unavailable ? (
        <p className="text-sm text-white/40">
          Recall lookup needs a resolved make, model, and year.
        </p>
      ) : !hasRecalls ? (
        <p className="text-sm text-emerald-300/80">
          No recalls on record for this make/model/year. 🎉
        </p>
      ) : (
        <div className="space-y-2">
          {data!.recalls.map((r, i) => (
            <details key={r.campaign || i} className="group rounded-xl bg-white/[0.03] border border-white/8">
              <summary className="cursor-pointer list-none p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/90">
                    {r.component || "Recall"}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {[r.campaign, r.reportDate].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-white/40 shrink-0 mt-1 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-3.5 pb-3.5 space-y-2 text-sm text-white/60">
                {r.summary && <Field label="Summary" value={r.summary} />}
                {r.consequence && <Field label="Consequence" value={r.consequence} />}
                {r.remedy && <Field label="Remedy" value={r.remedy} />}
              </div>
            </details>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="leading-relaxed">
      <span className="text-white/40 uppercase text-[10px] tracking-wider mr-1.5">{label}</span>
      {value}
    </p>
  );
}
