"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cacheAvailability,
  createAvailabilityCacheKey,
  getCachedAvailability,
} from "@/lib/availability/cache";

import {
  fetchAvailability,
} from "@/lib/availability/api";

import type {
  AvailabilitySlot,
} from "@/lib/availability/types";

interface UseAvailabilityOptions {
  eventTypeId: string;
  date: string;
  timezone: string;
}

interface AvailabilityState {
  slots: AvailabilitySlot[];
  isLoading: boolean;
  isRefreshing: boolean;
  isCached: boolean;
  cachedAt: number | null;
  error: Error | null;
}

export function useAvailability({
  eventTypeId,
  date,
  timezone,
}: UseAvailabilityOptions): AvailabilityState {
  const cacheKey = useMemo(
    () =>
      createAvailabilityCacheKey({
        eventTypeId,
        date,
        timezone,
      }),
    [eventTypeId, date, timezone],
  );

  const [state, setState] =
    useState<AvailabilityState>({
      slots: [],
      isLoading: true,
      isRefreshing: false,
      isCached: false,
      cachedAt: null,
      error: null,
    });

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      /*
       * -----------------------------------------
       * STEP 1
       * Read locally first.
       * -----------------------------------------
       */

      try {
        const cached =
          await getCachedAvailability(cacheKey);

        if (
          controller.signal.aborted
        ) {
          return;
        }

        if (cached) {
          setState({
            slots: cached.slots,
            isLoading: false,
            isRefreshing: true,
            isCached: true,
            cachedAt: cached.cachedAt,
            error: null,
          });
        } else {
          setState({
            slots: [],
            isLoading: true,
            isRefreshing: false,
            isCached: false,
            cachedAt: null,
            error: null,
          });
        }
      } catch (error) {
        console.warn(
          "[availability] cache read failed",
          error,
        );

        /*
         * IndexedDB failing should never prevent
         * the network path from working.
         */
      }

      /*
       * -----------------------------------------
       * STEP 2
       * Revalidate from the server.
       * -----------------------------------------
       */

      try {
        const fresh =
          await fetchAvailability({
            eventTypeId,
            date,
            timezone,
            signal: controller.signal,
          });

        if (
          controller.signal.aborted
        ) {
          return;
        }

        /*
         * -----------------------------------------
         * STEP 3
         * Update local cache.
         * -----------------------------------------
         */

        try {
          await cacheAvailability(
            cacheKey,
            fresh,
          );
        } catch (error) {
          console.warn(
            "[availability] cache write failed",
            error,
          );
        }

        /*
         * -----------------------------------------
         * STEP 4
         * Replace cached UI with fresh data.
         * -----------------------------------------
         */

        if (
          !controller.signal.aborted
        ) {
          setState({
            slots: fresh,
            isLoading: false,
            isRefreshing: false,
            isCached: false,
            cachedAt: Date.now(),
            error: null,
          });
        }
      } catch (error) {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        /*
         * If cached data exists, keep showing it.
         *
         * The network failure should not turn a useful
         * cached calendar into a blank/error state.
         */

        setState((current) => ({
          ...current,
          isLoading:
            current.slots.length === 0,
          isRefreshing: false,
          error:
            error instanceof Error
              ? error
              : new Error(
                  "Unable to refresh availability",
                ),
        }));
      }
    }

    void loadAvailability();

    return () => {
      controller.abort();
    };
  }, [
    cacheKey,
    eventTypeId,
    date,
    timezone,
  ]);

  return state;
}