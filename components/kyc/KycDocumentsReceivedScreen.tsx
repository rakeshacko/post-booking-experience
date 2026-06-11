"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";

import { DOWN_PAYMENT_SUCCESS_AUTO_REDIRECT_MS } from "@/components/payment/DownPaymentInstalmentSuccess";
import {
  BOOKING_PAYMENT_SUCCESS_HERO,
  BOOKING_SUCCESS_LOTTIE_TICK_DATA,
} from "@/components/payment/booking-success-shared";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";

type KycDocumentsReceivedScreenProps = {
  /** Auto-advance destination (KYC flow defaults to verification in progress). */
  okayHref?: string;
};

/**
 * Documents received — Figma Post-booking-experience / node 1880:6801.
 * No CTA; same Lottie + hero layout as payment received; auto-advances after 3s.
 */
export function KycDocumentsReceivedScreen({
  okayHref = "/kyc/verification-in-progress",
}: KycDocumentsReceivedScreenProps) {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      router.replace(okayHref);
    }, DOWN_PAYMENT_SUCCESS_AUTO_REDIRECT_MS);
    return () => window.clearTimeout(id);
  }, [okayHref, router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#f1f0f5] font-sans">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[240px] w-full max-w-[640px] -translate-x-1/2"
        aria-hidden
      >
        <Image
          src={BOOKING_PAYMENT_SUCCESS_HERO}
          alt=""
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 640px) 100vw, 640px"
          unoptimized
        />
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pb-8 pt-8">
        <div className="-translate-y-8 flex w-full flex-col items-center text-center">
          <div className="relative flex h-[144px] w-[144px] shrink-0 items-center justify-center">
            {BOOKING_SUCCESS_LOTTIE_TICK_DATA ? (
              <Lottie
                animationData={BOOKING_SUCCESS_LOTTIE_TICK_DATA}
                loop={false}
                className="h-full w-full"
                aria-label="Documents received animation"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-full bg-[#22c55e] text-4xl text-white shadow-[0_0_48px_rgba(34,197,94,0.45)]"
                aria-hidden
              >
                ✓
              </div>
            )}
          </div>
          <div
            className={`mt-2 flex w-full flex-col items-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}
          >
            <h1 className="text-[24px] font-semibold leading-7 tracking-tight text-[#1a1a1a]">
              Documents received
            </h1>
            <p className="max-w-sm text-sm font-normal leading-5 text-[#6b7280]">
              We are on it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
