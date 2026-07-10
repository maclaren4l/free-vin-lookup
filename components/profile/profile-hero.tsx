"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Car } from "lucide-react";
import type { VehicleImage } from "@/lib/types";

export function ProfileHero({
  headline,
  trim,
  vin,
  brandGroup,
  image,
  imageLoading,
}: {
  headline: string;
  trim: string;
  vin: string;
  brandGroup: string;
  image: VehicleImage | null;
  imageLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copyVin() {
    navigator.clipboard.writeText(vin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="profile-card rounded-[28px] overflow-hidden"
    >
      <div className="relative aspect-[3/4] w-full bg-black/5">
        {imageLoading ? (
          <div className="absolute inset-0 bg-black/5 shimmer" />
        ) : image?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.imageUrl}
            alt={`Representative photo of ${headline}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center" style={{ color: "var(--profile-ink-faint)" }}>
            <Car className="h-16 w-16" strokeWidth={1.2} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        <button
          onClick={copyVin}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur px-3 py-1.5 text-xs font-mono text-white/90"
          title="Copy full VIN"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
          &hellip;{vin.slice(-6)}
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs uppercase tracking-widest text-white/60">{brandGroup}</p>
          <h2 className="font-display text-2xl font-bold text-white leading-tight mt-0.5">{headline}</h2>
          {trim && <p className="text-sm text-white/70 mt-0.5">{trim}</p>}
        </div>
      </div>
    </motion.div>
  );
}
