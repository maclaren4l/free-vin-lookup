"use client";

import { motion } from "framer-motion";
import { Info, Check, Circle, Minus } from "lucide-react";
import type { EquipmentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

function statusStyle(status: string): { className: string; icon: React.ReactNode } {
  const s = status.toLowerCase();
  if (/(not available|no\b|^n\/a)/.test(s)) {
    return { className: "text-white/40", icon: <Minus className="h-3.5 w-3.5" /> };
  }
  if (/optional/.test(s)) {
    return { className: "text-amber-300", icon: <Circle className="h-3 w-3" /> };
  }
  // Standard, Yes, or descriptive (e.g. airbag locations) → treat as equipped
  return { className: "text-emerald-300", icon: <Check className="h-3.5 w-3.5" /> };
}

export function StandardEquipment({ items, delay = 0 }: { items: EquipmentItem[]; delay?: number }) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest accent-text">
          Standard &amp; Safety Equipment
        </h3>
      </div>

      {/* Honesty banner — this is trim-level standard equipment, NOT a build sheet */}
      <div className="flex gap-2.5 rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4 text-xs text-white/55 leading-relaxed">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-white/40" />
        <p>
          Standard/optional equipment for this decoded configuration, from the manufacturer&apos;s
          NHTSA filing — <span className="text-white/80">not a per-VIN factory build sheet.</span>{" "}
          True as-built option codes aren&apos;t available from free/open data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        {items.map((item) => {
          const { className, icon } = statusStyle(item.status);
          return (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 py-2 border-b border-white/5"
            >
              <span className="text-sm text-white/70">{item.label}</span>
              <span className={cn("flex items-center gap-1.5 text-xs font-medium text-right", className)}>
                {icon}
                <span className="truncate max-w-[10rem]" title={item.status}>
                  {item.status}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
