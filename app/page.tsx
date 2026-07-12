"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScanLine, AlertCircle } from "lucide-react";
import { VinSearch } from "@/components/vin-search";
import { ProfileShell } from "@/components/profile/profile-shell";
import { resolveBrand, GENERIC_BRAND } from "@/lib/brands";
import type { DecodeResult, RecallsData, SafetyData, VehicleImage } from "@/lib/types";

const RECENT_KEY = "vin-recent";

function applyAccent(hex: string) {
  const root = document.documentElement;
  root.style.setProperty("--brand-accent", hex);
  // 8-digit hex alpha ≈ 14%
  root.style.setProperty("--brand-accent-soft", `${hex}24`);
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<VehicleImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [recalls, setRecalls] = useState<RecallsData | null>(null);
  const [recallsLoading, setRecallsLoading] = useState(false);
  const [safety, setSafety] = useState<SafetyData | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const requestId = useRef(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      if (Array.isArray(saved)) setRecent(saved.slice(0, 6));
    } catch {
      /* ignore */
    }
  }, []);

  const pushRecent = useCallback((vin: string) => {
    setRecent((prev) => {
      const next = [vin, ...prev.filter((v) => v !== vin)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const search = useCallback(
    async (vin: string) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      setImage(null);
      setRecalls(null);
      setSafety(null);

      try {
        const res = await fetch(`/api/decode?vin=${encodeURIComponent(vin)}`);
        const data = await res.json();
        if (id !== requestId.current) return; // stale response

        if (!res.ok) {
          setError(data.error ?? "Unable to decode that VIN.");
          setResult(null);
          applyAccent(GENERIC_BRAND.accent);
          return;
        }

        const decoded = data as DecodeResult;
        setResult(decoded);
        pushRecent(decoded.vin);
        applyAccent(resolveBrand(decoded.make).accent);

        // Fetch image, recalls, and safety ratings in parallel — each is
        // non-blocking so the specs render immediately.
        const q = new URLSearchParams({
          make: decoded.make,
          model: decoded.model,
          year: decoded.modelYear,
        });

        setImageLoading(true);
        fetch(`/api/image?${q.toString()}&body=${encodeURIComponent(decoded.bodyClass)}`)
          .then((r) => r.json())
          .then((img) => {
            if (id === requestId.current) setImage(img as VehicleImage);
          })
          .catch(() => {})
          .finally(() => {
            if (id === requestId.current) setImageLoading(false);
          });

        setRecallsLoading(true);
        fetch(`/api/recalls?${q.toString()}`)
          .then((r) => r.json())
          .then((data) => {
            if (id === requestId.current) setRecalls(data as RecallsData);
          })
          .catch(() => {})
          .finally(() => {
            if (id === requestId.current) setRecallsLoading(false);
          });

        setSafetyLoading(true);
        fetch(`/api/safety?${q.toString()}`)
          .then((r) => r.json())
          .then((data) => {
            if (id === requestId.current) setSafety(data as SafetyData);
          })
          .catch(() => {})
          .finally(() => {
            if (id === requestId.current) setSafetyLoading(false);
          });
      } catch {
        if (id === requestId.current) {
          setError("Network error — could not reach the decoder.");
          setResult(null);
        }
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [pushRecent],
  );

  function clearRecent() {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      {/* Dark console: hero + search on one espresso card */}
      <div className="profile-dark-card rounded-[32px] px-5 py-8 sm:px-10 sm:py-12 max-w-4xl mx-auto">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-white/60 mb-5">
            <ScanLine className="h-3.5 w-3.5 accent-text" />
            Powered by free, open NHTSA &amp; Wikimedia data — no API keys
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight">
            Decode any{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, var(--brand-accent), #ffffff 90%)",
              }}
            >
              VIN
            </span>
          </h1>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Paste a Vehicle Identification Number to reveal full specifications, standard
            equipment, and a representative photo — instantly, in your browser.
          </p>
        </motion.header>

        {/* Search */}
        <div className="max-w-3xl mx-auto">
          <VinSearch
            onSearch={search}
            loading={loading}
            recent={recent}
            onClearRecent={clearRecent}
          />
        </div>
      </div>

      {/* Results / states */}
      <div className="mt-10">
        <AnimatePresence mode="wait">
          {loading && !result && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="profile-card rounded-2xl h-28 shimmer shimmer-light" />
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="profile-card rounded-2xl h-64 shimmer shimmer-light" />
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                  <div className="profile-card rounded-2xl h-52 shimmer shimmer-light" />
                  <div className="profile-card rounded-2xl h-52 shimmer shimmer-light" />
                </div>
              </div>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="profile-card rounded-2xl p-6 flex items-start gap-3 max-w-2xl mx-auto border border-rose-700/25"
              style={{ borderColor: "rgba(190, 18, 60, 0.25)" }}
            >
              <AlertCircle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-rose-900">Couldn&apos;t decode that VIN</p>
                <p className="text-sm mt-1" style={{ color: "var(--profile-ink-soft)" }}>
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {!loading && result && (
            <motion.div
              key={result.vin}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfileShell
                result={result}
                image={image}
                imageLoading={imageLoading}
                recalls={recalls}
                recallsLoading={recallsLoading}
                safety={safety}
                safetyLoading={safetyLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
