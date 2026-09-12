import {
  getRecord,
  putRecord,
} from "./db";

import type {
  AvailabilitySlot,
  CachedAvailability,
} from "./types";

export function createAvailabilityCacheKey({
  eventTypeId,
  date,
  timezone,
}: {
  eventTypeId: string;
  date: string;
  timezone: string;
}): string {
  return [
    "availability",
    eventTypeId,
    date,
    timezone,
  ].join(":");
}

export async function getCachedAvailability(
  key: string,
): Promise<CachedAvailability | null> {
  return getRecord<CachedAvailability>(key);
}

export async function cacheAvailability(
  key: string,
  slots: AvailabilitySlot[],
): Promise<void> {
  await putRecord<CachedAvailability>({
    key,
    slots,
    cachedAt: Date.now(),
  });
}