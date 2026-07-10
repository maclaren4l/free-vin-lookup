"use client";

import { motion } from "framer-motion";
import type { QuickStat } from "@/lib/profile-stats";

export function StatPills({ stats, delay = 0 }: { stats: QuickStat[]; delay?: number }) {
  if (stats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: delay + i * 0.05 }}
          className="profile-pill rounded-2xl px-4 py-2.5 flex flex-col gap-0.5 min-w-[104px]"
        >
          <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--profile-ink-faint)" }}>
            {s.label}
          </span>
          <span className="text-base font-semibold leading-tight" style={{ color: "var(--profile-ink)" }}>
            {s.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
