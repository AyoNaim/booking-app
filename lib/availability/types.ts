export interface AvailabilitySlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
}

export interface CachedAvailability {
  key: string;
  slots: AvailabilitySlot[];
  cachedAt: number;
}