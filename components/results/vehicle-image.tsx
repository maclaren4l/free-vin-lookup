"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Car, ExternalLink } from "lucide-react";
import type { VehicleImage as VehicleImageType } from "@/lib/types";

function Placeholder({ label }: { label: string }) {
  return (
    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-white/[0.03] border border-white/10 grid place-items-center">
      <div className="flex flex-col items-center gap-2 text-white/25">
        <Car className="h-14 w-14" strokeWidth={1.2} />
        <span className="text-xs">{label}</span>
      </div>
    </div>
  );
}

export function VehicleImage({
  image,
  loading,
  headline,
}: {
  image: VehicleImageType | null;
  loading: boolean;
  headline: string;
}) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="glass rounded-2xl p-4">
      {loading ? (
        <div className="aspect-[16/10] w-full rounded-xl bg-white/[0.04] shimmer" />
      ) : image && image.imageUrl && !broken ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.imageUrl}
            alt={`Representative photo of ${headline}`}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        </motion.div>
      ) : (
        <Placeholder label="No representative photo found" />
      )}

      {/* Caption — honesty + attribution */}
      <div className="mt-3 space-y-1">
        <p className="text-xs text-white/45 leading-relaxed">
          Representative image — closest match for this make/model/year,{" "}
          <span className="text-white/70">not the actual vehicle.</span>
        </p>
        {image && !image.placeholder && image.imageUrl && !broken && (
          <p className="text-[11px] text-white/35 flex flex-wrap items-center gap-x-2">
            {image.credit && <span>© {image.credit}</span>}
            {image.license && <span>· {image.license}</span>}
            {image.sourceUrl && (
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 hover:text-white/70 transition"
              >
                Wikimedia Commons <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
