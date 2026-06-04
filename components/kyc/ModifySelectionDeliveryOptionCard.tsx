"use client";

import Image from "next/image";

import { splitBookingDeliveryLine } from "@/lib/experience-flow-content";
import { formatModifySelectionInr } from "@/lib/modify-selection-review-pay-content";
import { cn } from "@/lib/utils";

export type ModifySelectionDeliveryOptionCardProps = {
  selected: boolean;
  onSelect: () => void;
  deliveryLine: string;
  deliveryLineClass: string;
  iconSrc: string;
  priceInr: number;
};

/**
 * Express vs standard delivery row — shared by delivery sheet and review-and-pay.
 */
export function ModifySelectionDeliveryOptionCard({
  selected,
  onSelect,
  deliveryLine,
  deliveryLineClass,
  iconSrc,
  priceInr,
}: ModifySelectionDeliveryOptionCardProps) {
  const deliveryParts = splitBookingDeliveryLine(deliveryLine);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full flex-col rounded-xl border p-[15px] text-left transition-colors",
        selected ? "border-[#121212] bg-[#f5f5f5]" : "border-[#e8e8e8] bg-white",
      )}
    >
      <div className="flex items-center gap-1">
        <p className={cn("text-sm font-normal leading-5", deliveryLineClass)}>
          {deliveryParts ? (
            <>
              {deliveryParts.prefix}
              <span className="font-semibold">{deliveryParts.date}</span>
            </>
          ) : (
            deliveryLine
          )}
        </p>
        <span className="relative size-4 shrink-0" aria-hidden>
          <Image
            src={iconSrc}
            alt=""
            width={16}
            height={16}
            className="size-4 object-contain"
            unoptimized
            sizes="16px"
          />
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-5 text-[#121212]">
        {formatModifySelectionInr(priceInr)}
      </p>
    </button>
  );
}
