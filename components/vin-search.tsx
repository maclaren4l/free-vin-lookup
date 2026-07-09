"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, History, X } from "lucide-react";
import { normalizeVin, validateVin } from "@/lib/vin";
import { SAMPLE_VINS } from "@/lib/samples";
import { cn } from "@/lib/utils";

interface VinSearchProps {
  onSearch: (vin: string) => void;
  loading: boolean;
  recent: string[];
  onClearRecent: () => void;
}

export function VinSearch({ onSearch, loading, recent, onClearRecent }: VinSearchProps) {
  const [value, setValue] = useState("");
  const normalized = normalizeVin(value);
  const validation = useMemo(() => validateVin(value), [value]);
  const showHint = normalized.length > 0;

  function submit() {
    if (loading) return;
    const v = validateVin(value);
    if (!v.ok) return;
    onSearch(v.normalized);
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "glass glass-hover rounded-2xl p-2 flex items-center gap-2 transition-shadow",
        )}
      >
        <div className="pl-3 text-white/40">
          <Search className="h-5 w-5" />
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Enter a 17-character VIN"
          spellCheck={false}
          autoCapitalize="characters"
          maxLength={20}
          className="flex-1 bg-transparent outline-none font-mono text-lg tracking-[0.18em] placeholder:tracking-normal placeholder:text-white/30 py-3"
          aria-label="Vehicle Identification Number"
        />
        <span
          className={cn(
            "hidden sm:block font-mono text-xs tabular-nums pr-1",
            normalized.length === 17 ? "text-emerald-400" : "text-white/30",
          )}
        >
          {normalized.length}/17
        </span>
        <button
          onClick={submit}
          disabled={loading || !validation.ok}
          className={cn(
            "accent-ring shrink-0 rounded-xl px-5 py-3 font-medium text-black transition-all",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            !loading && validation.ok && "hover:brightness-110",
          )}
          style={{ background: "var(--brand-accent)" }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Decoding
            </span>
          ) : (
            "Decode"
          )}
        </button>
      </div>

      {/* Inline validation hint */}
      <div className="h-6 mt-2 px-2 text-sm">
        {showHint && validation.error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-300/90"
          >
            {validation.error}
          </motion.span>
        )}
        {showHint && !validation.error && validation.warning && (
          <span className="text-amber-300/80">Looks valid — heads up: {validation.warning}</span>
        )}
        {showHint && validation.ok && !validation.warning && (
          <span className="text-emerald-300/80">Valid VIN — press Decode.</span>
        )}
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-white/40">
            <History className="h-3.5 w-3.5" /> Recent
          </span>
          {recent.map((v) => (
            <button
              key={v}
              onClick={() => onSearch(v)}
              className="glass rounded-full px-3 py-1 font-mono text-xs text-white/70 hover:text-white transition"
            >
              {v}
            </button>
          ))}
          <button
            onClick={onClearRecent}
            className="text-white/30 hover:text-white/70 transition"
            aria-label="Clear recent searches"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Sample VIN chips */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-widest text-white/35 mb-2">Try a sample</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_VINS.map((s) => (
            <button
              key={s.vin}
              onClick={() => {
                setValue(s.vin);
                onSearch(s.vin);
              }}
              className="glass glass-hover rounded-full px-3.5 py-1.5 text-sm text-white/75 hover:text-white transition"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
