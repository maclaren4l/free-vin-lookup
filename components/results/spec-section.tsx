"use client";

import { motion } from "framer-motion";
import type { SpecSection as SpecSectionType } from "@/lib/types";

export function SpecSection({ section, index }: { section: SpecSectionType; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className="glass glass-hover rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold uppercase tracking-widest accent-text mb-4">
        {section.title}
      </h3>
      <dl className="space-y-0">
        {section.rows.map((row, i) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 py-2 border-b border-white/5 last:border-0"
          >
            <dt className="text-sm text-white/45 shrink-0">{row.label}</dt>
            <dd className="text-sm font-medium text-right text-white/90">{row.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
