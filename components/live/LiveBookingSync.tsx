"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BANK_SHEET_OPTIONS } from "@/components/payment/payment-choose-assets";
import { normalizeAppPathname } from "@/lib/journey-routes";
import {
  bankIdFor,
  LIVE_OMS_URL,
  readLiveBookingId,
  routeForStage,
  setLiveBooking,
  type LiveBooking,
} from "@/lib/live-booking";

const POLL_MS = 1500;
const BANK_IDS = BANK_SHEET_OPTIONS.map((b) => b.id);

/**
 * Follows the live booking: polls the OMS and, whenever the stage moves, takes
 * the customer to the screen for that stage. Between stage changes the
 * customer can click around freely; nothing pulls them back. Renders nothing —
 * on stage this is the customer's phone.
 */
export function LiveBookingSync() {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const [bookingId, setBookingId] = useState<string | null>(null);
  const lastStage = useRef<string | null>(null);

  useEffect(() => {
    setBookingId(readLiveBookingId());
  }, []);

  useEffect(() => {
    if (!bookingId) {
      setLiveBooking(null);
      return;
    }
    let stopped = false;
    let offline = false;
    const tick = async () => {
      try {
        const res = await fetch(`${LIVE_OMS_URL}/oms/v1/customer/bookings/${encodeURIComponent(bookingId)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const next = (await res.json()) as LiveBooking & { dealer?: unknown };
        // The customer never sees who the dealer is, so the OMS dealer field goes no further.
        delete next.dealer;
        if (stopped) return;
        offline = false;
        setLiveBooking(next);
        if (next.stage !== lastStage.current) {
          lastStage.current = next.stage;
          const target = routeForStage(next.stage, bankIdFor(next.loan?.bank ?? "", BANK_IDS));
          const targetPath = target ? normalizeAppPathname(target.split("?")[0]) : null;
          if (target && targetPath !== normalizeAppPathname(pathRef.current)) {
            router.push(target);
          }
        }
      } catch (error) {
        if (stopped || offline) return;
        offline = true;
        console.warn(`[live] OMS unreachable for ${bookingId} at ${LIVE_OMS_URL}; retrying`, error);
      }
    };
    tick();
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [bookingId, router]);

  return null;
}
