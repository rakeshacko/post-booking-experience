"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import infoIcon from "@/assets/Info.svg";
import bookingCancelledHero from "@/assets/Booking cancelled.svg";
import { CANCEL_BOOKING_SUCCESS_COPY } from "@/lib/cancel-booking-success-content";
import { WordByWordLine } from "@/components/payment/WordByWordLine";
import {
  SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS,
} from "@/components/ui/success-screen-layout";

const HEADLINE_WORD_DELAY_MS = 135;
const HERO_FADE_DURATION_CLASS = "duration-[450ms]";
const SUBLINE_TO_CTA_DELAY_MS = 240;

/**
 * User-initiated cancel success — celebration layout with fixed bottom CTA.
 */
export function CancelBookingSuccessScreen() {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heroArtReady, setHeroArtReady] = useState(false);
  const [showSubline, setShowSubline] = useState(false);
  const [showCta, setShowCta] = useState(false);

  const onHeadlineComplete = useCallback(() => {
    setShowSubline(true);
    window.setTimeout(() => setShowCta(true), SUBLINE_TO_CTA_DELAY_MS);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    if (mq.matches) {
      setHeroArtReady(true);
      setShowSubline(true);
      setShowCta(true);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => {
      setHeroArtReady((ready) => (ready ? ready : true));
    }, 2800);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  useEffect(() => {
    router.prefetch(CANCEL_BOOKING_SUCCESS_COPY.doneHref);
  }, [router]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f1f0f5] font-sans">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[240px] w-full max-w-[640px] bg-gradient-to-b from-[#f5f5f5] via-white/80 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[640px] min-h-0 flex-1 flex-col items-center justify-center px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-8">
        <div className="-translate-y-8 flex w-full flex-col items-center text-center">
          <div className="relative h-20 w-20 shrink-0">
            <Image
              src={bookingCancelledHero}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
              unoptimized
              onLoadingComplete={() => setHeroArtReady(true)}
            />
          </div>

          <div className={`mt-8 flex w-full flex-col items-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}>
            {reduceMotion ? (
              <h1 className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]">
                {CANCEL_BOOKING_SUCCESS_COPY.headline}
              </h1>
            ) : (
              <WordByWordLine
                as="h1"
                ariaLabel={CANCEL_BOOKING_SUCCESS_COPY.headline}
                text={CANCEL_BOOKING_SUCCESS_COPY.headline}
                wordDelayMs={HEADLINE_WORD_DELAY_MS}
                wordOpacityDurationClassName={HERO_FADE_DURATION_CLASS}
                className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                onComplete={onHeadlineComplete}
                startWhen={heroArtReady}
              />
            )}
            <p
              className={`max-w-sm text-sm font-normal leading-[22px] text-[#4b4b4b] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                showSubline ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!showSubline}
            >
              {CANCEL_BOOKING_SUCCESS_COPY.subline}
            </p>
          </div>

          <div
            className={`mt-6 flex w-full items-center gap-3 rounded-2xl bg-white card-elevated px-3 py-3 text-left transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
              showSubline ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!showSubline}
          >
            <span className="relative h-5 w-5 shrink-0">
              <Image
                src={infoIcon}
                alt=""
                fill
                className="object-contain"
                unoptimized
                sizes="20px"
              />
            </span>
            <p className="text-xs leading-[18px] text-[#121212]">
              {CANCEL_BOOKING_SUCCESS_COPY.infoBox}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-10 bg-white shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
          showCta ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!showCta}
      >
        <div className="mx-auto w-full max-w-[640px] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            className="primary-cta w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
            tabIndex={showCta ? 0 : -1}
            onClick={() => router.push(CANCEL_BOOKING_SUCCESS_COPY.doneHref)}
          >
            {CANCEL_BOOKING_SUCCESS_COPY.ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
