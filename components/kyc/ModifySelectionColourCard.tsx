"use client";

import Image from "next/image";

import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import {
  BOOKING_EXPRESS_DELIVERY_TEXT_CLASS,
  BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
  getBookingDeliveryIconSrc,
} from "@/lib/experience-flow-content";
import {
  modifySelectionColourSavingsInr,
  type ModifySelectionColourOption,
} from "@/lib/modify-selection-colours-content";
import { cn } from "@/lib/utils";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

type ModifySelectionColourCardProps = {
  option: ModifySelectionColourOption;
  selected: boolean;
  onSelect?: () => void;
  /** Summary on the confirmation screen — not interactive. */
  readOnly?: boolean;
};

/**
 * Colour option row — Figma node 2672:10452 (modify-selection / change colour).
 */
export function ModifySelectionColourCard({
  option,
  selected,
  onSelect,
  readOnly = false,
}: ModifySelectionColourCardProps) {
  const savingsInr = modifySelectionColourSavingsInr(option);
  const deliveryIconSrc = option.isExpressDelivery
    ? BOOKING_CONFIRMED_ASSETS.expressDelivery
    : getBookingDeliveryIconSrc("standard");
  const deliveryTextClass = option.isExpressDelivery
    ? BOOKING_EXPRESS_DELIVERY_TEXT_CLASS
    : BOOKING_STANDARD_DELIVERY_TEXT_CLASS;

  const cardClassName = cn(
    "flex w-full gap-3 rounded-xl border p-[15px] text-left transition-colors card-elevated",
    selected ? "border-[#121212] bg-[#f5f5f5]" : "border-transparent bg-white",
  );

  const cardBody = (
    <>
      <div
        className="size-12 shrink-0 overflow-hidden rounded-lg bg-white card-elevated"
        aria-hidden
      >
        <div className="size-full" style={{ background: option.swatchBackground }} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 text-[#121212]">{option.name}</p>

        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span className="text-xs font-medium leading-[18px] text-[#121212]">
            {formatInr(option.ackoDrivePriceInr)}
          </span>
          <span className="text-[10px] font-normal leading-[14px] text-[#757575] line-through">
            {formatInr(option.onRoadListPriceInr)}
          </span>
          {savingsInr > 0 ? (
            <span className="text-[10px] font-medium leading-[14px] text-[#0fa457]">
              Save {formatInr(savingsInr)}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-1">
          <p className={cn("text-xs font-normal leading-[18px]", deliveryTextClass)}>
            {option.deliveryLine}
          </p>
          <span className="relative size-4 shrink-0" aria-hidden>
            <Image
              src={deliveryIconSrc}
              alt=""
              width={16}
              height={16}
              className="size-4 object-contain"
              unoptimized
              sizes="16px"
            />
          </span>
        </div>
      </div>
    </>
  );

  if (readOnly) {
    return <div className={cardClassName}>{cardBody}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cardClassName}
    >
      {cardBody}
    </button>
  );
}
