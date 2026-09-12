import type { AvailabilitySlot } from "./types";

interface FetchAvailabilityOptions {
  eventTypeId: string;
  date: string;
  timezone: string;
  signal?: AbortSignal;
}

export async function fetchAvailability({
  eventTypeId,
  date,
  timezone,
  signal,
}: FetchAvailabilityOptions): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({
    eventTypeId,
    date,
    timezone,
  });

  const response = await fetch(
    `/api/availability?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Availability request failed (${response.status})`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid availability response",
    );
  }

  return data as AvailabilitySlot[];
}