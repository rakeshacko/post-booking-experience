"use client";

import Image, { type StaticImageData } from "next/image";

import {
  BookingCarCardDetails,
  type BookingCarCardDetailsProps,
} from "@/components/kyc/BookingCarCardDetails";
import {
  DEMO_VEHICLE_CHASSIS_NO,
  DEMO_VEHICLE_ENGINE_NO,
} from "@/components/kyc/demo-vehicle-identification";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";

type CarCutoutSrc = string | StaticImageData;

function BookingCarSummaryCardVisualStage({
  emphasizeBottomMerge = false,
  carCutoutSrc = BOOKING_CONFIRMED_ASSETS.carCutout,
}: {
  emphasizeBottomMerge?: boolean;
  carCutoutSrc?: CarCutoutSrc;
}) {
  return (
    <>
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={BOOKING_CONFIRMED_ASSETS.cardBackdrop}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "center 28%" }}
            sizes="(max-width: 640px) 100vw, 320px"
            unoptimized
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: emphasizeBottomMerge
              ? "linear-gradient(180deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.75) 62%, #ffffff 88%), linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 25%)"
              : "linear-gradient(180deg, rgba(255,255,255,0) 68%, rgba(255,255,255,0.7) 100%), linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 25%)",
          }}
        />
        {emphasizeBottomMerge ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[152px]"
            style={{
              background:
                "linear-gradient(to top, #ffffff 0%, #ffffff 42%, rgba(255,255,255,0.92) 58%, rgba(255,255,255,0) 100%)",
            }}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="absolute left-1/2 top-[30px] z-[2] h-[85px] w-[150px] -translate-x-1/2 overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-[150px]">
          <Image
            src={carCutoutSrc}
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="150px"
            unoptimized
          />
        </div>
      </div>
    </>
  );
}

type BookingCarSummaryCardProps = {
  /** When true, shows engine/chassis rows (post–car-allocation manage booking). */
  showVehicleIdentification?: boolean;
  /** `hero` — backdrop + cutout; `detailsOnly` — copy panel only (modify-selection). */
  variant?: "hero" | "detailsOnly";
  /** Overrides for the details panel (e.g. selected colour on modify confirm). */
  cardDetails?: Pick<
    BookingCarCardDetailsProps,
    | "carColor"
    | "carTitle"
    | "carVariant"
    | "deliveryLine"
    | "deliveryTextClass"
    | "deliveryIconSrc"
  >;
  /** Paint-specific cutout on hero card (modify-selection confirm). */
  carCutoutSrc?: CarCutoutSrc;
};

/**
 * Booked-car summary — hero card (manage booking) or details-only panel (modify-selection).
 */
export function BookingCarSummaryCard({
  showVehicleIdentification = false,
  variant = "hero",
  cardDetails,
  carCutoutSrc,
}: BookingCarSummaryCardProps) {
  const panelClassName =
    "overflow-hidden rounded-xl border border-white/60 bg-white/90 p-3 shadow-sm backdrop-blur-[12px]";

  const details = (
    <BookingCarCardDetails
      engineNo={showVehicleIdentification ? DEMO_VEHICLE_ENGINE_NO : undefined}
      chassisNo={showVehicleIdentification ? DEMO_VEHICLE_CHASSIS_NO : undefined}
      showCopyButtons={showVehicleIdentification}
      {...cardDetails}
    />
  );

  if (variant === "detailsOnly") {
    return (
      <section
        className="w-full rounded-xl bg-[#f5f5f5] p-4"
        aria-label="Your booked car"
      >
        {details}
      </section>
    );
  }

  if (showVehicleIdentification) {
    return (
      <div className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
        <div className="relative h-[228px] w-full bg-white">
          <BookingCarSummaryCardVisualStage
            emphasizeBottomMerge
            carCutoutSrc={carCutoutSrc}
          />
        </div>
        <div className={`relative z-10 mx-2 -mt-24 mb-2 ${panelClassName}`}>{details}</div>
      </div>
    );
  }

  return (
    <div className="relative h-[228px] w-full shrink-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
      <BookingCarSummaryCardVisualStage
        emphasizeBottomMerge={false}
        carCutoutSrc={carCutoutSrc}
      />
      <div className={`absolute inset-x-2 bottom-2 ${panelClassName}`}>{details}</div>
    </div>
  );
}
