"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  BANK_SHEET_OPTIONS,
  PAYMENT_CHOOSE_ASSETS,
} from "@/components/payment/payment-choose-assets";
import {
  BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS,
  BOTTOM_SHEET_CTA_STRIP_TOP_CLASS,
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
} from "@/components/ui/bottom-sheet-layout";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";

/** Enter/exit slide duration — keep in sync with CSS transition duration below */
const SHEET_TRANSITION_MS = 280;

function RadioIndicator({ selected }: { selected: boolean }) {
  const src = selected ? PAYMENT_CHOOSE_ASSETS.radioOn : PAYMENT_CHOOSE_ASSETS.radioOff;
  return (
    <span className="relative h-4 w-4 shrink-0" aria-hidden>
      <Image src={src} alt="" fill className="object-contain" unoptimized sizes="16px" />
    </span>
  );
}

type BankSelectionBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (bankId: string) => void;
  /** When the sheet opens, pre-select this bank (e.g. current URL param). Defaults to HDFC. */
  initialBankId?: string;
};

/**
 * Choose banking partner — Figma Post-booking-experience / Bank selection (1941:12822).
 */
function resolveInitialBankId(initialBankId: string | undefined) {
  if (initialBankId && BANK_SHEET_OPTIONS.some((b) => b.id === initialBankId)) {
    return initialBankId;
  }
  return "hdfc";
}

export function BankSelectionBottomSheet({
  open,
  onClose,
  onConfirm,
  initialBankId,
}: BankSelectionBottomSheetProps) {
  const [selectedId, setSelectedId] = useState<string>(() => resolveInitialBankId(initialBankId));
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setSelectedId(resolveInitialBankId(initialBankId));
  }, [open, initialBankId]);

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

  const handleConfirm = useCallback(() => {
    onConfirm(selectedId);
  }, [onConfirm, selectedId]);

  if (!mounted) return null;

  return (
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
        className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-sheet-title"
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className={`min-h-0 flex-1 overflow-y-auto px-5 pt-6 ${BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2
                id="bank-sheet-title"
                className="text-xl font-semibold leading-7 tracking-tight text-[#121212]"
              >
                Choose your banking partner
              </h2>
              <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-[18px] text-[#757575]">
                <span>Finance through</span>
                <span className="inline-flex shrink-0 items-center">
                  <Image
                    src={PAYMENT_CHOOSE_ASSETS.ackoDriveLogo}
                    alt="ACKO Drive"
                    width={85}
                    height={14}
                    className="h-[14px] w-auto"
                    unoptimized
                    sizes="85px"
                  />
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cta-ghost -mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
              aria-label="Close"
            >
              <BottomSheetCloseIcon />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {BANK_SHEET_OPTIONS.map((bank) => {
              const selected = selectedId === bank.id;
              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedId(bank.id)}
                  aria-pressed={selected}
                  className={`relative flex min-h-16 w-full shrink-0 items-start gap-3 rounded-xl border px-[11px] py-3 pr-10 text-left transition-colors ${
                    selected ? "border-[#121212] bg-[#F5F5F5]" : "border-[#e8e8e8] bg-white"
                  }`}
                >
                  <span
                    className="pointer-events-none absolute right-3 top-3 shrink-0"
                    aria-hidden
                  >
                    <RadioIndicator selected={selected} />
                  </span>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                    <Image
                      src={bank.logoSrc}
                      alt=""
                      fill
                      className="object-contain p-0.5"
                      unoptimized
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5 text-[#121212]">{bank.name}</p>
                    <p className="mt-0.5 text-xs leading-[18px] text-[#4b4b4b]">
                      Interest rate from{" "}
                      <span className="font-medium text-[#121212]">{bank.rate}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          </div>

          <div
            className={`shrink-0 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] ${BOTTOM_SHEET_CTA_STRIP_TOP_CLASS}`}
          >
            <button type="button" onClick={handleConfirm} className="primary-cta w-full">
              Confirm banking partner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
