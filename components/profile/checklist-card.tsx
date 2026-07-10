"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { EquipmentItem } from "@/lib/types";
import type { ReactNode } from "react";

export function ChecklistCard({
  title,
  icon,
  items,
  emptyText,
  delay = 0,
  hideStatus = false,
}: {
  title: string;
  icon: ReactNode;
  items: EquipmentItem[];
  emptyText: string;
  delay?: number;
  /** Skip the per-row status label when every item shares the same status (e.g. all "Optional"). */
  hideStatus?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="profile-dark-card rounded-[20px] p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "var(--profile-dark-card-text)" }}
          >
            {title}
          </h3>
        </div>
        {items.length > 0 && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: "var(--brand-accent)", color: "#000" }}
          >
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm mt-3" style={{ color: "var(--profile-dark-card-text-soft)" }}>
          {emptyText}
        </p>
      ) : (
        <ul className="mt-3 space-y-1 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0"
              style={{ borderColor: "rgba(244,239,228,0.08)" }}
            >
              <span
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--profile-dark-card-text)" }}
              >
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--brand-accent)" }} />
                {item.label}
              </span>
              {!hideStatus && (
                <span
                  className="text-[11px] shrink-0 truncate max-w-[7rem] text-right"
                  style={{ color: "var(--profile-dark-card-text-soft)" }}
                  title={item.status}
                >
                  {item.status}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
