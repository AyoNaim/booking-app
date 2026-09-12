"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAvailability } from "@/hooks/use-availability";

const DATES = [
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
] as const;

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AvailabilityCalendar() {
  const [date, setDate] = useState<string>(DATES[0]);
  const [mountedAt] = useState(() => performance.now());

  const firstPaintMeasuredRef = useRef(false);
  const [firstPaintMs, setFirstPaintMs] = useState<number | null>(
    null,
  );

  const timezone = useMemo(
    () =>
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const {
    slots,
    isLoading,
    isRefreshing,
    isCached,
    error,
    cachedAt,
  } = useAvailability({
    eventTypeId: "demo-interview",
    date,
    timezone,
  });

  /*
   * Measure the time from the current date selection
   * until useful availability is actually visible.
   */
  useEffect(() => {
    if (
      slots.length === 0 ||
      firstPaintMeasuredRef.current
    ) {
      return;
    }

    firstPaintMeasuredRef.current = true;

    setFirstPaintMs(
      Math.max(
        0,
        Math.round(performance.now() - mountedAt),
      ),
    );
  }, [slots.length, mountedAt]);

  /*
   * When the selected date changes, measure that interaction
   * from scratch.
   */
  useEffect(() => {
    firstPaintMeasuredRef.current = false;
    setFirstPaintMs(null);
  }, [date]);

  const availableSlots = slots.filter(
    (slot) => slot.available,
  );

  return (
    <main className="min-h-screen bg-[#0d0d0c] text-[#e9e7e1]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6 md:px-10">
        {/* Top rail */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
            Availability / 01
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                isRefreshing
                  ? "bg-[#e9e7e1]"
                  : isCached
                    ? "bg-[#e9e7e1]/70"
                    : "bg-white/25"
              }`}
            />

            <span>
              {isRefreshing
                ? "revalidating"
                : isCached
                  ? "local"
                  : "live"}
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col justify-center py-20 md:py-28">
          <div className="mb-12">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
              Select a time
            </p>

            <h1 className="max-w-3xl text-4xl font-medium tracking-[-0.04em] md:text-6xl">
              {formatDate(date)}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/40 md:text-base">
              Availability is rendered from the local snapshot
              first, then quietly revalidated against the server.
            </p>
          </div>

          {/* Date rail */}
          <div className="mb-12 overflow-x-auto border-y border-white/10">
            <div className="flex min-w-max">
              {DATES.map((item) => {
                const active = item === date;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDate(item)}
                    className={`relative px-5 py-4 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                      active
                        ? "text-white"
                        : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    {item.slice(5)}

                    {active && (
                      <span className="absolute inset-x-5 bottom-0 h-px bg-white/80" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse bg-[#0d0d0c]"
                  />
                ))}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className="group flex h-20 items-center justify-between bg-[#0d0d0c] px-5 text-left transition-colors hover:bg-white/[0.035]"
                  >
                    <span className="font-mono text-sm text-white/80">
                      {formatTime(slot.start)}
                    </span>

                    <span className="translate-x-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/20 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-white/50 group-hover:opacity-100">
                      Book →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="border border-white/10 px-5 py-8">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/35">
                  No availability
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">
                  Source
                </span>

                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  {isRefreshing
                    ? "local snapshot → server"
                    : isCached
                      ? "indexeddb"
                      : "server"}
                </span>
              </div>

              {error && slots.length > 0 && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Network unavailable · cached data retained
                </p>
              )}

              {cachedAt && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">
                  Snapshot available locally
                </p>
              )}
            </div>

            {/* Performance instrument */}
            <div className="flex items-end gap-6">
              <div>
                {/* <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/20">
                  Previous
                </div> */}
{/* 
                <div className="font-mono text-2xl tracking-[-0.03em] text-white/25 line-through decoration-white/20">
                  927ms
                </div> */}
              </div>

              <div className="pb-1 font-mono text-white/15">
                →
              </div>

              <div>
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                  Local
                </div>

                <div className="font-mono text-3xl tracking-[-0.04em] text-white">
                  {firstPaintMs !== null
                    ? `${firstPaintMs}ms`
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Method */}
          <div className="mt-5 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/20">
              Network-first
            </span>

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/20">
              Local-first
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/20">
            Client-side cache experiment
          </span>

          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/20">
            IndexedDB
          </span>
        </footer>
      </div>
    </main>
  );
}

