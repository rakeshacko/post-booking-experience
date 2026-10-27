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
  writeLiveBookingId,
  type LiveBooking,
} from "@/lib/live-booking";

const POLL_MS = 1500;
const BANK_IDS = BANK_SHEET_OPTIONS.map((b) => b.id);

/**
 * Follows the live booking: polls the OMS and, whenever the stage moves, takes
 * the customer to the screen for that stage. Between stage changes the
 * customer can click around freely; nothing pulls them back.
 */
export function LiveBookingSync() {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [view, setView] = useState<LiveBooking | null>(null);
  const [offline, setOffline] = useState(false);
  const lastStage = useRef<string | null>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("live");
    if (param === "off") writeLiveBookingId(null);
    else if (param) writeLiveBookingId(param.toUpperCase());
    setBookingId(readLiveBookingId());
  }, []);

  useEffect(() => {
    if (!bookingId) {
      setLiveBooking(null);
      return;
    }
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(`${LIVE_OMS_URL}/oms/v1/customer/bookings/${encodeURIComponent(bookingId)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(String(res.status));
        const next = (await res.json()) as LiveBooking;
        if (stopped) return;
        setOffline(false);
        setView(next);
        setLiveBooking(next);
        if (next.stage !== lastStage.current) {
          lastStage.current = next.stage;
          const target = routeForStage(next.stage, bankIdFor(next.loan?.bank ?? "", BANK_IDS));
          const targetPath = target ? normalizeAppPathname(target.split("?")[0]) : null;
          if (target && targetPath !== normalizeAppPathname(pathRef.current)) {
            router.push(target);
          }
        }
      } catch {
        if (!stopped) setOffline(true);
      }
    };
    tick();
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [bookingId, router]);

  if (!bookingId) return null;

  // Presenter's cue only: sits outside the phone column, hidden on narrow screens.
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-4 top-4 z-[60] hidden items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#4b4b4b] shadow-sm ring-1 ring-black/5 backdrop-blur min-[1000px]:flex"
    >
      <span className={offline ? "size-2 rounded-full bg-[#c2c2c2]" : "size-2 animate-pulse rounded-full bg-[#0fa457]"} />
      {offline ? `OMS unreachable · ${bookingId}` : `Live from OMS · ${bookingId} · ${view?.stageLabel ?? "…"}`}
    </div>
  );
}
