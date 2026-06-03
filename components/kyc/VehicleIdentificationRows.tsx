"use client";

import Image from "next/image";
import { useCallback } from "react";

import copyIcon from "@/assets/copy.svg";

type VehicleIdentificationRowsProps = {
  engineNo: string;
  chassisNo: string;
  /** When true, shows copy icons 8px after each number. */
  showCopyButtons?: boolean;
};

function VehicleIdentificationCopyLine({
  label,
  value,
  showCopyButton,
}: {
  label: string;
  value: string;
  showCopyButton: boolean;
}) {
  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(value).catch(() => {});
  }, [value]);

  return (
    <p className="text-xs leading-[18px] text-[#121212]">
      <span className="font-normal text-[#757575]">{label}:</span>{" "}
      {showCopyButton ? (
        <span className="inline-flex items-center gap-2 font-medium">
          {value}
          <button
            type="button"
            onClick={onCopy}
            aria-label={`Copy ${label}`}
            className="flex size-4 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-1"
          >
            <Image src={copyIcon} alt="" width={16} height={16} className="size-4 object-contain" unoptimized />
          </button>
        </span>
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </p>
  );
}

/**
 * Divider + engine / chassis rows (shared by celebration card and manage-booking sheet).
 */
export function VehicleIdentificationRows({
  engineNo,
  chassisNo,
  showCopyButtons = false,
}: VehicleIdentificationRowsProps) {
  return (
    <>
      <div className="mt-3 border-t border-[#E8E8E8]" role="separator" aria-hidden />
      <div className="mt-3 flex flex-col gap-2">
        <VehicleIdentificationCopyLine
          label="Engine no"
          value={engineNo}
          showCopyButton={showCopyButtons}
        />
        <VehicleIdentificationCopyLine
          label="Chassis no"
          value={chassisNo}
          showCopyButton={showCopyButtons}
        />
      </div>
    </>
  );
}
