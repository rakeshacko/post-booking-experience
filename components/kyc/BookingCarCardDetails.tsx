"use client";

import Image from "next/image";

import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import { VehicleIdentificationRows } from "@/components/kyc/VehicleIdentificationRows";
import {
  BOOKING_CAR_COLOR,
  BOOKING_CAR_TITLE,
  BOOKING_CAR_VARIANT,
} from "@/components/kyc/booking-car-card-content";
import {
  getBookingDeliveryIconSrc,
  getBookingDeliveryLine,
  getBookingDeliveryTextClass,
} from "@/lib/experience-flow-content";
import { cn } from "@/lib/utils";

export type BookingCarCardDetailsProps = {
  /** When set with `chassisNo`, shows engine/chassis below the delivery line. */
  engineNo?: string;
  chassisNo?: string;
  showCopyButtons?: boolean;
};

/**
 * Car title, variant/color, delivery line (express vs standard), and optional VIN rows —
 * shared by manage-booking sheet and celebration success cards.
 */
export function BookingCarCardDetails({
  engineNo,
  chassisNo,
  showCopyButtons = false,
}: BookingCarCardDetailsProps) {
  const showVehicleIdentification =
    engineNo != null &&
    engineNo.length > 0 &&
    chassisNo != null &&
    chassisNo.length > 0;

  return (
    <>
      <p className="text-base font-medium leading-6 text-[#121212]">{BOOKING_CAR_TITLE}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs leading-[18px] text-[#121212]">
        <span className="shrink-0">{BOOKING_CAR_VARIANT}</span>
        <span
          className="inline-flex h-[18px] w-4 shrink-0 items-center justify-center"
          aria-hidden
        >
          <Image
            src={BOOKING_CONFIRMED_ASSETS.dotSeparator}
            alt=""
            width={16}
            height={16}
            className="block size-4 object-contain"
            unoptimized
            sizes="16px"
          />
        </span>
        <span className="shrink-0">{BOOKING_CAR_COLOR}</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <p
          className={cn(
            "text-xs font-normal leading-[18px]",
            getBookingDeliveryTextClass(),
          )}
        >
          {getBookingDeliveryLine()}
        </p>
        <span className="relative h-4 w-4 shrink-0" aria-hidden>
          <Image
            src={getBookingDeliveryIconSrc()}
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 object-contain"
            unoptimized
            sizes="16px"
          />
        </span>
      </div>
      {showVehicleIdentification ? (
        <VehicleIdentificationRows
          engineNo={engineNo}
          chassisNo={chassisNo}
          showCopyButtons={showCopyButtons}
        />
      ) : null}
    </>
  );
}
