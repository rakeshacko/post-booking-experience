"use client";

import Image from "next/image";

import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import {
  BOOKING_EXPRESS_DELIVERY_TEXT_CLASS,
  BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
  getBookingDeliveryIconSrc,
  splitBookingDeliveryLine,
} from "@/lib/experience-flow-content";
import type { CancelBookingCarDetails } from "@/lib/cancel-booking-content";
import { getModifySelectionCarCutoutForColour } from "@/lib/modify-selection-car-cutouts";
import { cn } from "@/lib/utils";

type CancelBookingCarCardProps = {
  details: CancelBookingCarDetails;
};

/**
 * Compact booked-car card — Figma Post-booking-experience / node 2709:17397.
 */
export function CancelBookingCarCard({ details }: CancelBookingCarCardProps) {
  const carCutoutSrc =
    details.colourId != null
      ? getModifySelectionCarCutoutForColour(details.colourId)
      : BOOKING_CONFIRMED_ASSETS.carCutout;
  const deliveryTextClass = details.isExpressDelivery
    ? BOOKING_EXPRESS_DELIVERY_TEXT_CLASS
    : BOOKING_STANDARD_DELIVERY_TEXT_CLASS;
  const deliveryIconSrc = details.isExpressDelivery
    ? BOOKING_CONFIRMED_ASSETS.expressDelivery
    : getBookingDeliveryIconSrc("standard");
  const deliveryParts = splitBookingDeliveryLine(details.deliveryLine);

  return (
    <div className="flex h-[110px] w-full items-center gap-3 overflow-hidden rounded-2xl bg-white card-elevated px-3">
      <div className="relative h-12 w-[84px] shrink-0 overflow-hidden">
        <Image
          src={carCutoutSrc}
          alt=""
          fill
          className="object-contain object-center"
          sizes="84px"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1 py-3">
        <p className="text-sm font-medium leading-5 text-[#121212]">{details.carTitle}</p>
        <p className="mt-0.5 text-xs leading-[18px] text-[#4b4b4b]">{details.carVariant}</p>
        <p className="text-xs leading-[18px] text-[#4b4b4b]">{details.carColor}</p>
        <div className="mt-1 flex items-center gap-1">
          <p className={cn("text-xs font-normal leading-[18px]", deliveryTextClass)}>
            {deliveryParts ? (
              <>
                {deliveryParts.prefix}
                <span>{deliveryParts.date}</span>
              </>
            ) : (
              details.deliveryLine
            )}
          </p>
          <span className="relative h-4 w-4 shrink-0" aria-hidden>
            <Image
              src={deliveryIconSrc}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
              unoptimized
              sizes="16px"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
