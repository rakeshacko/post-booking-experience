"use client";

import Image from "next/image";

import type { ModifySelectionCarBrandOption } from "@/lib/modify-selection-car-brands-content";
import { cn } from "@/lib/utils";

type ModifySelectionCarBrandCardProps = {
  brand: ModifySelectionCarBrandOption;
  selected: boolean;
  onSelect: () => void;
};

/**
 * Brand tile — Figma 2686:11633 (98×88, logo on #f5f5f5, 12px label).
 */
export function ModifySelectionCarBrandCard({
  brand,
  selected,
  onSelect,
}: ModifySelectionCarBrandCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex h-[88px] w-full flex-col items-center overflow-hidden rounded-xl border bg-white px-2 pb-2 pt-[7px] text-center transition-colors",
        selected ? "border-[#121212]" : "border-[#e8e8e8]",
      )}
    >
      <div className="flex h-12 w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]">
        <div className="relative size-8">
          <Image
            src={brand.logoSrc}
            alt=""
            fill
            className="object-contain"
            unoptimized
            sizes="32px"
          />
        </div>
      </div>
      <p className="mt-auto w-full text-xs font-normal leading-[18px] text-[#121212]">
        {brand.name}
      </p>
    </button>
  );
}
