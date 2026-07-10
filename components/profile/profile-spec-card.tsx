"use client";

import { motion } from "framer-motion";
import type { SpecSection } from "@/lib/types";

export function ProfileSpecCard({ section, index }: { section: SpecSection; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className="profile-card rounded-[20px] p-5"
    >
      <h3
        className="text-sm font-semibold uppercase tracking-widest mb-3"
        style={{ color: "var(--brand-accent)" }}
      >
        {section.title}
      </h3>
      <dl className="space-y-0">
        {section.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 py-2 border-b last:border-0"
            style={{ borderColor: "var(--profile-card-border)" }}
          >
            <dt className="text-sm" style={{ color: "var(--profile-ink-faint)" }}>
              {row.label}
            </dt>
            <dd className="text-sm font-medium text-right" style={{ color: "var(--profile-ink)" }}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
