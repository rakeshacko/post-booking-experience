"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getKycUploadSourceOptions,
  type KycUploadSource,
} from "@/components/kyc/kyc-upload-content";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import { BOTTOM_SHEET_MAX_HEIGHT_CLASS } from "@/components/ui/bottom-sheet-layout";

import chevronRightIcon from "@/assets/Chevron_right.svg";

/** Parity with `ManageBookingBottomSheet` / `ShiviIntroBottomSheet`. */
const SHEET_TRANSITION_MS = 280;

/** Space from title block bottom to first option row (32px). */
const TITLE_TO_LIST_GAP_CLASS = "gap-8";

type UploadSourceRowProps = {
  label: string;
  iconSrc: string | import("next/image").StaticImageData;
  onClick: () => void;
};

function UploadSourceRow({ label, iconSrc, onClick }: UploadSourceRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-0 text-left transition-colors hover:bg-[#fafafa] active:bg-[#f5f5f5]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]">
        <span className="relative h-6 w-6 shrink-0">
          <Image src={iconSrc} alt="" fill className="object-contain" unoptimized sizes="24px" />
        </span>
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#121212]">{label}</span>
      <span className="relative h-5 w-5 shrink-0">
        <Image
          src={chevronRightIcon}
          alt=""
          fill
          className="object-contain"
          unoptimized
          sizes="20px"
        />
      </span>
    </button>
  );
}

export type KycUploadSourceBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (source: KycUploadSource) => void;
  /** Loan application omits DigiLocker. */
  includeDigilocker?: boolean;
};

/**
 * Upload source picker — Figma Post-booking-experience / node 2503:11058.
 */
export function KycUploadSourceBottomSheet({
  open,
  onClose,
  onSelect,
  includeDigilocker = true,
}: KycUploadSourceBottomSheetProps) {
  const sourceOptions = getKycUploadSourceOptions(includeDigilocker);
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    setMounted(true);
    setAnimateIn(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open || !mounted) return;
    setAnimateIn(false);
    exitTimeoutRef.current = setTimeout(() => {
      exitTimeoutRef.current = null;
      setMounted(false);
    }, SHEET_TRANSITION_MS);
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const handleSelect = useCallback(
    (source: KycUploadSource) => {
      onSelect(source);
      onClose();
    },
    [onClose, onSelect],
  );

  if (!mounted) return null;

  return (
    <BottomSheetPortal>
      <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Dismiss"
      />
      <div
        className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col overflow-y-auto overflow-x-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kyc-upload-source-title"
      >
        <div
          className={`flex flex-col ${TITLE_TO_LIST_GAP_CLASS} px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6`}
        >
          <div className="flex shrink-0 items-start justify-between gap-5">
            <h2
              id="kyc-upload-source-title"
              className="min-w-0 flex-1 text-left text-[20px] font-semibold leading-[28px] tracking-[-0.1px] text-[#121212]"
            >
              How do you want to upload?
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="cta-ghost flex size-6 shrink-0 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
              aria-label="Close"
            >
              <BottomSheetCloseIcon />
            </button>
          </div>

          <div className="flex shrink-0 flex-col">
            {sourceOptions.map((option, index) => (
              <div key={option.id}>
                {index > 0 ? (
                  <hr className="my-5 border-0 border-t border-dashed border-[#e8e8e8]" />
                ) : null}
                <UploadSourceRow
                  label={option.label}
                  iconSrc={option.iconSrc}
                  onClick={() => handleSelect(option.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </BottomSheetPortal>
  );
}
