"use client";

import Image from "next/image";

import arrowRightIcon from "@/assets/Arrow_right.svg";
import type { ModifySelectionCarModelOption } from "@/lib/modify-selection-car-models-content";

type ModifySelectionCarModelRowProps = {
  model: ModifySelectionCarModelOption;
  onSelect: () => void;
};

/**
 * Model list row — Figma 2686:11003 (48px thumb, name, chevron).
 */
export function ModifySelectionCarModelRow({ model, onSelect }: ModifySelectionCarModelRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[#fafafa] focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#121212]/20"
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f5]">
        <div className="relative h-7 w-10">
          <Image
            src={model.thumbnailSrc}
            alt=""
            fill
            className="object-contain"
            unoptimized
            sizes="40px"
          />
        </div>
      </div>
      <p className="min-w-0 flex-1 text-sm font-normal leading-5 text-[#121212]">{model.name}</p>
      <span className="relative size-5 shrink-0" aria-hidden>
        <Image
          src={arrowRightIcon}
          alt=""
          width={20}
          height={20}
          className="size-5 object-contain"
          unoptimized
          sizes="20px"
        />
      </span>
    </button>
  );
}
