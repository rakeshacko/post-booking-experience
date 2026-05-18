"use client";

import Image from "next/image";

import closeIcon from "@/assets/Close.svg";

/**
 * Standard close control for bottom sheet header/absolute close buttons.
 * Always use this (or this asset) so sheets stay visually consistent.
 */
export function BottomSheetCloseIcon() {
  return (
    <Image
      src={closeIcon}
      alt=""
      width={24}
      height={24}
      className="block shrink-0"
      unoptimized
      aria-hidden
    />
  );
}
