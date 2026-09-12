import { NextResponse } from "next/server";

import type {
  AvailabilitySlot,
} from "@/lib/availability/types";

function sleep(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds),
  );
}

export async function GET(
  request: Request,
) {
  const url = new URL(request.url);

  const date =
    url.searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      {
        error: "date is required",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Artificial latency.
   *
   * This exists purely so the PoC can visibly demonstrate
   * what happens when availability depends on a slow
   * mobile network.
   */
  await sleep(5000);

  const slots: AvailabilitySlot[] = [
    {
      id: `${date}-0900`,
      start: `${date}T09:00:00.000Z`,
      end: `${date}T09:30:00.000Z`,
      available: true,
    },
    {
      id: `${date}-1000`,
      start: `${date}T10:00:00.000Z`,
      end: `${date}T10:30:00.000Z`,
      available: true,
    },
    {
      id: `${date}-1130`,
      start: `${date}T11:30:00.000Z`,
      end: `${date}T12:00:00.000Z`,
      available: true,
    },
    {
      id: `${date}-1400`,
      start: `${date}T14:00:00.000Z`,
      end: `${date}T14:30:00.000Z`,
      available: true,
    },
    {
      id: `${date}-1530`,
      start: `${date}T15:30:00.000Z`,
      end: `${date}T16:00:00.000Z`,
      available: true,
    },
  ];

  return NextResponse.json(slots);
}