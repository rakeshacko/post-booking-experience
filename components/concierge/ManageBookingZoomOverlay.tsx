"use client";

import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { PlanList } from "@/components/concierge/artifacts";
import { DEMO_BOOKING_ID } from "@/components/kyc/booking-car-card-content";
import { ManageBookingSections } from "@/components/kyc/ManageBookingBottomSheet";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import { readExperienceFlow, type ExperienceFlow } from "@/lib/experience-flow";
import {
  getDeliveryDateFull,
  getJourneyReceipts,
  getJourneyStageSteps,
} from "@/lib/journey-stage";
import { cn } from "@/lib/utils";

/** Matches the page-recede transition in ConciergeTurnShell. */
export const ZOOM_OVERLAY_MS = 650;
/** Tailwind v4 `scale-*`/`blur-*` set `scale`/`filter` — they must be named here. */
const ZOOM_TRANSITION = "transition-[scale,filter,opacity] duration-[650ms] ease-in-out";

export type ManageBookingZoomOverlayProps = {
  /** Layer is in the DOM (mount before animating so layout/decode never eats animation frames). */
  mounted: boolean;
  /** Animated-in state — drives the zoom; toggled a frame after mount by the shell. */
  shown: boolean;
  onClose: () => void;
  showVehicleIdentification?: boolean;
  /** Who the delivery date currently waits on — from the shell's turn. */
  dateHolder?: "you" | "shivi";
};

function ReceiptGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21V3z" />
      <path d="M9.5 8h5M9.5 11.5h5" />
    </svg>
  );
}

/**
 * Dot-style layer presentation for the manage-booking content: the page
 * recedes into depth (handled by the shell) while this layer settles in,
 * scaling down from slightly above as it lands. Controlled by the shell's
 * state machine so both layers move on the exact same clock.
 */
export function ManageBookingZoomOverlay({
  mounted,
  shown,
  onClose,
  showVehicleIdentification = false,
  dateHolder = "shivi",
}: ManageBookingZoomOverlayProps) {
  const pathname = usePathname();
  const [flow, setFlow] = useState<ExperienceFlow | undefined>(undefined);

  useEffect(() => {
    if (!mounted) return;
    setFlow(readExperienceFlow());
  }, [mounted]);

  const steps = useMemo(() => getJourneyStageSteps(pathname, flow), [pathname, flow]);
  const receipts = useMemo(() => getJourneyReceipts(pathname), [pathname]);
  const nowStep = steps.find((step) => step.status === "now");
  const deliveryDate = getDeliveryDateFull(flow);
  /** Scroll lock — compensate for the scrollbar so the page never reflows. */
  useEffect(() => {
    if (!mounted) return;
    const { overflow, paddingRight } = document.body.style;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [mounted]);

  useEffect(() => {
    if (!shown) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shown, onClose]);

  const onScrimClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose]
  );

  if (!mounted) return null;

  return (
    <BottomSheetPortal>
      <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Your car">
        {/* Light veil over the aurora surface — the page itself fades out fully. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-[#f1f0f5]/45 transition-opacity duration-[500ms]",
            shown ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className="absolute inset-0 overflow-y-auto overscroll-contain"
          onClick={onScrimClick}
        >
          <div
            className={cn(
              "relative mx-auto w-full max-w-[640px] px-5 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[72px]",
              `${ZOOM_TRANSITION} will-change-[scale,filter,opacity]`,
              "motion-reduce:transition-none",
              shown ? "scale-100 opacity-100 blur-none" : "scale-[1.12] opacity-0 blur-[6px]"
            )}
          >
            <div className="mb-5">
              <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#121212]">
                Your car
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#4b4b4b]">
                Reference ID: {DEMO_BOOKING_ID}
              </p>
            </div>

            {/* The living delivery date — the one number this purchase is about. */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white card-elevated px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#8f8e92]">
                  Arriving
                </p>
                <p className="text-xl font-semibold leading-7 tracking-[-0.2px] text-[#121212]">
                  {deliveryDate}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium leading-4",
                  dateHolder === "you"
                    ? "bg-[#fff7e5] text-[#a76406]"
                    : "bg-[#e7f6ee] text-[#0c7a42]"
                )}
              >
                {dateHolder === "you"
                  ? `Waiting on you — ${nowStep?.title.toLowerCase() ?? "this step"}`
                  : "On track ✓"}
              </span>
            </div>

            <section aria-labelledby="purchase-state-timeline-heading" className="mt-8">
              <h3
                id="purchase-state-timeline-heading"
                className="mb-4 text-base font-medium leading-6 text-[#121212]"
              >
                Where we are
              </h3>
              <PlanList items={steps} />
            </section>

            <div className="mt-8">
              <Suspense fallback={null}>
                <ManageBookingSections
                  onClose={onClose}
                  showVehicleIdentification={showVehicleIdentification}
                  surface="overlay"
                  beforeChange={
                    <section aria-labelledby="purchase-state-receipts-heading">
                      <h3
                        id="purchase-state-receipts-heading"
                        className="mb-4 text-base font-medium leading-6 text-[#121212]"
                      >
                        Receipts &amp; documents
                      </h3>
                      <div className="overflow-hidden rounded-2xl bg-white card-elevated">
                        {receipts.map((receipt, idx) => (
                          <div
                            key={receipt.title}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3",
                              idx > 0 && "border-t border-dashed border-[#ececec]"
                            )}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#75747a]">
                              <ReceiptGlyph />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-5 text-[#121212]">
                                {receipt.title}
                              </p>
                              <p className="mt-0.5 text-xs leading-[18px] text-[#757575]">
                                {receipt.meta}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#e7f6ee] px-2 py-0.5 text-[11px] font-medium leading-4 text-[#0c7a42]">
                              Saved ✓
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  }
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
