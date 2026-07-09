"use client";

import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import type { EquipmentItem } from "@/lib/types";

// Optional (non-standard) equipment, broken out as highlighted tiles.
export function OptionsSection({ options, delay = 0 }: { options: EquipmentItem[]; delay?: number }) {
  if (options.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 accent-text" />
        <h3 className="text-sm font-semibold uppercase tracking-widest accent-text">
          Available Options
        </h3>
        <span className="text-xs text-white/40">· not standard</span>
      </div>
      <p className="text-xs text-white/45 mb-4">
        Features NHTSA lists as optionally available on this configuration — still trim-level, not
        a per-VIN build sheet.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((opt, i) => (
          <motion.div
            key={opt.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.03 * i }}
            className="glass-hover rounded-xl p-3.5 flex flex-col gap-2 border"
            style={{
              borderColor: "color-mix(in srgb, var(--brand-accent) 35%, transparent)",
              background: "var(--brand-accent-soft)",
            }}
          >
            <div
              className="grid place-items-center h-8 w-8 rounded-lg"
              style={{ background: "color-mix(in srgb, var(--brand-accent) 22%, transparent)" }}
            >
              <Plus className="h-4 w-4 accent-text" />
            </div>
            <span className="text-sm font-medium text-white/90 leading-snug">{opt.label}</span>
            <span className="text-[11px] uppercase tracking-wider accent-text">
              {opt.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
